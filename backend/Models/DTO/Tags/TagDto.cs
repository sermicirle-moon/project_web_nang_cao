namespace backend.Models.DTO.Tag
{
    public record TagDto(
        int Id,
        string Name,
        string Slug,
        string? Color
        );
}
