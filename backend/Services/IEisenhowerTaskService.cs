using backend.Models.DTO.Eisenhower;

namespace backend.Services
{
    public interface IEisenhowerTaskService
    {
        Task<List<EisenhowerTaskResponseDTO>> GetUserTasksAsync(string userId);
        Task<EisenhowerTaskResponseDTO> CreateTaskAsync(string userId, CreateEisenhowerTaskDTO dto);
        Task<EisenhowerTaskResponseDTO?> UpdateTaskAsync(int id, string userId, UpdateEisenhowerTaskDTO dto);
        Task<bool> DeleteTaskAsync(int id, string userId);
    }
}