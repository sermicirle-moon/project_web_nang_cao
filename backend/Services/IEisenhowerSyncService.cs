using backend.Models;

public interface IEisenhowerSyncService
{
    Task SyncFromTaskItemAsync(TaskItem task);
    Task SyncToTaskItemAsync(EisenhowerTask eisenTask);
}