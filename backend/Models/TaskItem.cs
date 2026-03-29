namespace backend.Models
{
    public class TaskItem: BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int Priority { get; set; } = 0;
        public bool IsCompleted { get; set; } = false;
        public int? TaskListId { get; set; }
        public TaskList? TaskList { get; set; } = null!;
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        public ICollection<Tag> Tags { get; set; } = new List<Tag>();

        public int? ParentTaskId { get; set; }
        public TaskItem? ParentTask { get; set; }
        public ICollection<TaskItem> SubTasks { get; set; } = new List<TaskItem>();
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    }
}
