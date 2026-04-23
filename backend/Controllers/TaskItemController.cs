using backend.Models.DTO.Tasks;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; // Nhớ có dòng này để dùng ClaimTypes

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/taskitem")]
    public class TaskItemController : ControllerBase
    {
        private readonly ITaskItemService _taskService;
        public TaskItemController(ITaskItemService taskService) => _taskService = taskService;

        [HttpGet("list/{listId}")]
        public async Task<IActionResult> GetByList(int listId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Ok(await _taskService.GetTasksByListAsync(userId!, listId));
        }

        [HttpGet("filter/{filterName}")]
        public async Task<IActionResult> GetByFilter(string filterName)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Ok(await _taskService.GetTasksByFilterAsync(userId!, filterName));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTaskItemDto dto)
        {
            var result = await _taskService.CreateAsync(dto, User);
            return Ok(result);
        }

        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> ToggleComplete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var success = await _taskService.ToggleCompleteAsync(id, userId!);

            if (!success) return NotFound(new { message = "Không tìm thấy tác vụ hoặc bạn không có quyền." });
            return Ok(new { message = "Cập nhật trạng thái thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var success = await _taskService.DeleteAsync(id, userId!);

            if (!success) return NotFound(new { message = "Không tìm thấy tác vụ hoặc bạn không có quyền." });
            return Ok(new { message = "Xóa tác vụ thành công" });
        }

        [HttpGet("tag/{tagId}")]
        public async Task<IActionResult> GetByTag(int tagId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Ok(await _taskService.GetTasksByTagAsync(userId!, tagId));
        }
    }
}