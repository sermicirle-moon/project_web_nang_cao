namespace backend.Models.DTO.Eisenhower
{
    public class CreateEisenhowerTaskDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? DueDate { get; set; }
        public bool Urgent { get; set; }
        public bool Important { get; set; }
    }

    public class UpdateEisenhowerTaskDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? DueDate { get; set; }
        public bool Urgent { get; set; }
        public bool Important { get; set; }
    }

    public class EisenhowerTaskResponseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? DueDate { get; set; }
        public bool Urgent { get; set; }
        public bool Important { get; set; }
        public string Quadrant { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }
}