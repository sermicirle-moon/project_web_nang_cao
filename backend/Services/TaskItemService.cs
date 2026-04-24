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

        public TaskItemService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<TaskItemDetailDto> CreateAsync(CreateTaskItemDto dto, ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

            var taskItem = _mapper.Map<TaskItem>(dto);
            taskItem.UserId = userId!;

            if (dto.TagIds != null && dto.TagIds.Any())
            {
                taskItem.Tags = await _context.Tags.Where(t => dto.TagIds.Contains(t.Id) && t.UserId == userId).ToListAsync();
            }

            _context.TaskItems.Add(taskItem);
            await _context.SaveChangesAsync();

            return _mapper.Map<TaskItemDetailDto>(taskItem);
        }

        public async Task<IEnumerable<TaskItemSummaryDto>> GetTasksByListAsync(string userId, int listId)
        {
            var tasks = await _context.TaskItems
                .Where(t => t.UserId == userId && t.TaskListId == listId && !t.IsArchived && !t.IsDeleted && !t.IsCompleted)
                .OrderByDescending(t => t.Priority).ThenBy(t => t.DueDate).ToListAsync();
            return _mapper.Map<IEnumerable<TaskItemSummaryDto>>(tasks);
        }

        public async Task<IEnumerable<TaskItemSummaryDto>> GetTasksByFilterAsync(string userId, string filterName)
        {
            var query = _context.TaskItems.Where(t => t.UserId == userId && !t.IsArchived);
            var today = DateTime.Today;

            switch (filterName.ToLower())
            {
                case "inbox": query = query.Where(t => t.TaskListId == null && !t.IsDeleted); break;
                case "today": query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value.Date <= today && !t.IsDeleted); break;
                case "next7days": var week = today.AddDays(7); query = query.Where(t => t.DueDate.HasValue && t.DueDate.Value.Date <= week && !t.IsDeleted); break;
                case "completed": query = _context.TaskItems.Where(t => t.UserId == userId && t.IsCompleted && !t.IsArchived && !t.IsDeleted); break;
                case "trash": query = _context.TaskItems.Where(t => t.UserId == userId && t.IsArchived); break;
                case "blocked": query = _context.TaskItems.Where(t => t.UserId == userId && t.IsDeleted && !t.IsArchived); break;
                default: query = query.Where(t => t.TaskListId == null && !t.IsDeleted); break;
            }

            var tasks = await query.OrderByDescending(t => t.Priority).ThenBy(t => t.DueDate).ToListAsync();
            return _mapper.Map<IEnumerable<TaskItemSummaryDto>>(tasks);
        }

        public async Task<TaskItemDetailDto?> GetByIdAsync(int id, string userId)
        {
            var task = await _context.TaskItems.Include(t => t.Tags).Include(t => t.SubTasks).FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            return _mapper.Map<TaskItemDetailDto>(task);
        }

        public async Task<TaskItemDetailDto?> UpdateAsync(int id, UpdateTaskItemDto dto, ClaimsPrincipal user)
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
            var existingTask = await _context.TaskItems.Include(t => t.Tags).FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (existingTask == null) return null;

            _mapper.Map(dto, existingTask);
            existingTask.DueDate = dto.DueDate;
            existingTask.Tags.Clear();

            if (dto.TagIds != null && dto.TagIds.Any())
            {
                existingTask.Tags = await _context.Tags.Where(t => dto.TagIds.Contains(t.Id) && t.UserId == userId).ToListAsync();
            }

            await _context.SaveChangesAsync();
            return _mapper.Map<TaskItemDetailDto>(existingTask);
        }

        public async Task<IEnumerable<TaskItemSummaryDto>> GetTasksByTagAsync(string userId, int tagId)
        {
            var tasks = await _context.TaskItems
                .Where(t => t.UserId == userId && !t.IsArchived && !t.IsDeleted && t.Tags.Any(tag => tag.Id == tagId))
                .OrderByDescending(t => t.Priority).ThenBy(t => t.DueDate).ToListAsync();
            return _mapper.Map<IEnumerable<TaskItemSummaryDto>>(tasks);
        }

        // =======================================================
        // MA THUẬT ĐỆ QUY: CẬP NHẬT TRẠNG THÁI CHO CẢ DÒNG HỌ
        // =======================================================
        private async Task UpdateStatusRecursiveAsync(int taskId, string userId, Action<TaskItem> updateAction)
        {
            var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
            if (task == null) return;

            updateAction(task);

            var subTasks = await _context.TaskItems.Where(t => t.ParentTaskId == taskId && t.UserId == userId).ToListAsync();
            foreach (var sub in subTasks)
            {
                await UpdateStatusRecursiveAsync(sub.Id, userId, updateAction);
            }
        }

        private async Task DeleteTaskRecursiveAsync(int taskId, string userId)
        {
            var subTasks = await _context.TaskItems.Where(t => t.ParentTaskId == taskId && t.UserId == userId).ToListAsync();
            foreach (var sub in subTasks) await DeleteTaskRecursiveAsync(sub.Id, userId);
            var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);
            if (task != null) _context.TaskItems.Remove(task);
        }

        public async Task<bool> ToggleCompleteAsync(int id, string userId)
        {
            var rootTask = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (rootTask == null) return false;
            bool newState = !rootTask.IsCompleted;

            await UpdateStatusRecursiveAsync(id, userId, t => {
                t.IsCompleted = newState;
                t.Status = newState ? Models.TaskStatus.Completed : Models.TaskStatus.Todo;
            });
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            await UpdateStatusRecursiveAsync(id, userId, t => t.IsArchived = true);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HardDeleteAsync(int id, string userId)
        {
            var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return false;
            await DeleteTaskRecursiveAsync(id, userId);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EmptyTrashAsync(string userId)
        {
            var archivedTasks = await _context.TaskItems.Where(t => t.UserId == userId && t.IsArchived).ToListAsync();
            if (!archivedTasks.Any()) return true;
            foreach (var task in archivedTasks) await DeleteTaskRecursiveAsync(task.Id, userId);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleWontDoAsync(int id, string userId)
        {
            var rootTask = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (rootTask == null) return false;
            bool newState = !rootTask.IsDeleted;
            await UpdateStatusRecursiveAsync(id, userId, t => t.IsDeleted = newState);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RestoreAsync(int id, string userId)
        {
            await UpdateStatusRecursiveAsync(id, userId, t => t.IsArchived = false);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MoveAsync(int id, int? targetListId, string userId)
        {
            var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return false;

            task.TaskListId = targetListId; // Đổi danh sách cha của nó
            await _context.SaveChangesAsync();
            return true;
        }
    }
}