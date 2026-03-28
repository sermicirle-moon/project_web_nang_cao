using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace backend.Data.Configurations
{
    public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
    {
        public void Configure(EntityTypeBuilder<Attachment> builder)
        {
            builder.Property(a => a.FileName).IsRequired().HasMaxLength(255);
            builder.Property(a => a.FileUrl).IsRequired().HasMaxLength(1000);

            builder.HasOne(a => a.TaskItem)
                   .WithMany(t => t.Attachments)
                   .HasForeignKey(a => a.TaskItemId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
