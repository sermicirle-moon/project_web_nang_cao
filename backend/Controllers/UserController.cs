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
        private readonly IWebHostEnvironment _environment; // Thêm để xử lý file

        public UserController(UserManager<ApplicationUser> userManager, IConfiguration configuration, IWebHostEnvironment environment)
        {
            _userManager = userManager;
            _configuration = configuration;
            _environment = environment;
        }

        // ==================== LẤY THÔNG TIN HỒ SƠ ====================
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

        // ==================== CẬP NHẬT THÔNG TIN HỒ SƠ ====================
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfileInfo([FromBody] UpdateUserProfileDTO dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(new { message = "Không tìm thấy hồ sơ người dùng!" });

            user.FullName = dto.Name;
            user.PhoneNumber = dto.PhoneNumber;
            user.Bio = dto.Bio;

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
                return Ok(new { message = "Cập nhật hồ sơ thành công!" });

            return BadRequest(new { message = "Có lỗi xảy ra khi lưu dữ liệu!" });
        }

        // ==================== NÂNG CẤP PREMIUM ====================
        [HttpPost("upgrade")]
        public async Task<IActionResult> UpgradeToPremium()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            if (await _userManager.IsInRoleAsync(user, "Premium"))
                return BadRequest(new { message = "Bạn đã là thành viên Premium rồi" });

            await _userManager.RemoveFromRoleAsync(user, "Free");
            await _userManager.AddToRoleAsync(user, "Premium");

            var userRoles = await _userManager.GetRolesAsync(user);

            var authClaims = new List<Claim>
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
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new
            {
                message = "Cập nhật thành công! Bạn đã là thành viên Premium rồi",
                token = new JwtSecurityTokenHandler().WriteToken(token),
                Role = "Premium"
            });
        }

        // ==================== ĐỔI MẬT KHẨU ====================
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng" });

            var result = await _userManager.ChangePasswordAsync(user, dto.OldPassword, dto.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return BadRequest(new { message = errors });
            }

            return Ok(new { message = "Đổi mật khẩu thành công" });
        }

        // ==================== UPLOAD AVATAR ====================
        [HttpPost("avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile avatar)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "Không tìm thấy người dùng" });

            if (avatar == null || avatar.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file ảnh" });

            // Kiểm tra định dạng
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(avatar.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)" });

            // Xóa avatar cũ nếu có
            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                var oldFilePath = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), user.AvatarUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                    System.IO.File.Delete(oldFilePath);
            }

            // Tạo thư mục uploads nếu chưa có
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", "avatars");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Tạo tên file duy nhất
            var fileName = $"{userId}_{DateTime.Now.Ticks}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await avatar.CopyToAsync(stream);
            }

            // Cập nhật URL avatar vào database
            var avatarUrl = $"/uploads/avatars/{fileName}";
            user.AvatarUrl = avatarUrl;
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                // Xóa file vừa tạo nếu lưu DB thất bại
                System.IO.File.Delete(filePath);
                return BadRequest(new { message = "Lỗi cập nhật thông tin người dùng" });
            }

            return Ok(new { avatarUrl = avatarUrl });
        }
    }
}