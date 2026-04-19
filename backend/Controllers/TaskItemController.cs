using backend.Models.DTO.Tasks;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TaskItemController : ControllerBase
    {
        private readonly ITaskItemService _taskService;

        public TaskItemController(ITaskItemService taskService) => _taskService = taskService;

        [HttpPost]
        public async Task<IActionResult> Create(CreateTaskItemDto dto)
        {
            var result = await _taskService.CreateAsync(dto, User);
            return Ok(result);
        }
    }
}
