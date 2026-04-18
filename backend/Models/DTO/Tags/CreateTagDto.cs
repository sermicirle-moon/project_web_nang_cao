using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTO.Tags
{
    public record CreateTagDto(
        [Required(ErrorMessage = "Tên tag không được để trống")]
        string Name,
        
        string? Color = "#9ca3af"
        );
}
