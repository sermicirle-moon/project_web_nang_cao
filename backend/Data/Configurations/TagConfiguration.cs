using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Collections.Generic;

namespace backend.Data.Configurations
{
    public class TagConfiguration : IEntityTypeConfiguration<Tag>
    {
        public void Configure(EntityTypeBuilder<Tag> builder)
        {
            builder.Property(t => t.Name).IsRequired().HasMaxLength(50);
            builder.Property(t => t.Color).HasMaxLength(50);
            builder.Property(t => t.Icon).HasMaxLength(50);
            builder.Property(t => t.Description).HasMaxLength(200);
            builder.Property(t => t.Slug).IsRequired().HasMaxLength(100);

            builder.HasOne(t => t.User)
                   .WithMany()
                   .HasForeignKey(t => t.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(t => t.Tasks)
                   .WithMany(t => t.Tags)
                   .UsingEntity<Dictionary<string, object>>(
                       "TaskTags",

                       j => j.HasOne<TaskItem>().WithMany().HasForeignKey("TasksId").OnDelete(DeleteBehavior.Cascade),

                       j => j.HasOne<Tag>().WithMany().HasForeignKey("TagsId").OnDelete(DeleteBehavior.NoAction)
                   );
        }
    }
}