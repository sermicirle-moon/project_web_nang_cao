using backend.Models;
using backend.Models.DTO.Profile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;

        public UserController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            var role = await _userManager.GetRolesAsync(user);
            var profile = new UserProfileDTO
            {
                Name = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = role.FirstOrDefault() ?? "Free",
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                CreatedAt = user.CreatedAt

            };
            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfileInfo([FromBody] UpdateUserProfileDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy hồ sơ người dùng!" });

            // Cập nhật dữ liệu mới từ React gửi lên
            user.FullName = dto.Name;
            user.PhoneNumber = dto.PhoneNumber;
            user.Bio = dto.Bio;

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { message = "Cập nhật hồ sơ thành công!" });
            }

            return BadRequest(new { message = "Có lỗi xảy ra khi lưu dữ liệu!" });
        }

        [HttpPost("upgrade")]
        public async Task<IActionResult> UpgradeToPremium()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            // Đã sửa chữ "Prenium" thành "Premium"
            if (await _userManager.IsInRoleAsync(user, "Premium"))
            {
                return BadRequest(new { message = "Bạn đã là thành viên Premium rồi" });
            }

            await _userManager.RemoveFromRoleAsync(user, "Free");
            await _userManager.AddToRoleAsync(user, "Premium");

            var userRoles = await _userManager.GetRolesAsync(user);

            var AuthClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, userRoles.First())
            };

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Key"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                expires: DateTime.UtcNow.AddHours(2),
                claims: AuthClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                message = "Cập nhật thành công! Bạn đã là thành viên Premium rồi",
                token = new JwtSecurityTokenHandler().WriteToken(token),
                Role = "Premium"
            });
        }
    }
}
