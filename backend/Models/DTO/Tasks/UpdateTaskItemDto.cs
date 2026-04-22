using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTO.Tasks
{
    public class UpdateTaskItemDto
    {
        [Required(ErrorMessage = "Tiêu đề công việc không được để trống")]
        [MaxLength(255, ErrorMessage = "Tiêu đề không được vượt quá 255 ký tự")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000, ErrorMessage = "Mô tả không được vượt quá 2000 ký tự")]
        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }

        public int Priority { get; set; } = 0;
        public bool IsCompleted { get; set; }

        public int? TaskListId { get; set; }
        public int? ParentTaskId { get; set; }
        public List<int> TagIds { get; set; } = new List<int>();
    }
}
