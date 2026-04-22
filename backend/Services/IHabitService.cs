using backend.Models;
using backend.Models.DTO.Habit;

namespace backend.Services
{
    public interface IHabitService
    {
        Task<Habit> CreateHabitAsync(string userId, CreateHabitDTO dto);
        Task<Habit?> GetHabitByIdAsync(int habitId, string userId);
        Task<List<Habit>> GetUserHabitsAsync(string userId);
        Task<HabitLogResponseDTO> LogHabitAsync(string userId, HabitLogDTO dto);
        Task<HabitStatisticsDTO> GetStatisticsAsync(int habitId, string userId);
        Task<List<HabitLogResponseDTO>> GetLogsAsync(int habitId, string userId, int days = 30);
        Task<Habit?> UpdateHabitAsync(int habitId, string userId, UpdateHabitDTO dto);
        Task<bool> DeleteHabitAsync(int habitId, string userId);
        Task<bool> DeleteLogAsync(int habitId, string userId, DateOnly date);
        Task<string?> GetAISuggestionAsync(int habitId, string userId);
    }
}