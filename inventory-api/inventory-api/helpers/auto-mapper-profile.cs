using AutoMapper;
using inventory_api.DTOs.Auth;
using inventory_api.DTOs.Product;
using inventory_api.DTOs.Sync;
using inventory_api.Models;

namespace inventory_api.Helpers;
public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateMap<User, UserDto>();

        CreateMap<Product, ProductDto>();
        CreateMap<CreateProductDto, Product>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false));

        CreateMap<UpdateProductDto, Product>()
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));

        CreateMap<Product, ProductSyncDto>()
            .ForMember(dest => dest.CreatedAt,
                opt => opt.MapFrom(src => new DateTimeOffset(src.CreatedAt).ToUnixTimeMilliseconds()))
            .ForMember(dest => dest.UpdatedAt,
                opt => opt.MapFrom(src => new DateTimeOffset(src.UpdatedAt).ToUnixTimeMilliseconds()));

        CreateMap<ProductSyncDto, Product>()
            .ForMember(dest => dest.CreatedAt,
                opt => opt.MapFrom(src => DateTimeOffset.FromUnixTimeMilliseconds(src.CreatedAt).UtcDateTime))
            .ForMember(dest => dest.UpdatedAt,
                opt => opt.MapFrom(src => DateTimeOffset.FromUnixTimeMilliseconds(src.UpdatedAt).UtcDateTime));

        CreateMap<StockMovement, StockMovementDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : null));
    }
}