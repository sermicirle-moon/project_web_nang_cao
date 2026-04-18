namespace backend.Models.DTO.Common
{
    public record PagedResultDto<T>(
        IList<T> Items,       
        int Total,           
        int Page,            
        int PageSize,         
        int TotalPages 
    );
}
