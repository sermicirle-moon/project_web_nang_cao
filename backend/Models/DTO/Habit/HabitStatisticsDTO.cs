namespace backend.Models.DTO.Habit
{
    public class HabitStatisticsDTO
    {
        public int CurrentStreak { get; set; }
        public int BestStreak { get; set; }
        public double CompletionRate { get; set; } // %
        public int TotalDaysTracked { get; set; }
        public int TotalCompletedDays { get; set; }
        
        public WeeklyStatsDTO WeeklyStats { get; set; } = new();
        public List<DailyProgressDTO> DailyProgress { get; set; } = new();
        public string? AISuggestion { get; set; }
    }
    
    public class WeeklyStatsDTO
    {
        public int ThisWeekCompleted { get; set; }
        public int LastWeekCompleted { get; set; }
        public double ChangePercent { get; set; }
    }
    
    public class DailyProgressDTO
    {
        public DateOnly Date { get; set; }
        public double Value { get; set; }
        public bool Completed { get; set; }
    }
}