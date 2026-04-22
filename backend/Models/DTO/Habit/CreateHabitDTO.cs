namespace backend.Models.DTO.Habit
{
    public class CreateHabitDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public double Target { get; set; }
        public string Type { get; set; } = "bool";
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }
}