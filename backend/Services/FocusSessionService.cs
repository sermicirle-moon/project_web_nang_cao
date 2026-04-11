// Services/FocusSessionService.cs
using backend.Data;
using backend.Models;
using backend.Models.DTO.Focus;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class FocusSessionService : IFocusSessionService
    {
        private readonly AppDbContext _context;

        public FocusSessionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<FocusSession> StartSessionAsync(string userId, int? taskId, string sessionType)
        {
            var session = new FocusSession
            {
                UserId = userId,
                TaskId = taskId,
                StartTime = DateTime.UtcNow,
                SessionType = sessionType,
                DurationSeconds = 0,
                PauseCount = 0,
                TotalPauseSeconds = 0,
                IsCompleted = false
            };
            _context.FocusSessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task UpdatePauseInfoAsync(int sessionId, string userId, int pausedDurationSeconds)
        {
            var session = await _context.FocusSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);
            if (session == null) return;
            session.PauseCount++;
            session.TotalPauseSeconds += pausedDurationSeconds;
            await _context.SaveChangesAsync();
        }

        public async Task EndSessionAsync(int sessionId, string userId, int finalDurationSeconds,
            int totalPauseSeconds, int pauseCount, bool isCompleted)
        {
            var session = await _context.FocusSessions
                .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId);
            if (session == null) return;
            session.EndTime = DateTime.UtcNow;
            session.DurationSeconds = finalDurationSeconds;
            session.TotalPauseSeconds = totalPauseSeconds;
            session.PauseCount = pauseCount;
            session.IsCompleted = isCompleted;
            await _context.SaveChangesAsync();
        }

        public async Task<FocusStatisticsDTO> GetStatisticsAsync(string userId, string period = "week")
        {
            var now = DateTime.UtcNow;
            DateTime startDate = period switch
            {
                "day" => now.Date,
                "week" => now.Date.AddDays(-(int)now.DayOfWeek),
                "month" => new DateTime(now.Year, now.Month, 1),
                _ => DateTime.MinValue
            };

            var query = _context.FocusSessions
                .Where(s => s.UserId == userId && s.EndTime != null);

            if (period != "all")
                query = query.Where(s => s.StartTime >= startDate);

            var sessions = await query.ToListAsync();

            if (!sessions.Any())
                return new FocusStatisticsDTO();

            // Tổng hợp cơ bản
            var totalFocusSec = sessions.Sum(s => s.DurationSeconds);
            var totalSessions = sessions.Count;
            var avgFocus = totalSessions > 0 ? (double)totalFocusSec / totalSessions : 0;
            var longest = sessions.Max(s => s.DurationSeconds);
            var totalPause = sessions.Sum(s => s.TotalPauseSeconds);
            var avgPause = totalSessions > 0 ? (double)totalPause / totalSessions : 0;
            var avgPauseCount = totalSessions > 0 ? sessions.Average(s => s.PauseCount) : 0;

            // Session bị pause nhiều nhất
            var maxPauseSession = sessions.OrderByDescending(s => s.PauseCount).FirstOrDefault();
            int maxPauseCount = maxPauseSession?.PauseCount ?? 0;
            int maxPauseSessionId = maxPauseSession?.Id ?? 0;

            // Thời gian focus liên tục dài nhất (session không pause)
            var longestContinuous = sessions.Where(s => s.PauseCount == 0)
                                            .Select(s => s.DurationSeconds)
                                            .DefaultIfEmpty(0)
                                            .Max();

            // Streak tính theo ngày
            var sessionDates = sessions.Select(s => s.StartTime.Date).Distinct().OrderBy(d => d).ToList();
            int currentStreak = 0, bestStreak = 0, streak = 0;
            DateTime? prevDate = null;
            foreach (var date in sessionDates)
            {
                if (prevDate == null || date.Date == prevDate.Value.AddDays(1))
                    streak++;
                else
                    streak = 1;
                bestStreak = Math.Max(bestStreak, streak);
                prevDate = date;
                if (date.Date == DateTime.UtcNow.Date)
                    currentStreak = streak;
            }
            if (sessionDates.LastOrDefault() != DateTime.UtcNow.Date)
                currentStreak = 0;

            // Dữ liệu theo ngày cho biểu đồ
            var dailyData = sessions
                .GroupBy(s => DateOnly.FromDateTime(s.StartTime))
                .Select(g => new DailyFocusData
                {
                    Date = g.Key,
                    TotalSeconds = g.Sum(s => s.DurationSeconds),
                    SessionCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            return new FocusStatisticsDTO
            {
                TotalFocusSeconds = totalFocusSec,
                TotalSessions = totalSessions,
                AvgFocusSecondsPerSession = avgFocus,
                LongestSessionSeconds = longest,
                TotalPauseSeconds = totalPause,
                AvgPauseSecondsPerSession = avgPause,
                AvgPauseCountPerSession = avgPauseCount,
                MaxPauseCountSessionId = maxPauseSessionId,
                MaxPauseCount = maxPauseCount,
                LongestContinuousFocusSeconds = longestContinuous,
                CurrentStreakDays = currentStreak,
                BestStreakDays = bestStreak,
                DailyData = dailyData
            };
        }
    }
}