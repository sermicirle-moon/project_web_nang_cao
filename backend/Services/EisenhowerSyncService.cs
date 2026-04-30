using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

public class EisenhowerSyncService : IEisenhowerSyncService
{
    private readonly AppDbContext _context;
    public EisenhowerSyncService(AppDbContext context) => _context = context;

    // TaskItem -> EisenhowerTask (dùng khi tạo/sửa/xóa task ở Features)
    public async Task SyncFromTaskItemAsync(TaskItem task)
    {
        bool finalUrgent = task.IsUrgent;
        bool finalImportant = task.IsImportant;
        
        if (!finalUrgent && !finalImportant) {
            switch (task.Priority) {
                case 3: finalUrgent = true; finalImportant = true; break;
                case 2: finalUrgent = false; finalImportant = true; break;
                case 1: finalUrgent = true; finalImportant = false; break;
            }
        }
    
        var existing = await _context.EisenhowerTasks
        .FirstOrDefaultAsync(e => e.Id == task.EisenhowerSyncId);

        if (existing == null) {
            var eisen = new EisenhowerTask {
                Title = task.Title,
                Description = task.Description,
                StartDate = task.StartDate,
                DueDate = task.DueDate,
                Priority = task.Priority,
                IsCompleted = task.IsCompleted,
                IsDeleted = task.IsDeleted,
                Urgent = finalUrgent,     // Dùng giá trị đã map
                Important = finalImportant, // Dùng giá trị đã map
                UserId = task.UserId
            };
            _context.EisenhowerTasks.Add(eisen);
            await _context.SaveChangesAsync();
            task.EisenhowerSyncId = eisen.Id;
            _context.TaskItems.Update(task);
            await _context.SaveChangesAsync();
        }
        else {
            // PHẦN QUAN TRỌNG: Cập nhật các trạng thái từ Task sang Eisenhower
        existing.Title = task.Title;
        existing.Description = task.Description;
        existing.IsCompleted = task.IsCompleted; // Cập nhật trạng thái hoàn thành
        existing.IsDeleted = task.IsDeleted;     // Cập nhật trạng thái xóa
        existing.Priority = task.Priority;
        
        // Cập nhật lại Urgent/Important nếu cần
        existing.Urgent = finalUrgent;     // Dùng giá trị đã map
        existing.Important = finalImportant; // Dùng giá trị đã map

        _context.EisenhowerTasks.Update(existing);
        await _context.SaveChangesAsync();
        }
    }

    // EisenhowerTask -> TaskItem (chỉ dùng khi xóa/hoàn thành ở Eisenhower)
    public async Task SyncToTaskItemAsync(EisenhowerTask eisenTask)
    {
        var task = await _context.TaskItems
            .FirstOrDefaultAsync(t => t.EisenhowerSyncId == eisenTask.Id);
        if (task == null) return;

        task.IsCompleted = eisenTask.IsCompleted;
        task.IsDeleted = eisenTask.IsDeleted;
        task.Priority = eisenTask.Priority;
        task.IsUrgent = eisenTask.Urgent;
        task.IsImportant = eisenTask.Important;
        // Không đồng bộ các trường khác từ Eisenhower lên TaskItem
        _context.TaskItems.Update(task);
        await _context.SaveChangesAsync();
    }
}