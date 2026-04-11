using backend.Models;
using backend.Models.DTO.Focus;

namespace backend.Services
{
    // Services/IFocusSessionService.cs
    public interface IFocusSessionService
    {
        Task<FocusSession> StartSessionAsync(string userId, int? taskId, string sessionType);
        Task UpdatePauseInfoAsync(int sessionId, string userId, int pausedDurationSeconds);
        Task EndSessionAsync(int sessionId, string userId, int finalDurationSeconds, int totalPauseSeconds, int pauseCount, bool isCompleted);
        Task<FocusStatisticsDTO> GetStatisticsAsync(string userId, string period = "week"); // period: day, week, month, all
    }
}
