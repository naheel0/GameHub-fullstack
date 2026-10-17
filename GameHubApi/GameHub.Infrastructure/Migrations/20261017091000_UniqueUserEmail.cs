using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameHub.Infrastructure.Migrations
{
    /// <summary>
    /// Closes the duplicate-account race (two concurrent registrations with the
    /// same email). Filtered on IsDeleted = 0 so a soft-deleted row never blocks
    /// re-registration of the address (register dedupe excludes deleted too).
    /// </summary>
    [Microsoft.EntityFrameworkCore.Migrations.Migration("20261017091000_UniqueUserEmail")]
    public partial class UniqueUserEmail : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]) WHERE [IsDeleted] = 0;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX [IX_Users_Email] ON [Users];");
        }
    }
}
