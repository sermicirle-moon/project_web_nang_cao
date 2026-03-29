using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTO.TaskList
{
    public class CreateTaskListDTO
    {
        [Required(ErrorMessage = "Tên danh sách không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public string? FolderName { get; set; }

    }
}
