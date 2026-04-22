using backend.Models;
using backend.Models.DTO;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // Khai báo các công cụ của Identity và Cấu hình
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
        }

        // ----------------------------------------------------
        // 1. API ĐĂNG KÝ TÀI KHOẢN
        // ----------------------------------------------------
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            try
            {
                var userExists = await _userManager.FindByNameAsync(dto.Username);
                if (userExists != null)
                    return BadRequest(new { Message = "Tên tài khoản đã tồn tại!" });

                ApplicationUser user = new ApplicationUser
                {
                    Email = dto.Email,
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = dto.Username,
                    FullName = dto.FullName
                };

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    Console.WriteLine($"Lỗi tạo user: {errors}");
                    // Trả về BadRequest (400) với message rõ ràng, frontend sẽ hiển thị
                    return BadRequest(new { Message = errors });
                }

                // Tạo roles nếu chưa tồn tại
                if (!await _roleManager.RoleExistsAsync("Free"))
                {
                    var roleResult = await _roleManager.CreateAsync(new IdentityRole("Free"));
                    if (!roleResult.Succeeded)
                        Console.WriteLine($"Lỗi tạo role Free: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                }
                if (!await _roleManager.RoleExistsAsync("Premium"))
                {
                    var roleResult = await _roleManager.CreateAsync(new IdentityRole("Premium"));
                    if (!roleResult.Succeeded)
                        Console.WriteLine($"Lỗi tạo role Premium: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                }

                await _userManager.AddToRoleAsync(user, "Free");

                return Ok(new { Message = "Tạo tài khoản thành công!" });
            }
            catch(Exception ex)
            {
                Console.WriteLine($"LỖI ĐĂNG KÝ (chi tiết): {ex}");
                return StatusCode(500, new { Message = "Lỗi server: " + ex.Message });
            }
        }

        // ----------------------------------------------------
        // 2. API ĐĂNG NHẬP VÀ PHÁT TOKEN
        // ----------------------------------------------------
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            // Tìm user trong database
            var user = await _userManager.FindByNameAsync(dto.Username);

            // Nếu có user VÀ mật khẩu đúng
            if (user != null && await _userManager.CheckPasswordAsync(user, dto.Password))
            {
                // Lấy quyền của user này (vd: "Free" hoặc "Premium")
                var userRoles = await _userManager.GetRolesAsync(user);

                // Gói ghém thông tin (Claims) để nhét vào Token
                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),   // ← THÊM DÒNG NÀY
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                }

                // Lấy chìa khóa bí mật từ appsettings.json
                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

                // Bắt đầu in Token
                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

                // Trả Token về cho React
                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    roles = userRoles,
                    fullName = user.FullName,
                    avatarUrl = user.AvatarUrl
                });
            }

            return Unauthorized(new { Message = "Sai tài khoản hoặc mật khẩu!" });
        }
    }

}