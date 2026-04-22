using backend.Models.DTO.Habit;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class HabitController : ControllerBase
    {
        private readonly IHabitService _habitService;
        public HabitController(IHabitService habitService) => _habitService = habitService;

        [HttpGet]
        public async Task<IActionResult> GetMyHabits()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var habits = await _habitService.GetUserHabitsAsync(userId);
            return Ok(habits);
        }

        [HttpPost]
        public async Task<IActionResult> CreateHabit([FromBody] CreateHabitDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var habit = await _habitService.CreateHabitAsync(userId, dto);
            return Ok(habit);
        }

        [HttpPost("log")]
        public async Task<IActionResult> LogHabit([FromBody] HabitLogDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var log = await _habitService.LogHabitAsync(userId, dto);
            return Ok(log);
        }

        [HttpGet("{habitId}/stats")]
        public async Task<IActionResult> GetStats(int habitId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var stats = await _habitService.GetStatisticsAsync(habitId, userId);
            return Ok(stats);
        }

        [HttpGet("{habitId}/logs")]
        public async Task<IActionResult> GetLogs(int habitId, [FromQuery] int days = 30)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var logs = await _habitService.GetLogsAsync(habitId, userId, days);
            return Ok(logs);
        }

        [HttpPost("quick-log")]
        public async Task<IActionResult> QuickLogHabit([FromBody] QuickLogDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var habit = await _habitService.GetHabitByIdAsync(dto.HabitId, userId);
            if (habit == null) return NotFound();

            double value = habit.Type == "bool" ? 1 : habit.Target;
            var logDto = new HabitLogDTO
            {
                HabitId = dto.HabitId,
                Date = dto.Date,
                Value = value,
                Note = null
            };

            var log = await _habitService.LogHabitAsync(userId, logDto);
            return Ok(log);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHabit(int id, [FromBody] UpdateHabitDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var updated = await _habitService.UpdateHabitAsync(id, userId, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHabit(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var deleted = await _habitService.DeleteHabitAsync(id, userId);   // ← SỬA LẠI
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpDelete("log/{habitId}")]
        public async Task<IActionResult> DeleteTodayLog(int habitId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var deleted = await _habitService.DeleteLogAsync(habitId, userId, today);   // ← SỬA
            if (!deleted) return NotFound();
            return Ok();
        }
    }
}