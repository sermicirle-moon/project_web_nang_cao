using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Habit : BaseEntity
    {
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(50)]
        public string? Unit { get; set; } // cups, minutes, times, etc.
        
        [Required]
        public double Target { get; set; } // mục tiêu mỗi ngày
        
        [Required]
        public string Type { get; set; } = "bool"; // "bool", "count", "duration"
        
        public string? Icon { get; set; } // icon material-symbols
        public string? Color { get; set; } // mã màu hex
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser User { get; set; } = null!;
    }
}