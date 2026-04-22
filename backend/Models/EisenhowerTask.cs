using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class EisenhowerTask : BaseEntity
    {
        [Required, MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        public string? DueDate { get; set; } // lưu string "Today 5PM" hoặc datetime

        public bool Urgent { get; set; }
        public bool Important { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
    }
}