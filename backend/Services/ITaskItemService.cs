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
        Task<bool> DeleteAsync(int id, string userId); // Xóa mềm
        Task<bool> HardDeleteAsync(int id, string userId); // Xóa vĩnh viễn
        Task<bool> EmptyTrashAsync(string userId); // Dọn toàn bộ thùng rác
        Task<bool> ToggleWontDoAsync(int id, string userId); // Đánh dấu không làm
        Task<bool> RestoreAsync(int id, string userId); // Khôi phục từ thùng rác
        Task<bool> MoveAsync(int id, int? targetListId, string userId);
    }
}