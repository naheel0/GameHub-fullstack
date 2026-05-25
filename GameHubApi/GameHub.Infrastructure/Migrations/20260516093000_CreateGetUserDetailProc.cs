using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameHub.Infrastructure.Migrations
{
    public partial class CreateGetUserDetailProc : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var sql = @"
CREATE PROCEDURE GetUserDetail
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.Id, u.FirstName, u.LastName, u.Email, u.Phone,
           u.Role, u.AccountStatus AS Status,
           (SELECT COUNT(1) FROM [Address] a WHERE a.UserId = u.Id) AS AddressCount,
           (SELECT COUNT(1) FROM [Purchases] p WHERE p.UserId = u.Id) AS OrderCount,
           ISNULL((SELECT SUM(p.Total) FROM [Purchases] p WHERE p.UserId = u.Id), 0) AS TotalSpent
    FROM [Users] u
    WHERE u.Id = @UserId AND (u.IsDeleted = 0 OR u.IsDeleted IS NULL);
END
";

            migrationBuilder.Sql(sql);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS GetUserDetail;");
        }
    }
}
