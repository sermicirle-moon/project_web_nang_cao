namespace backend.Models
{
    public class Attachment : BaseEntity
    {
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public int TaskItemId { get; set; }
        public TaskItem TaskItem { get; set; } = null!;
    }
}
