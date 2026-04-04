using backend.Models.DTO.TaskList;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")] // Tương đương: /api/taskfolders
    [ApiController]
    [Authorize] // Bắt buộc đăng nhập
    public class TaskFoldersController : ControllerBase
    {
        private readonly ITaskListService _taskListService;

        public TaskFoldersController(ITaskListService taskListService)
        {
            _taskListService = taskListService;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFolder(int id, [FromBody] UpdateTaskFolderDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _taskListService.UpdateTaskFolderAsync(id, userId, dto);
            if (!success) return NotFound();

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFolder(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _taskListService.DeleteTaskFolderAsync(id, userId);
            if (!success) return NotFound();

            return Ok();
        }
    }
}