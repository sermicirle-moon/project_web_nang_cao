using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data.Configurations
{
    public class TaskFolderConfiguration : IEntityTypeConfiguration<TaskFolder>
    {
        public void Configure(EntityTypeBuilder<TaskFolder> builder)
        {
            builder.ToTable("TaskFolders");

            builder.HasOne(tf => tf.User)
                   .WithMany(u => u.TaskFolders)
                   .HasForeignKey(tf => tf.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(tf => tf.TaskLists)
                   .WithOne(tl => tl.Folder)
                   .HasForeignKey(tl => tl.FolderId)
                   .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
