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
            var tasks = await _context.EisenhowerTasks
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return tasks.Select(t => MapToResponse(t)).ToList();
        }

        public async Task<EisenhowerTaskResponseDTO> CreateTaskAsync(string userId, CreateEisenhowerTaskDTO dto)
        {
            var task = new EisenhowerTask
            {
                Title = dto.Title,
                Description = dto.Description,
                DueDate = dto.DueDate,
                Urgent = dto.Urgent,
                Important = dto.Important,
                UserId = userId
            };
            _context.EisenhowerTasks.Add(task);
            await _context.SaveChangesAsync();
            return MapToResponse(task);
        }

        public async Task<EisenhowerTaskResponseDTO?> UpdateTaskAsync(int id, string userId, UpdateEisenhowerTaskDTO dto)
        {
            var task = await _context.EisenhowerTasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return null;

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.DueDate = dto.DueDate;
            task.Urgent = dto.Urgent;
            task.Important = dto.Important;

            await _context.SaveChangesAsync();
            return MapToResponse(task);
        }

        public async Task<bool> DeleteTaskAsync(int id, string userId)
        {
            var task = await _context.EisenhowerTasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (task == null) return false;

            _context.EisenhowerTasks.Remove(task);
            await _context.SaveChangesAsync();
            return true;
        }

        private EisenhowerTaskResponseDTO MapToResponse(EisenhowerTask task)
        {
            string quadrant = "";
            if (task.Important && task.Urgent) quadrant = "Do";
            else if (task.Important && !task.Urgent) quadrant = "Schedule";
            else if (!task.Important && task.Urgent) quadrant = "Delegate";
            else quadrant = "Eliminate";

            return new EisenhowerTaskResponseDTO
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Urgent = task.Urgent,
                Important = task.Important,
                Quadrant = quadrant,
                CreatedAt = task.CreatedAt
            };
        }
    }
}