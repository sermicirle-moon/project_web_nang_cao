using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Data;
using backend.Models;
using backend.Models.DTO.Tasks;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Services
{
    public class TaskItemService : ITaskItemService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private const int FREE_TASK_LIMIT = 50;

        public TaskItemService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<TaskItemDetailDto> CreateAsync(CreateTaskItemDto dto, ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var isPremium = user.IsInRole("Premium");

            // --- 1. THỰC THI CÁC QUY TẮC GÓI CƯỚC (SUBSCRIPTION RULES) ---
            if (!isPremium)
            {
                // Giới hạn số lượng Task cho tài khoản Free
                var currentTaskCount = await _context.TaskItems.CountAsync(t => t.UserId == userId);
                if (currentTaskCount >= FREE_TASK_LIMIT)
                {
                    throw new SubscriptionException(
                        $"Bạn đã đạt giới hạn {FREE_TASK_LIMIT} công việc của gói Free. Hãy nâng cấp để tạo không giới hạn!",
                        "LIMIT_REACHED"
                    );
                }

                // Chặn tính năng tạo Subtask cho tài khoản Free
                if (dto.ParentTaskId.HasValue)
                {
                    throw new SubscriptionException(
                        "Tính năng Subtask chỉ dành cho thành viên Premium.",
                        "PRO_FEATURE_SUBTASK"
                    );
                }
            }

            // --- 2. XỬ LÝ NGHIỆP VỤ CHÍNH ---
            // Vì tên trường ở CreateTaskItemDto và TaskItem hiện tại đều là DueDate,
            // AutoMapper sẽ tự động ánh xạ chính xác mà không cần gán tay.
            var taskItem = _mapper.Map<TaskItem>(dto);
            taskItem.UserId = userId!;

            // Xử lý Tags (Chỉ gán những tag hợp lệ thuộc sở hữu của người dùng này)
            if (dto.TagIds != null && dto.TagIds.Any())
            {
                taskItem.Tags = await _context.Tags
                    .Where(t => dto.TagIds.Contains(t.Id) && t.UserId == userId)
                    .ToListAsync();
            }

            _context.TaskItems.Add(taskItem);
            await _context.SaveChangesAsync();

            // Trả về DTO chi tiết, lúc này trường DueDate sẽ mang giá trị chuẩn xác cho Frontend.
            return _mapper.Map<TaskItemDetailDto>(taskItem);
        }

        public async Task<IEnumerable<TaskItemSummaryDto>> GetTasksByListAsync(string userId, int listId)
        {
            var tasks = await _context.TaskItems
                .Where(t => t.UserId == userId &&
                            t.TaskListId == listId &&
                            !t.IsArchived &&
                            !t.IsCompleted &&
                            t.ParentTaskId == null)
                .OrderByDescending(t => t.Priority)
                .ThenBy(t => t.DueDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<TaskItemSummaryDto>>(tasks);
        }

        public async Task<IEnumerable<TaskItemSummaryDto>> GetTasksByFilterAsync(string userId, string filterName)
        {
            var query = _context.TaskItems.Where(t => t.UserId == userId && !t.IsArchived && t.ParentTaskId == null);
            var today = DateTime.Today;

            switch (filterName.ToLower())
            {
                case "inbox":
                    // HỘP THƯ ĐẾN: Nơi chứa mặc định cho các task mồ côi (Chưa có List)
                    query = query.Where(t => t.TaskListId == null);
                    break;

                case "today":
                    // HÔM NAY: Gom TẤT CẢ task có hạn là hôm nay (Bất kể từ Inbox hay từ các List tự tạo)
                    query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value.Date <= today);
                    break;

                case "next7days":
                    // 7 NGÀY TỚI: Gom TẤT CẢ task từ ngày mai đến 7 ngày sau (View chéo toàn hệ thống)
                    var week = today.AddDays(7);
                    query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value.Date <= week);
                    break;

                case "completed":
                    // Lấy tất cả task đã tick hoàn thành
                    query = _context.TaskItems.Where(t => t.UserId == userId && t.IsCompleted && !t.IsArchived && t.ParentTaskId == null);
                    break;

                case "trash":
                    // Thùng rác chứa các task đã xóa
                    query = _context.TaskItems.Where(t => t.UserId == userId && t.IsArchived && t.ParentTaskId == null);
                    break;

                case "blocked":
                    query = query.Where(t => false);
                    break;

                default:
                    query = query.Where(t => t.TaskListId == null);
                    break;
            }

            var tasks = await query
                .OrderByDescending(t => t.Priority)
                .ThenBy(t => t.DueDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<TaskItemSummaryDto>>(tasks);
        }

        public async Task<TaskItemDetailDto?> GetByIdAsync(int id, string userId)
        {
            var task = await _context.TaskItems
                .Include(t => t.Tags)
                .Include(t => t.SubTasks) // Load subtasks nếu cần hiện ở Detail bên phải
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            return _mapper.Map<TaskItemDetailDto>(task);
        }

        public async Task<TaskItemDetailDto?> UpdateAsync(int id, UpdateTaskItemDto dto, ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var isPremium = user.IsInRole("Premium");

            var existingTask = await _context.TaskItems
                .Include(t => t.Tags)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (existingTask == null) return null;

            // --- RULE UPDATE ---
            // Ví dụ: Nếu user Free cố tình sửa task thành subtask bằng cách thêm ParentTaskId
            if (!isPremium && dto.ParentTaskId.HasValue && existingTask.ParentTaskId == null)
            {
                throw new SubscriptionException("Nâng cấp Pro để chuyển đổi sang Subtask.", "PRO_FEATURE_SUBTASK");
            }

            // Map dữ liệu mới đè lên dữ liệu cũ
            _mapper.Map(dto, existingTask);
            existingTask.DueDate = dto.DueDate; // Đồng bộ cấu hình DB

            // Cập nhật Tags
            existingTask.Tags.Clear();
            if (dto.TagIds != null && dto.TagIds.Any())
            {
                existingTask.Tags = await _context.Tags
                    .Where(t => dto.TagIds.Contains(t.Id) && t.UserId == userId)
                    .ToListAsync();
            }

            await _context.SaveChangesAsync();
            return _mapper.Map<TaskItemDetailDto>(existingTask);
        }

        public async Task<bool> ToggleCompleteAsync(int id, string userId)
        {
            var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return false;

            task.IsCompleted = !task.IsCompleted;
            // Cập nhật enum Status theo cấu hình TaskItemConfiguration
            task.Status = task.IsCompleted ? Models.TaskStatus.Completed : Models.TaskStatus.Todo;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return false;

            _context.TaskItems.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}