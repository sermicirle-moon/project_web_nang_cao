namespace backend.Models
{
    public class Tag: BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public string? Description { get; set; }
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
        public ICollection<TaskItem> Tasks { get;set; } = new List<TaskItem>();
    }
}
