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

        // Bơm "Đầu bếp" vào cho "Anh phục vụ" dùng
        public TaskListsController(ITaskListService taskListService)
        {
            _taskListService = taskListService;
        }

        // ==========================================================
        // API 1: Lấy dữ liệu Menu bên trái
        // Lệnh gọi: GET /api/tasklists/sidebar
        // ==========================================================
        [HttpGet("sidebar")]
        public async Task<IActionResult> GetSidebar()
        {
            // 1. Lấy ID của người dùng đang đăng nhập từ Thẻ thông hành (Token)
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // 2. Nhờ Đầu bếp lấy dữ liệu
            var sidebarData = await _taskListService.GetSideBarDataAsync(userId);

            // 3. Bưng ra cho khách kèm nụ cười (Mã 200 OK)
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
    }
}