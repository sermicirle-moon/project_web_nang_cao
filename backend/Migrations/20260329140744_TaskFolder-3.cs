using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class TaskFolder3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskFolder_AspNetUsers_UserId",
                table: "TaskFolder");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskLists_TaskFolder_FolderId",
                table: "TaskLists");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskFolder",
                table: "TaskFolder");

            migrationBuilder.RenameTable(
                name: "TaskFolder",
                newName: "TaskFolders");

            migrationBuilder.RenameIndex(
                name: "IX_TaskFolder_UserId",
                table: "TaskFolders",
                newName: "IX_TaskFolders_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskFolders",
                table: "TaskFolders",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskFolders_AspNetUsers_UserId",
                table: "TaskFolders",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskLists_TaskFolders_FolderId",
                table: "TaskLists",
                column: "FolderId",
                principalTable: "TaskFolders",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskFolders_AspNetUsers_UserId",
                table: "TaskFolders");

            migrationBuilder.DropForeignKey(
                name: "FK_TaskLists_TaskFolders_FolderId",
                table: "TaskLists");

            migrationBuilder.DropPrimaryKey(
                name: "PK_TaskFolders",
                table: "TaskFolders");

            migrationBuilder.RenameTable(
                name: "TaskFolders",
                newName: "TaskFolder");

            migrationBuilder.RenameIndex(
                name: "IX_TaskFolders_UserId",
                table: "TaskFolder",
                newName: "IX_TaskFolder_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_TaskFolder",
                table: "TaskFolder",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskFolder_AspNetUsers_UserId",
                table: "TaskFolder",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TaskLists_TaskFolder_FolderId",
                table: "TaskLists",
                column: "FolderId",
                principalTable: "TaskFolder",
                principalColumn: "Id");
        }
    }
}
