using backend.Models.DTO.Tasks;
using System.Security.Claims;

namespace backend.Services
{
    public interface ITaskItemService
    {
        Task<IEnumerable<TaskItemSummaryDto>> GetTasksByListAsync(string userId, int listId);
        Task<IEnumerable<TaskItemSummaryDto>> GetTasksByFilterAsync(string userId, string filterName);
        Task<TaskItemDetailDto?> GetByIdAsync(int id, string userId);
        Task<IEnumerable<TaskItemSummaryDto>> GetTasksByTagAsync(string userId, int tagId);
        Task<TaskItemDetailDto> CreateAsync(CreateTaskItemDto dto, ClaimsPrincipal user);
        Task<TaskItemDetailDto?> UpdateAsync(int id, UpdateTaskItemDto dto, ClaimsPrincipal user);
        Task<bool> ToggleCompleteAsync(int id, string userId);
        Task<bool> DeleteAsync(int id, string userId); 
        Task<bool> HardDeleteAsync(int id, string userId); 
        Task<bool> EmptyTrashAsync(string userId); 
        Task<bool> ToggleWontDoAsync(int id, string userId);
        Task<bool> RestoreAsync(int id, string userId);
        Task<bool> MoveAsync(int id, int? targetListId, string userId);
        Task<IEnumerable<TaskItemSummaryDto>> GetCalendarTasksAsync(string userId);
    }
}