namespace backend.Models.DTO.TaskList
{
    public class UpdateTaskListDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? FolderName { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }

    }
}
