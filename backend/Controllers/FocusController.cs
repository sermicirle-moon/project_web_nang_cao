using backend.Models.DTO.Focus;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    // Controllers/FocusController.cs
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FocusController : ControllerBase
    {
        private readonly IFocusSessionService _focusService;
        public FocusController(IFocusSessionService focusService) => _focusService = focusService;

        [HttpPost("start")]
        public async Task<IActionResult> StartSession([FromBody] StartSessionDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var session = await _focusService.StartSessionAsync(userId, dto.TaskId, dto.SessionType);
            return Ok(new { sessionId = session.Id, startTime = session.StartTime });
        }

        [HttpPut("pause")]
        public async Task<IActionResult> PauseSession([FromBody] PauseSessionDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _focusService.UpdatePauseInfoAsync(dto.SessionId, userId, dto.PausedDurationSeconds);
            return Ok();
        }

        [HttpPut("end")]
        public async Task<IActionResult> EndSession([FromBody] EndSessionDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _focusService.EndSessionAsync(dto.SessionId, userId, dto.FinalDurationSeconds, dto.TotalPauseSeconds, dto.PauseCount, dto.IsCompleted);
            return Ok();
        }
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics(string period = "week")
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var stats = await _focusService.GetStatisticsAsync(userId, period);
            return Ok(stats);
        }
    }
}
