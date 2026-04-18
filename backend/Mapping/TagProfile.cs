using AutoMapper;
using backend.Helper;
using backend.Models;
using backend.Models.DTO.Tag;
using backend.Models.DTO.Tags;
using Microsoft.IdentityModel.Logging;

namespace backend.Mapping
{
    public class TagProfile:Profile
    {
        public TagProfile()
        {
            CreateMap<Tag, TagDto>();

            CreateMap<CreateTagDto, Tag>()
            .ForMember(dest => dest.Slug, opt => opt.MapFrom(src => SlugHelper.Generate(src.Name)))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore());
        }
    }
}
