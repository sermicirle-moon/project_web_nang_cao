namespace backend.Models.DTO.Focus
{
    public class EndSessionDTO
    {
        public int SessionId { get; set; }
        public int FinalDurationSeconds { get; set; }
        public int TotalPauseSeconds { get; set; }
        public int PauseCount { get; set; }
        public bool IsCompleted { get; set; } = true;
    }
}