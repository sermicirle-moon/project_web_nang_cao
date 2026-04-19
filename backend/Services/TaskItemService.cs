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

            // --- THỰC THI RULE ---
            if (!isPremium)
            {
                // 1. Giới hạn số lượng Task
                var currentTaskCount = await _context.TaskItems.CountAsync(t => t.UserId == userId);
                if (currentTaskCount >= FREE_TASK_LIMIT)
                {
                    throw new SubscriptionException(
                        $"Bạn đã đạt giới hạn {FREE_TASK_LIMIT} công việc của gói Free. Hãy nâng cấp để tạo không giới hạn!",
                        "LIMIT_REACHED"
                    );
                }

                // 2. Chặn tính năng tạo Subtask cho người dùng Free
                if (dto.ParentTaskId.HasValue)
                {
                    throw new SubscriptionException(
                        "Tính năng Subtask chỉ dành cho thành viên Premium.",
                        "PRO_FEATURE_SUBTASK"
                    );
                }
            }

            // --- XỬ LÝ NGHIỆP VỤ CHÍNH ---
            var taskItem = _mapper.Map<TaskItem>(dto);
            taskItem.UserId = userId!;

            // Đồng bộ cột DueDate từ EndDate (theo Configuration của bạn)
            taskItem.DueDate = dto.EndDate;

            // Xử lý Tags (Chỉ gán những tag thuộc về User này)
            if (dto.TagIds != null && dto.TagIds.Any())
            {
                taskItem.Tags = await _context.Tags
                    .Where(t => dto.TagIds.Contains(t.Id) && t.UserId == userId)
                    .ToListAsync();
            }

            _context.TaskItems.Add(taskItem);
            await _context.SaveChangesAsync();

            return _mapper.Map<TaskItemDetailDto>(taskItem);
        }

        public async Task<IEnumerable<TaskItemSummaryDto>> GetAllSummaryAsync(string userId)
        {
            return await _context.TaskItems
                .Where(t => t.UserId == userId && !t.IsArchived && t.ParentTaskId == null)
                .OrderByDescending(t => t.Priority)
                .ThenBy(t => t.DueDate)
                .ProjectTo<TaskItemSummaryDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
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
            existingTask.DueDate = dto.EndDate; // Đồng bộ cấu hình DB

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