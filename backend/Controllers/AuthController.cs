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
            // Kiểm tra xem username đã ai dùng chưa
            var userExists = await _userManager.FindByNameAsync(dto.Username);
            if (userExists != null)
                return BadRequest(new { Message = "Tên tài khoản đã tồn tại!" });

            // Tạo user mới
            ApplicationUser user = new ApplicationUser
            {
                Email = dto.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = dto.Username,
                FullName = dto.FullName
            };

            // Lưu vào database (Identity tự động băm mật khẩu ở bước này)
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return StatusCode(500, new { Message = "Tạo tài khoản thất bại!", Errors = result.Errors });

            // Tự động gán quyền "Free" cho người dùng mới
            if (!await _roleManager.RoleExistsAsync("Free"))
                await _roleManager.CreateAsync(new IdentityRole("Free"));
            if (!await _roleManager.RoleExistsAsync("Premium"))
                await _roleManager.CreateAsync(new IdentityRole("Premium"));

            await _userManager.AddToRoleAsync(user, "Free");

            return Ok(new { Message = "Tạo tài khoản thành công!" });
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
                    expires: DateTime.Now.AddHours(3), // Token có hạn 3 tiếng
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

                // Trả Token về cho React
                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                    roles = userRoles,
                    fullName = user.FullName
                });
            }

            return Unauthorized(new { Message = "Sai tài khoản hoặc mật khẩu!" });
        }
    }

}