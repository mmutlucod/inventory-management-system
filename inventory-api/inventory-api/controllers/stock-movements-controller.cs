using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inventory_api.DTOs.Product;
using inventory_api.Services.Interfaces;

namespace inventory_api.Controllers;

[Authorize]
[ApiController]
[Route("api/stock-movements")]
public class StockMovementsController : ControllerBase
{
    private readonly IStockMovementService _stockMovementService;
    private readonly ILogger<StockMovementsController> _logger;

    public StockMovementsController(
        IStockMovementService stockMovementService,
        ILogger<StockMovementsController> logger)
    {
        _stockMovementService = stockMovementService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<StockMovementDto>> AddMovement([FromBody] AddStockMovementRequest request)
    {
        var userId = GetUserIdFromToken();
        if (userId == null) return Unauthorized();

        try
        {
            var movement = await _stockMovementService.AddMovementAsync(
                request.ProductId,
                request.Quantity,
                request.Type,
                request.Note,
                userId.Value
            );

            return CreatedAtAction(nameof(GetByProduct), new { productId = request.ProductId }, movement);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetByProduct(Guid productId)
    {
        var userId = GetUserIdFromToken();
        if (userId == null) return Unauthorized();

        var movements = await _stockMovementService.GetByProductIdAsync(productId, userId.Value);
        return Ok(movements);
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetRecent([FromQuery] int count = 10)
    {
        var userId = GetUserIdFromToken();
        if (userId == null) return Unauthorized();

        var movements = await _stockMovementService.GetRecentMovementsAsync(userId.Value, count);
        return Ok(movements);
    }

    private Guid? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : null;
    }
}

public class AddStockMovementRequest
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Note { get; set; }
}