using backend.Models.DTO.Tasks;
using System.Security.Claims;

namespace backend.Services
{
    public interface ITaskItemService
    {
        Task<IEnumerable<TaskItemSummaryDto>> GetAllSummaryAsync(string userId);
        Task<TaskItemDetailDto?> GetByIdAsync(int id, string userId);
        Task<TaskItemDetailDto> CreateAsync(CreateTaskItemDto dto, ClaimsPrincipal user);
        Task<TaskItemDetailDto?> UpdateAsync(int id, UpdateTaskItemDto dto, ClaimsPrincipal user);
        Task<bool> DeleteAsync(int id, string userId);
        Task<bool> ToggleCompleteAsync(int id, string userId);
    }
}