namespace backend.Models
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdateAt { get; set; }
        public bool IsDeleted { get; set; } = false;

    }
}
