using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameHub.Infrastructure.Migrations
{
    /// <summary>
    /// Users.Role and Users.AccountStatus are int columns, but AdminUserDetailDto
    /// Role/Status are strings ("Admin"/"User", "Active"/"Blocked") — the original
    /// proc returned the raw ints, so detail reads could not materialize. Map the
    /// enum integers to their wire names right in the proc (Role: User=0, Admin=1;
    /// AccountStatus: Active=0, Blocked=1, per GameHub.Domain.Enums).
    /// </summary>
    [Microsoft.EntityFrameworkCore.Migrations.Migration("20261017090000_AlterGetUserDetailProc")]
    public partial class AlterGetUserDetailProc : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var sql = @"
ALTER PROCEDURE GetUserDetail
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.Id, u.FirstName, u.LastName, u.Email, u.Phone,
           CASE u.Role WHEN 1 THEN 'Admin' ELSE 'User' END AS Role,
           CASE u.AccountStatus WHEN 1 THEN 'Blocked' ELSE 'Active' END AS Status,
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
            var sql = @"
ALTER PROCEDURE GetUserDetail
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
    }
}
