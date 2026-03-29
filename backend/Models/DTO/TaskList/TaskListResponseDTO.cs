namespace backend.Models.DTO.TaskList
{
    public class TaskListResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string? Icon { get; set; }

    }
}
