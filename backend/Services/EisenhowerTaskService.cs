using backend.Data;
using backend.Models;
using backend.Models.DTO.Eisenhower;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class EisenhowerTaskService : IEisenhowerTaskService
    {
        private readonly AppDbContext _context;

        public EisenhowerTaskService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<EisenhowerTaskResponseDTO>> GetUserTasksAsync(string userId)
        {
            var tasks = await _context.TaskItems
                // ? CH? L?Y TASK (0), B? QUA EVENT VÀ NOTE
                .Where(t => t.UserId == userId && !t.IsDeleted && !t.IsArchived && t.Type == ItemType.Task)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return tasks.Select(t => MapToResponse(t)).ToList();
        }

        public async Task<EisenhowerTaskResponseDTO> CreateTaskAsync(string userId, CreateEisenhowerTaskDTO dto)
        {
            int priority = 0;
            if (dto.Urgent && dto.Important) priority = 3;
            else if (!dto.Urgent && dto.Important) priority = 2;
            else if (dto.Urgent && !dto.Important) priority = 1;

            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                DueDate = dto.DueDate,
                Priority = priority,
                IsUrgent = dto.Urgent,
                IsImportant = dto.Important,
                UserId = userId,
                IsCompleted = false,
                IsArchived = false,
                Type = ItemType.Task
            };

            _context.TaskItems.Add(task);
            await _context.SaveChangesAsync();
            return MapToResponse(task);
        }

        public async Task<EisenhowerTaskResponseDTO?> UpdateTaskAsync(int id, string userId, UpdateEisenhowerTaskDTO dto)
        {
            var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return null;

            int priority = 0;
            if (dto.Urgent && dto.Important) priority = 3;
            else if (!dto.Urgent && dto.Important) priority = 2;
            else if (dto.Urgent && !dto.Important) priority = 1;

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.StartDate = dto.StartDate;
            task.DueDate = dto.DueDate;
            task.Priority = priority;
            task.IsUrgent = dto.Urgent;
            task.IsImportant = dto.Important;
            task.IsCompleted = dto.IsCompleted;

            await _context.SaveChangesAsync();
            return MapToResponse(task);
        }

        public async Task<bool> DeleteTaskAsync(int id, string userId)
        {
            var task = await _context.TaskItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return false;

            task.IsArchived = true;
            await _context.SaveChangesAsync();
            return true;
        }

        private EisenhowerTaskResponseDTO MapToResponse(TaskItem task)
        {
            string quadrant = "";
            if (task.IsImportant && task.IsUrgent) quadrant = "do";
            else if (task.IsImportant && !task.IsUrgent) quadrant = "schedule";
            else if (!task.IsImportant && task.IsUrgent) quadrant = "delegate";
            else quadrant = "eliminate";

            return new EisenhowerTaskResponseDTO
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Urgent = task.IsUrgent,
                IsCompleted = task.IsCompleted,
                Important = task.IsImportant,
                Quadrant = quadrant,
                CreatedAt = task.CreatedAt
            };
        }
    }
}