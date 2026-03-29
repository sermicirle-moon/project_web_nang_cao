namespace backend.Models.DTO.TaskList
{
    public class SideBarDataDTO
    {
        public List<FolderDTO> Folders { get; set; } = new List<FolderDTO>();
        public List<TaskListResponseDTO> StandAloneLists { get; set; } = new List<TaskListResponseDTO>();
    }
}
