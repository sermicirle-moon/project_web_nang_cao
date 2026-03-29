using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TaskFolder2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FolderId",
                table: "TaskLists",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TaskFolder",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdateAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskFolder", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskFolder_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaskLists_FolderId",
                table: "TaskLists",
                column: "FolderId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskFolder_UserId",
                table: "TaskFolder",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskLists_TaskFolder_FolderId",
                table: "TaskLists",
                column: "FolderId",
                principalTable: "TaskFolder",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskLists_TaskFolder_FolderId",
                table: "TaskLists");

            migrationBuilder.DropTable(
                name: "TaskFolder");

            migrationBuilder.DropIndex(
                name: "IX_TaskLists_FolderId",
                table: "TaskLists");

            migrationBuilder.DropColumn(
                name: "FolderId",
                table: "TaskLists");
        }
    }
}
