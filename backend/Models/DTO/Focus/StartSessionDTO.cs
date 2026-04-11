namespace backend.Models.DTO.Focus
{
    public class StartSessionDTO
    {
        public int? TaskId { get; set; }
        public string SessionType { get; set; } = "focus";
    }
}