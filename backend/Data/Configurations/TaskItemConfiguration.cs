using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
    {
        public void Configure(EntityTypeBuilder<TaskItem> builder)
        {
            builder.Property(t =>t.Title).IsRequired().HasMaxLength(255);
            builder.Property(t => t.Description).HasMaxLength(2000);
            builder.Property(t => t.Status)
                .HasConversion<int>()
                .HasDefaultValue(Models.TaskStatus.Todo);

            builder.Property(t => t.DueDate).HasColumnType("datetime2");

            builder.Property(t => t.IsArchived).HasDefaultValue(false);

            builder.Property(t => t.ReminderDate).HasColumnType("datetime2");

            builder.HasOne(t => t.TaskList)
                    .WithMany(tl => tl.Tasks)
                    .HasForeignKey(t => t.TaskListId)
                    .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(t=> t.User)
                    .WithMany(u => u.Tasks)
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(t => t.ParentTask)
                    .WithMany(t => t.SubTasks)
                    .HasForeignKey(t => t.ParentTaskId)
                    .OnDelete(DeleteBehavior.Restrict);

            builder.Property(t => t.Type)
                   .HasConversion<int>()
                   .HasDefaultValue(ItemType.Task);
        }
    }
}
