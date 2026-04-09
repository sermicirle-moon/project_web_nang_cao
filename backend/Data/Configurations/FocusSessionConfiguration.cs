using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class FocusSessionConfiguration : IEntityTypeConfiguration<FocusSession>
    {
        public void Configure(EntityTypeBuilder<FocusSession> builder)
        {
            builder.ToTable("FocusSessions");
            builder.HasKey(fs => fs.Id);

            builder.Property(fs => fs.UserId).IsRequired();
            builder.HasOne(fs => fs.User)
                   .WithMany()
                   .HasForeignKey(fs => fs.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(fs => fs.Task)
                   .WithMany()
                   .HasForeignKey(fs => fs.TaskId)
                   .OnDelete(DeleteBehavior.Restrict); // Đã sửa từ SetNull thành Restrict

            builder.HasIndex(fs => new { fs.UserId, fs.StartTime });
            builder.HasIndex(fs => fs.StartTime);
        }
    }
}