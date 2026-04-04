using backend.Data;
using backend.Models;
using backend.Models.DTO.TaskList;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TaskListService : ITaskListService
    {
        private readonly AppDbContext _context;

        public TaskListService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SideBarDataDTO> GetSideBarDataAsync(string userId)
        {
            var folders = await _context.TaskFolders
                            .Include(f => f.TaskLists)
                            .Where(f => f.UserId == userId)
                            .Select(f => new FolderDTO
                            {
                                Id = f.Id,
                                Name = f.Name,
                                Lists = f.TaskLists.Select(l => new TaskListResponseDTO
                                {
                                    Id = l.Id,
                                    Name = l.Name,
                                    Color = l.Color,
                                    Icon = l.Icon
                                }).ToList()
                            })
                            .ToListAsync();

            // 2. Gắp các List đứng tự do (Không có Folder nào chứa nó)
            var standaloneLists = await _context.TaskLists
                .Where(l => l.UserId == userId && l.FolderId == null)
                .Select(l => new TaskListResponseDTO
                {
                    Id = l.Id,
                    Name = l.Name,
                    Color = l.Color,
                    Icon = l.Icon
                })
                .ToListAsync();

            // 3. Đặt tất cả lên "Mâm" (SideBarDataDTO) và trả về
            return new SideBarDataDTO
            {
                Folders = folders,
                StandAloneLists = standaloneLists
            };
        }

        public async Task<TaskListResponseDTO> CreateTaskListAsync(string userId, CreateTaskListDTO dto)
        {
            var newList = new TaskList
            {
                Name = dto.Name,
                Color = dto.Color,
                Icon = dto.Icon,
                UserId = userId
            };

            // Logic: Nếu React có gửi lên tên Folder
            if (!string.IsNullOrWhiteSpace(dto.FolderName))
            {
                var existingFolder = await _context.TaskFolders
                    .FirstOrDefaultAsync(f => f.Name == dto.FolderName && f.UserId == userId);

                if (existingFolder != null)
                {
                    // Đã có Folder -> Nhét List vào đây
                    newList.FolderId = existingFolder.Id;
                }
                else
                {
                    // Chưa có Folder -> Ra lệnh cho EF Core tự tạo luôn Folder mới
                    newList.Folder = new TaskFolder
                    {
                        Name = dto.FolderName,
                        UserId = userId
                    };
                }
            }

            // Lưu xuống Database (nó sẽ tự động lưu cả Folder mới nếu có)
            _context.TaskLists.Add(newList);
            await _context.SaveChangesAsync();

            // Trả DTO về cho giao diện cập nhật ngay lập tức
            return new TaskListResponseDTO
            {
                Id = newList.Id,
                Name = newList.Name,
                Color = newList.Color,
                Icon = newList.Icon
            };
        }

        // ==========================================
        // SỬA DANH SÁCH (LIST)
        // ==========================================
        public async Task<bool> UpdateTaskListAsync(int listId, string userId, UpdateTaskListDTO dto)
        {
            var list = await _context.TaskLists.FirstOrDefaultAsync(l => l.Id == listId && l.UserId == userId);
            if (list == null) return false;

            // Cập nhật tên, màu, icon
            list.Name = dto.Name;
            list.Color = dto.Color;
            list.Icon = dto.Icon;

            // --- LOGIC CHUYỂN FOLDER ---
            if (string.IsNullOrWhiteSpace(dto.FolderName))
            {
                list.FolderId = null; // Nếu bỏ trống tên Folder -> Lôi List này ra ngoài đứng độc lập
            }
            else
            {
                var existingFolder = await _context.TaskFolders.FirstOrDefaultAsync(f => f.Name == dto.FolderName && f.UserId == userId);
                if (existingFolder != null)
                {
                    list.FolderId = existingFolder.Id; // Bỏ vào Folder có sẵn
                }
                else
                {
                    // Tạo Folder mới tinh và nhét List vào
                    var newFolder = new TaskFolder { Name = dto.FolderName, UserId = userId };
                    _context.TaskFolders.Add(newFolder);
                    await _context.SaveChangesAsync(); // Lưu để lấy ID
                    list.FolderId = newFolder.Id;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // ==========================================
        // XÓA DANH SÁCH (LIST)
        // ==========================================
        public async Task<bool> DeleteTaskListAsync(int listId, string userId)
        {
            var list = await _context.TaskLists.FirstOrDefaultAsync(l => l.Id == listId && l.UserId == userId);
            if (list == null) return false;

            _context.TaskLists.Remove(list);
            await _context.SaveChangesAsync();
            return true;
        }

        // ==========================================
        // SỬA THƯ MỤC (FOLDER)
        // ==========================================
        public async Task<bool> UpdateTaskFolderAsync(int folderId, string userId, UpdateTaskFolderDTO dto)
        {
            var folder = await _context.TaskFolders.FirstOrDefaultAsync(f => f.Id == folderId && f.UserId == userId);
            if (folder == null) return false;

            folder.Name = dto.Name;

            await _context.SaveChangesAsync();
            return true;
        }

        // ==========================================
        // XÓA THƯ MỤC (FOLDER)
        // ==========================================
        public async Task<bool> DeleteTaskFolderAsync(int folderId, string userId)
        {
            // Kéo theo cả các List con bên trong để xóa sạch sẽ (tránh rác Database)
            var folder = await _context.TaskFolders
                .Include(f => f.TaskLists)
                .FirstOrDefaultAsync(f => f.Id == folderId && f.UserId == userId);

            if (folder == null) return false;

            // EF Core sẽ tự động xóa các TaskLists con nếu đã cấu hình Cascade, 
            // nhưng lệnh này cho chắc ăn: xóa hết List con trước khi xóa Folder
            if (folder.TaskLists.Any())
            {
                _context.TaskLists.RemoveRange(folder.TaskLists);
            }

            _context.TaskFolders.Remove(folder);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
