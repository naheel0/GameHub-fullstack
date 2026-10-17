using FluentValidation;
using FluentValidation.AspNetCore;
using GameHub.Application;
using GameHub.Infrastructure;
using GameHubApi.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.OpenApi.Models;
using System.Threading.RateLimiting;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1. Add custom layers
builder.Services.AddApplication();
builder.Services.AddHttpContextAccessor();
builder.Services.AddInfrastructure(builder.Configuration);

// 2. JWT settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

// 3. Controllers
builder.Services.AddControllers().AddJsonOptions(opts =>
{
    opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// 3.1 FluentValidation (for QueryParameters)
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<GameHub.Application.Validators.QueryParametersValidator>();

// Configure API behavior: capture ModelState errors into HttpContext.Items for centralized formatting
builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var traceId = System.Diagnostics.Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;
        var problem = new Microsoft.AspNetCore.Mvc.ValidationProblemDetails(context.ModelState)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Bad Request",
            Detail = GameHub.Application.Resources.ExceptionMessages.BadRequest,
            Instance = context.HttpContext.Request.Path,
            Type = "https://httpstatuses.com/400"
        };

        problem.Extensions["traceId"] = traceId;
        problem.Extensions["errorCode"] = nameof(GameHub.Application.Resources.ExceptionMessages.BadRequest);

        return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(problem);
    };
});

// 4. CORS — single source of truth: configuration (Azure app settings in production,
// appsettings.Development.json locally). Supports both array format
// (AllowedOrigins__0, AllowedOrigins__1, …) and a comma-separated string.
var configuredOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? builder.Configuration.GetValue<string>("AllowedOrigins")
        ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        ?? Array.Empty<string>();

var allowedOrigins = configuredOrigins
    .Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCors", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders("X-Total-Count")
            .AllowCredentials();
    });
});

// 5. Authentication � JWT Bearer
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        RoleClaimType = ClaimTypes.Role,
        ClockSkew = TimeSpan.Zero
    };
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (string.IsNullOrEmpty(context.Token))
            {
                context.Token = context.Request.Cookies["accessToken"];
            }
            return Task.CompletedTask;
        },
        OnTokenValidated = async context =>
        {
            var jti = context.Principal?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti)?.Value;
            if (string.IsNullOrEmpty(jti)) return;
            var db = context.HttpContext.RequestServices.GetRequiredService<GameHub.Application.Common.interfaces.IApplicationDbContext>();
            // check blacklist
            var isBlacklisted = await EntityFrameworkQueryableExtensions.AnyAsync(db.BlacklistedTokens, b => b.Jti == jti);
            if (isBlacklisted)
            {
                context.Fail("Token revoked");
            }
        }
    };
});

// 6. Authorization
builder.Services.AddAuthorization();

// 6.1 Outbound HttpClient for Razorpay calls (one pooled client instead of a
// new HttpClient + Basic-auth header per call).
builder.Services.AddHttpClient("Razorpay", client =>
{
    client.BaseAddress = new Uri("https://api.razorpay.com/v1/");
    client.Timeout = TimeSpan.FromSeconds(30);
    var keyId = builder.Configuration["Razorpay:KeyId"];
    var keySecret = builder.Configuration["Razorpay:KeySecret"];
    if (!string.IsNullOrEmpty(keyId) && !string.IsNullOrEmpty(keySecret))
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Basic", Convert.ToBase64String(Encoding.ASCII.GetBytes($"{keyId}:{keySecret}")));
});

// 6.2 Rate limiting for credential endpoints (fixed window per client IP).
// Delete-account/blocked-IP escalation lives in hosting web.config/WAF if ever needed.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(1) }));
    options.AddPolicy("otp-send", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 3, Window = TimeSpan.FromMinutes(10) }));
});

// 7. Swagger with JWT support (lock icon)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "GameHub API", Version = "v1" });

    // Define the BearerAuth security scheme
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter 'Bearer' followed by your access token",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };
    c.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);

    // Require the security scheme for all endpoints
    var securityRequirement = new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    };
    c.AddSecurityRequirement(securityRequirement);
});

// Register application query handlers
builder.Services.AddScoped<GameHub.Application.Queries.GetGames.IGetGamesQueryHandler, GameHub.Application.Queries.GetGames.GetGamesQueryHandler>();

// Exception handler
builder.Services.AddSingleton<IGlobalExceptionHandler, ExceptionHandler>();

var app = builder.Build();

// 8. Pipeline
app.UseMiddleware<ExceptionMiddleware>();
// Run database migrations and seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GameHub.Infrastructure.Data.AppDbContext>();
    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        // Migrate failure no longer kills the app: it starts and every request
        // fails loudly with a 500 instead of serving nothing at all.
        app.Logger.LogError(ex, "Database migration failed at startup — API will serve requests but datastore calls will fail until the database is reachable.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("DefaultCors");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();