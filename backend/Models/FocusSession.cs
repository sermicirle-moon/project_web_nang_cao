using System;
namespace backend.Models
{
    public class FocusSession : BaseEntity
    {
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        
        public int? TaskId { get; set; }          // Liên kết với TaskItem (nullable)
        public TaskItem? Task { get; set; }

        public DateTime StartTime { get; set; }   // Thời điểm bắt đầu session (UTC)
        public DateTime? EndTime { get; set; }    // Thời điểm kết thúc (khi user stop hoặc timer kết thúc)
        
        public int DurationSeconds { get; set; }  // Tổng thời gian focus thực tế (không tính pause)
        public int PauseCount { get; set; }       // Số lần nhấn pause trong session
        public int TotalPauseSeconds { get; set; } // Tổng thời gian pause (giây)
        
        // Có thể lưu thêm thông tin phiên
        public string? SessionType { get; set; }  // "focus", "shortBreak", "longBreak"
        public bool IsCompleted { get; set; }     // Session kết thúc tự nhiên hay bị hủy
    }
}