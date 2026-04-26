namespace backend.Models
{
    public class TaskItem: BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? ReminderDate { get; set; }
        public int Priority { get; set; }
        public TaskStatus Status { get; set; } = TaskStatus.Todo;
        public bool IsCompleted { get; set; }
        public bool IsPinned { get; set; }
        public bool IsArchived { get; set; }
        public bool IsDeleted { get; set; }

        public int? TaskListId { get; set; }
        public TaskList? TaskList { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        public int? ParentTaskId { get; set; }
        public TaskItem? ParentTask { get; set; }
        public ICollection<TaskItem> SubTasks { get; set; } = new List<TaskItem>();
        public ICollection<Tag> Tags { get; set; } = new List<Tag>();
        public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
        public ItemType Type { get; set; } = ItemType.Task;
    }

    public enum ItemType
    {
        Task = 0,    
        Event = 1,
        Note = 2
    }
}
