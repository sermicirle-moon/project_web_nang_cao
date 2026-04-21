using backend.Data;
using backend.Models;
using backend.Models.DTO.Habit;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class HabitService : IHabitService
    {
        private readonly AppDbContext _context;
        public HabitService(AppDbContext context) => _context = context;

        public async Task<Habit> CreateHabitAsync(string userId, CreateHabitDTO dto)
        {
            var habit = new Habit
            {
                Name = dto.Name,
                Unit = dto.Unit,
                Target = dto.Target,
                Type = dto.Type,
                Icon = dto.Icon,
                Color = dto.Color,
                UserId = userId
            };
            _context.Habits.Add(habit);
            await _context.SaveChangesAsync();
            return habit;
        }

        public async Task<List<Habit>> GetUserHabitsAsync(string userId)
        {
            return await _context.Habits
                .Where(h => h.UserId == userId)
                .OrderBy(h => h.Name)
                .ToListAsync();
        }

        public async Task<HabitLogResponseDTO> LogHabitAsync(string userId, HabitLogDTO dto)
        {
            // Kiểm tra habit thuộc user
            var habit = await _context.Habits.FirstOrDefaultAsync(h => h.Id == dto.HabitId && h.UserId == userId);
            if (habit == null) throw new Exception("Habit not found");

            var log = await _context.HabitLogs
                .FirstOrDefaultAsync(l => l.HabitId == dto.HabitId && l.Date == dto.Date);

            if (log == null)
            {
                log = new HabitLog
                {
                    HabitId = dto.HabitId,
                    Date = dto.Date,
                    Value = dto.Value,
                    Note = dto.Note
                };
                _context.HabitLogs.Add(log);
            }
            else
            {
                log.Value = dto.Value;
                log.Note = dto.Note;
                _context.HabitLogs.Update(log);
            }

            await _context.SaveChangesAsync();

            return new HabitLogResponseDTO
            {
                Id = log.Id,
                HabitId = log.HabitId,
                Date = log.Date,
                Value = log.Value,
                IsCompleted = log.Value >= habit.Target,
                Note = log.Note
            };
        }

        public async Task<HabitStatisticsDTO> GetStatisticsAsync(int habitId, string userId)
        {
            var habit = await _context.Habits.FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);
            if (habit == null) throw new Exception("Habit not found");

            // Lấy logs trong 90 ngày gần nhất (tối ưu)
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-90));
            var logs = await _context.HabitLogs
                .Where(l => l.HabitId == habitId && l.Date >= startDate)
                .OrderBy(l => l.Date)
                .ToListAsync();

            // Build dictionary để tra nhanh
            var logDict = logs.ToDictionary(l => l.Date, l => l.Value);

            // Tính streak hiện tại và best streak
            int currentStreak = 0, bestStreak = 0, streak = 0;
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var date = today;
            while (true)
            {
                if (logDict.TryGetValue(date, out var val) && val >= habit.Target)
                    currentStreak++;
                else break;
                date = date.AddDays(-1);
            }

            // Duyệt tất cả ngày có log để tính best streak
            streak = 0;
            var allDates = new HashSet<DateOnly>(logDict.Keys);
            if (allDates.Any())
            {
                var minDate = allDates.Min();
                var maxDate = allDates.Max();
                for (var d = minDate; d <= maxDate; d = d.AddDays(1))
                {
                    if (logDict.TryGetValue(d, out var val) && val >= habit.Target)
                        streak++;
                    else
                    {
                        bestStreak = Math.Max(bestStreak, streak);
                        streak = 0;
                    }
                }
                bestStreak = Math.Max(bestStreak, streak);
            }

            // Completion rate (30 ngày gần nhất)
            var last30Days = Enumerable.Range(0, 30)
                .Select(i => today.AddDays(-i))
                .ToList();
            int totalDays = last30Days.Count;
            int completedDays = 0;
            var dailyProgress = new List<DailyProgressDTO>();

            foreach (var day in last30Days.OrderBy(d => d))
            {
                bool completed = logDict.TryGetValue(day, out var val) && val >= habit.Target;
                if (completed) completedDays++;
                dailyProgress.Add(new DailyProgressDTO
                {
                    Date = day,
                    Value = logDict.GetValueOrDefault(day),
                    Completed = completed
                });
            }
            double completionRate = totalDays > 0 ? (double)completedDays / totalDays * 100 : 0;

            // Weekly stats
            var weeklyStats = GetWeeklyStats(logDict, habit.Target);

            // AI suggestion
            var suggestion = await GetAISuggestionAsync(habitId, userId);

            return new HabitStatisticsDTO
            {
                CurrentStreak = currentStreak,
                BestStreak = bestStreak,
                CompletionRate = Math.Round(completionRate, 1),
                TotalDaysTracked = totalDays,
                TotalCompletedDays = completedDays,
                WeeklyStats = weeklyStats,
                DailyProgress = dailyProgress,
                AISuggestion = suggestion
            };
        }

        private WeeklyStatsDTO GetWeeklyStats(Dictionary<DateOnly, double> logDict, double target)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var startOfThisWeek = today.AddDays(-(int)today.DayOfWeek + 1); // Monday
            var startOfLastWeek = startOfThisWeek.AddDays(-7);

            int thisWeekCompleted = 0, lastWeekCompleted = 0;

            for (int i = 0; i < 7; i++)
            {
                var day = startOfThisWeek.AddDays(i);
                if (logDict.TryGetValue(day, out var val) && val >= target)
                    thisWeekCompleted++;

                var lastDay = startOfLastWeek.AddDays(i);
                if (logDict.TryGetValue(lastDay, out var lastVal) && lastVal >= target)
                    lastWeekCompleted++;
            }

            double change = lastWeekCompleted == 0 ? (thisWeekCompleted > 0 ? 100 : 0)
                            : (double)(thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted * 100;

            return new WeeklyStatsDTO
            {
                ThisWeekCompleted = thisWeekCompleted,
                LastWeekCompleted = lastWeekCompleted,
                ChangePercent = Math.Round(change, 1)
            };
        }

        public async Task<string?> GetAISuggestionAsync(int habitId, string userId)
        {
            var habit = await _context.Habits.FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);
            if (habit == null) return null;

            var logs = await _context.HabitLogs
                .Where(l => l.HabitId == habitId && l.Date >= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-14)))
                .ToListAsync();

            int failCount = 0;
            var target = habit.Target;
            foreach (var day in Enumerable.Range(0, 7).Select(i => DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-i))))
            {
                var log = logs.FirstOrDefault(l => l.Date == day);
                if (log == null || log.Value < target) failCount++;
            }

            if (failCount >= 5)
                return $"Bạn đã bỏ lỡ {failCount}/7 ngày gần nhất của thói quen '{habit.Name}'. Hãy thử đặt thời gian cố định mỗi ngày để nhắc nhở!";

            if (failCount >= 3)
                return $"Gần đây bạn hơi lơ là '{habit.Name}'. Một bước nhỏ mỗi ngày sẽ tạo thói quen bền vững.";

            return null;
        }

        public async Task<List<HabitLogResponseDTO>> GetLogsAsync(int habitId, string userId, int days = 30)
        {
            var habit = await _context.Habits.FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);
            if (habit == null) return new List<HabitLogResponseDTO>();

            var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
            var logs = await _context.HabitLogs
                .Where(l => l.HabitId == habitId && l.Date >= startDate)
                .OrderByDescending(l => l.Date)
                .ToListAsync();

            return logs.Select(l => new HabitLogResponseDTO
            {
                Id = l.Id,
                HabitId = l.HabitId,
                Date = l.Date,
                Value = l.Value,
                IsCompleted = l.Value >= habit.Target,
                Note = l.Note
            }).ToList();
        }
        public async Task<Habit?> GetHabitByIdAsync(int habitId, string userId)
        {
            return await _context.Habits.FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);
        }
        public async Task<Habit?> UpdateHabitAsync(int habitId, string userId, UpdateHabitDTO dto)
        {
            var habit = await _context.Habits.FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);
            if (habit == null) return null;
            
            habit.Name = dto.Name;
            habit.Unit = dto.Unit;
            habit.Target = dto.Target;
            habit.Type = dto.Type;
            habit.Icon = dto.Icon;
            habit.Color = dto.Color;
            habit.UpdateAt = DateTimeOffset.UtcNow;
            
            await _context.SaveChangesAsync();
            return habit;
        }

        public async Task<bool> DeleteLogAsync(int habitId, string userId, DateOnly date)
        {
            var habit = await _context.Habits.FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);
            if (habit == null) return false;

            var log = await _context.HabitLogs.FirstOrDefaultAsync(l => l.HabitId == habitId && l.Date == date);
            if (log == null) return false;

            _context.HabitLogs.Remove(log);
            await _context.SaveChangesAsync();
            return true;
        }
        // Thêm phương thức này vào cuối class HabitService
        public async Task<bool> DeleteHabitAsync(int habitId, string userId)
        {
            var habit = await _context.Habits.FirstOrDefaultAsync(h => h.Id == habitId && h.UserId == userId);
            if (habit == null) return false;
            
            _context.Habits.Remove(habit);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}