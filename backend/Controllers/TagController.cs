using AutoMapper;
using backend.Data;
using backend.Models;
using backend.Models.DTO.Tag;
using backend.Models.DTO.Tags;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TagsController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        private readonly IMapper _mapper;

        public TagsController(AppDbContext ctx, IMapper mapper)
        {
            _ctx = ctx;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TagDto>>> GetMyTags()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var tags = await _ctx.Tags
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(_mapper.Map<List<TagDto>>(tags));
        }

        [HttpPost]
        public async Task<ActionResult<TagDto>> Create([FromBody] CreateTagDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var tag = _mapper.Map<Tag>(dto);
            tag.UserId = userId;

            _ctx.Tags.Add(tag);
            await _ctx.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMyTags), _mapper.Map<TagDto>(tag));
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateTagDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tag = await _ctx.Tags.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (tag == null) return NotFound("Không tìm thấy nhãn dán hoặc bạn không có quyền sửa");
            _mapper.Map(dto, tag);

            await _ctx.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var tag = await _ctx.Tags.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

            if (tag == null) return NotFound("Không tìm thấy nhãn dán hoặc bạn không có quyền xóa");

            _ctx.Tags.Remove(tag);
            await _ctx.SaveChangesAsync();

            return NoContent();
        }
    }
}