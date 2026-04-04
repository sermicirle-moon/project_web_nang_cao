using backend.Models.DTO.TaskList;

namespace backend.Services
{
    public interface ITaskListService
    {
        Task<SideBarDataDTO> GetSideBarDataAsync(string userId);

        Task<TaskListResponseDTO> CreateTaskListAsync(string userId, CreateTaskListDTO dto);

        Task<bool> UpdateTaskListAsync(int listId, string userId, UpdateTaskListDTO dto);
        Task<bool> DeleteTaskListAsync(int listId, string userId);
        Task<bool> UpdateTaskFolderAsync(int folderId, string userId, UpdateTaskFolderDTO dto);
        Task<bool> DeleteTaskFolderAsync(int folderId, string userId);

    }
}
