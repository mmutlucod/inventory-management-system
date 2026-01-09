namespace inventory_api.DTOs.Sync;

public class SyncChangesDto
{
    public ProductChangesDto Products { get; set; } = new();
}


public class ProductChangesDto
{
    public List<ProductSyncDto> Created { get; set; } = new();

    public List<ProductSyncDto> Updated { get; set; } = new();

    public List<Guid> Deleted { get; set; } = new();
}