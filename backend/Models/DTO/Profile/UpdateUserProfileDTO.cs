namespace backend.Models.DTO.Profile
{
    public class UpdateUserProfileDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Bio { get; set; }
    }
}
