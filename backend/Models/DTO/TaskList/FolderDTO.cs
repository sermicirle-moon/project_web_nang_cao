namespace backend.Models.DTO.TaskList
{
    public class FolderDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }= string.Empty;
        public List<TaskListResponseDTO> Lists { get; set; } = new List<TaskListResponseDTO>();

    }
}
