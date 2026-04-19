using AutoMapper;
using backend.Models;
using backend.Models.DTO.Tasks;

namespace backend.Mapping
{
    public class TaskProfile : Profile
    {
        public TaskProfile()
        {
            CreateMap<CreateTaskItemDto, TaskItem>()
                .ForMember(dest => dest.Tags, opt => opt.Ignore()); 

            CreateMap<TaskItem, TaskItemSummaryDto>();

            CreateMap<TaskItem, TaskItemDetailDto>()
                .ForMember(dest => dest.TagIds,
                           opt => opt.MapFrom(src => src.Tags.Select(t => t.Id).ToList()));

            CreateMap<UpdateTaskItemDto, TaskItem>()
                .ForMember(dest => dest.Tags, opt => opt.Ignore());
        }
    }
}
