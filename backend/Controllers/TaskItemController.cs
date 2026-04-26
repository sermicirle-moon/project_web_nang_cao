using backend.Models.DTO.Tasks;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var task = await _taskService.GetByIdAsync(id, userId!);
            if (task == null) return NotFound();
            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTaskItemDto dto)
        {
            var result = await _taskService.CreateAsync(dto, User);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTaskItemDto dto)
        {
            var result = await _taskService.UpdateAsync(id, dto, User);
            if (result == null) return NotFound(new { message = "Không tìm thấy tác vụ." });
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

        // =====================================================================
        // CÁC ENDPOINT MỚI CHO VÒNG ĐỜI TASK (THÙNG RÁC, KHÔNG LÀM, KHÔI PHỤC)
        // =====================================================================

        [HttpDelete("{id}/hard")]
        public async Task<IActionResult> HardDelete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var success = await _taskService.HardDeleteAsync(id, userId!);
            if (!success) return NotFound(new { message = "Không tìm thấy tác vụ." });
            return Ok(new { message = "Đã xóa vĩnh viễn." });
        }

        [HttpDelete("trash/empty")]
        public async Task<IActionResult> EmptyTrash()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _taskService.EmptyTrashAsync(userId!);
            return Ok(new { message = "Đã dọn dẹp thùng rác." });
        }

        [HttpPatch("{id}/wontdo")]
        public async Task<IActionResult> ToggleWontDo(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var success = await _taskService.ToggleWontDoAsync(id, userId!);
            if (!success) return NotFound(new { message = "Không tìm thấy tác vụ." });
            return Ok(new { message = "Đã cập nhật trạng thái." });
        }

        [HttpPatch("{id}/restore")]
        public async Task<IActionResult> Restore(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var success = await _taskService.RestoreAsync(id, userId!);
            if (!success) return NotFound(new { message = "Không tìm thấy tác vụ." });
            return Ok(new { message = "Đã khôi phục tác vụ." });
        }

        public class MoveTaskDto { public int? TaskListId { get; set; } }

        [HttpPatch("{id}/move")]
        public async Task<IActionResult> MoveTask(int id, [FromBody] MoveTaskDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var success = await _taskService.MoveAsync(id, dto.TaskListId, userId!);
            if (!success) return NotFound(new { message = "Không tìm thấy tác vụ." });
            return Ok(new { message = "Đã chuyển danh sách." });
        }

        [HttpGet("calendar")]
        public async Task<IActionResult> GetCalendarTasks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tasks = await _taskService.GetCalendarTasksAsync(userId!);
            return Ok(tasks);
        }
    }
}