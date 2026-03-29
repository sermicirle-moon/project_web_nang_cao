using backend.Models.DTO.TaskList;

namespace backend.Services
{
    public interface ITaskListService
    {
        Task<SideBarDataDTO> GetSideBarDataAsync(string userId);

        Task<TaskListResponseDTO> CreateTaskListAsync(string userId, CreateTaskListDTO dto);
    }
}
