namespace backend.Models.DTO.Tasks
{
    public record TaskItemSummaryDto(
        int Id,
        string Title,
        DateTime? StartDate,
        DateTime? EndDate,
        int Priority,
        bool IsCompleted,
        int? TaskListId
    );
}
