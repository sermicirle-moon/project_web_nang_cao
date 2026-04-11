namespace backend.Models.DTO.Focus
{
    public class FocusStatisticsDTO
    {
        // Tổng thời gian focus
        public long TotalFocusSeconds { get; set; }
        public long TotalFocusMinutes => TotalFocusSeconds / 60;

        // Số session
        public int TotalSessions { get; set; }

        // Trung bình mỗi session
        public double AvgFocusSecondsPerSession { get; set; }
        public int LongestSessionSeconds { get; set; }

        // Thời gian pause
        public long TotalPauseSeconds { get; set; }
        public double AvgPauseSecondsPerSession { get; set; }

        // Mức độ tập trung
        public double AvgPauseCountPerSession { get; set; }
        public int MaxPauseCountSessionId { get; set; }
        public int MaxPauseCount { get; set; }
        public int LongestContinuousFocusSeconds { get; set; } // session không pause

        // Streak (chuỗi ngày liên tục có focus)
        public int CurrentStreakDays { get; set; }
        public int BestStreakDays { get; set; }

        // Dữ liệu biểu đồ theo ngày
        public List<DailyFocusData> DailyData { get; set; }
    }

    public class DailyFocusData
    {
        public DateOnly Date { get; set; }
        public long TotalSeconds { get; set; }
        public int SessionCount { get; set; }
    }
}
