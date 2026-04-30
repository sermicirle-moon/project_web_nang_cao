using System.Text.Json.Serialization;
namespace backend.Models.DTO.Eisenhower
{
    public class CreateEisenhowerTaskDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public int Priority { get; set; } = 0;
        public bool Urgent { get; set; }
        public bool Important { get; set; }
    }

    public class UpdateEisenhowerTaskDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public int Priority { get; set; } = 0;
        public bool Urgent { get; set; }
        public bool Important { get; set; }
        [JsonPropertyName("isCompleted")]
        public bool IsCompleted { get; set; }
    }

    public class EisenhowerTaskResponseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public bool Urgent { get; set; }
        public bool IsCompleted { get; set; }
        public bool IsDeleted { get; set; }
        public bool Important { get; set; }
        public string Quadrant { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }
}