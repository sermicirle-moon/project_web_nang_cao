namespace backend.Models.DTO.Habit
{
    public class HabitLogDTO
    {
        public int HabitId { get; set; }
        public DateOnly Date { get; set; }
        public double Value { get; set; }
        public string? Note { get; set; }
    }
    
    public class HabitLogResponseDTO
    {
        public int Id { get; set; }
        public int HabitId { get; set; }
        public DateOnly Date { get; set; }
        public double Value { get; set; }
        public bool IsCompleted { get; set; }
        public string? Note { get; set; }
    }
}