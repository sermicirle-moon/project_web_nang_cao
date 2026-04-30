using backend.Models.DTO.Eisenhower;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EisenhowerController : ControllerBase
    {
        private readonly IEisenhowerTaskService _service;

        public EisenhowerController(IEisenhowerTaskService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyTasks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var tasks = await _service.GetUserTasksAsync(userId);
            return Ok(tasks);
        }

        [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateEisenhowerTaskDTO dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var task = new EisenhowerTask
        {
            Title = dto.Title,
            Description = dto.Description,
            StartDate = dto.StartDate,
            DueDate = dto.DueDate,
            Priority = dto.Priority,
            Urgent = dto.Urgent,
            Important = dto.Important,
            UserId = userId
        };
            var created = await _service.CreateTaskAsync(userId, dto);
            // KHÔNG sync sang TaskItem (theo đúng yêu cầu)
            return Ok(created);
    }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateEisenhowerTaskDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var updated = await _service.UpdateTaskAsync(id, userId, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            var deleted = await _service.DeleteTaskAsync(id, userId);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}