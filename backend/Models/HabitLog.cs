using System;
namespace backend.Models
{
    public class HabitLog : BaseEntity
    {
        public int HabitId { get; set; }
        public Habit Habit { get; set; } = null!;
        
        public DateOnly Date { get; set; } // chỉ lưu ngày, không giờ
        
        public double Value { get; set; } // giá trị đạt được trong ngày
        
        public string? Note { get; set; }
        
        // tính năng phụ
        public bool IsCompleted => Value >= Habit.Target;
    }
}