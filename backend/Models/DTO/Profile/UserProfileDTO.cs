namespace backend.Models.DTO.Profile
{
    public class UserProfileDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Bio { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

    }
}
