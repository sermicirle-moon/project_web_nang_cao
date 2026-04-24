namespace backend.Models.DTO.Tasks
{
    public record TaskItemSummaryDto
    {
        public int Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public DateTime? StartDate { get; init; }
        public DateTime? DueDate { get; init; }
        public int Priority { get; init; }
        public bool IsCompleted { get; init; }
        public int? TaskListId { get; init; }
        public int? ParentTaskId { get; init; }
    }
}