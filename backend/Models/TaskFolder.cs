namespace backend.Models
{
    public class TaskFolder: BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string UserId { get; set; }= string.Empty;
        public int OrderIndex { get; set; }
        public ApplicationUser User { get; set; } = null!;
        public ICollection<TaskList> TaskLists { get; set; } = new List<TaskList>();
    }
}
