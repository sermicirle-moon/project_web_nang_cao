using backend.Models;
using System.ComponentModel.DataAnnotations;

public class EisenhowerTask : BaseEntity
{
    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;
    [MaxLength(2000)]
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int Priority { get; set; } = 0;
    public bool IsCompleted { get; set; } = false;
    public bool IsDeleted { get; set; } = false;
    public bool Urgent { get; set; }
    public bool Important { get; set; }
    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
}