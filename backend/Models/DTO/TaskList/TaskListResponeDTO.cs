namespace backend.Models.DTO.TaskList
{
    public class TaskListResponeDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string? Icon { get; set; }

    }
}
