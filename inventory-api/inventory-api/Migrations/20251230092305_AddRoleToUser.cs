using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace inventory_api.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameIndex(
                name: "idx_users_deleted",
                table: "users",
                newName: "idx_users_is_deleted");

            migrationBuilder.AddColumn<string>(
                name: "role",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "User");

            migrationBuilder.CreateIndex(
                name: "idx_users_role",
                table: "users",
                column: "role");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_users_role",
                table: "users");

            migrationBuilder.DropColumn(
                name: "role",
                table: "users");

            migrationBuilder.RenameIndex(
                name: "idx_users_is_deleted",
                table: "users",
                newName: "idx_users_deleted");
        }
    }
}
