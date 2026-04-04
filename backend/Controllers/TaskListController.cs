using backend.Models.DTO.TaskList;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")] // Đường dẫn sẽ là: zentask.com/api/tasklists
    [ApiController]
    [Authorize] // Bắt buộc phải có Thẻ thông hành (JWT Token) mới được gọi
    public class TaskListsController : ControllerBase
    {
        private readonly ITaskListService _taskListService;

        public TaskListsController(ITaskListService taskListService)
        {
            _taskListService = taskListService;
        }

        // ==========================================================
        // API 1: Lấy dữ liệu Menu bên trái
        // ==========================================================
        [HttpGet("sidebar")]
        public async Task<IActionResult> GetSidebar()
        {

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var sidebarData = await _taskListService.GetSideBarDataAsync(userId);

            return Ok(sidebarData);
        }

        // ==========================================================
        // API 2: Tạo Danh sách mới
        // Lệnh gọi: POST /api/tasklists
        // ==========================================================
        [HttpPost]
        public async Task<IActionResult> CreateList([FromBody] CreateTaskListDTO dto)
        {
            // 1. Nếu khách gửi lên tên List trống (bị kẹt ở DTO), báo lỗi ngay
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("🚨 CẢNH BÁO: Không lấy được UserId từ Token!");

                // Trả lỗi 400 về cho React luôn, không cho chạy xuống Database nữa (tránh lỗi 500)
                return BadRequest(new { Message = "Lỗi Token: Không tìm thấy ID người dùng. Bạn đã đăng xuất và đăng nhập lại chưa?" });
            }

            // 2. Nhờ Đầu bếp tạo List (và tự tạo Folder nếu cần)
            var newList = await _taskListService.CreateTaskListAsync(userId, dto);

            // 3. Trả về thông tin List vừa tạo thành công
            return Ok(newList);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateList(int id, [FromBody] UpdateTaskListDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _taskListService.UpdateTaskListAsync(id, userId, dto);
            if (!success) return NotFound(new { Message = "Không tìm thấy danh sách hoặc bạn không có quyền!" });

            return Ok(new { Message = "Cập nhật thành công!" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteList(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var success = await _taskListService.DeleteTaskListAsync(id, userId);
            if (!success) return NotFound(new { Message = "Không tìm thấy danh sách hoặc bạn không có quyền!" });

            return Ok(new { Message = "Xóa thành công!" });
        }
    }
}