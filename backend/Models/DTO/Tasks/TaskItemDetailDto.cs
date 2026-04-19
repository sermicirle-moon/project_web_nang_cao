using backend.Models.DTO.Tag;

namespace backend.Models.DTO.Tasks
{
    public class TaskItemDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int Priority { get; set; }
        public bool IsCompleted { get; set; }
        public int? TaskListId { get; set; }
        public int? ParentTaskId { get; set; }
        public List<int> TagIds { get; set; } = new List<int>();
    }
}
