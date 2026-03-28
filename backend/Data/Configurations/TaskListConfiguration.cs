using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class TaskListConfiguration : IEntityTypeConfiguration<TaskList>
    {
        public void Configure(EntityTypeBuilder<TaskList> builder)
        {
            builder.Property(tl => tl.Name).IsRequired().HasMaxLength(255);
            builder.Property(tl => tl.Color).HasMaxLength(50);
            builder.Property(tl => tl.Icon).HasMaxLength(50);

            builder.HasOne(tl => tl.User)
                   .WithMany()
                   .HasForeignKey(tl => tl.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
