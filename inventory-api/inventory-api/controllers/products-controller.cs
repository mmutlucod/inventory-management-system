using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using inventory_api.DTOs.Product;
using inventory_api.Services.Interfaces;

namespace inventory_api.Controllers;

[Authorize]
[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILocalizationService _localizer; 
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        IProductService productService,
        ILocalizationService localizer,  
        ILogger<ProductsController> logger)
    {
        _productService = productService;
        _localizer = localizer; 
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
            return Unauthorized(new { error = _localizer.GetString("Unauthorized") });

        var products = await _productService.GetAllAsync(userId.Value);
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(Guid id)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
            return Unauthorized(new { error = _localizer.GetString("Unauthorized") });

        var product = await _productService.GetByIdAsync(id, userId.Value);
        if (product == null)
        {
            return NotFound(new { error = _localizer.GetString("ProductNotFound") });
        }

        return Ok(product);
    }

    [HttpGet("barcode/{barcode}")]
    public async Task<ActionResult<ProductDto>> GetByBarcode(string barcode)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
            return Unauthorized(new { error = _localizer.GetString("Unauthorized") });

        var product = await _productService.GetByBarcodeAsync(barcode, userId.Value);
        if (product == null)
        {
            return NotFound(new { error = _localizer.GetString("ProductNotFound") });
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
            return Unauthorized(new { error = _localizer.GetString("Unauthorized") });

        try
        {
            var product = await _productService.CreateAsync(dto, userId.Value);
            return CreatedAtAction(
                nameof(GetById),
                new { id = product.Id },
                new
                {
                    product = product,
                    message = _localizer.GetString("ProductCreated")
                }
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> Update(Guid id, [FromBody] UpdateProductDto dto)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
            return Unauthorized(new { error = _localizer.GetString("Unauthorized") });

        try
        {
            var product = await _productService.UpdateAsync(id, dto, userId.Value);
            if (product == null)
            {
                return NotFound(new { error = _localizer.GetString("ProductNotFound") });
            }

            return Ok(new
            {
                product = product,
                message = _localizer.GetString("ProductUpdated")
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
            return Unauthorized(new { error = _localizer.GetString("Unauthorized") });

        var success = await _productService.DeleteAsync(id, userId.Value);
        if (!success)
        {
            return NotFound(new { error = _localizer.GetString("ProductNotFound") });
        }

        return Ok(new { message = _localizer.GetString("ProductDeleted") });
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> Search([FromQuery] string term)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
            return Unauthorized(new { error = _localizer.GetString("Unauthorized") });

        var products = await _productService.SearchAsync(term, userId.Value);
        return Ok(products);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetLowStock([FromQuery] int threshold = 10)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
            return Unauthorized(new { error = _localizer.GetString("Unauthorized") });

        var products = await _productService.GetLowStockProductsAsync(userId.Value, threshold);
        return Ok(products);
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetByCategory(string category)
    {
        var userId = GetUserIdFromToken();
        if (userId == null)
            return Unauthorized(new { error = _localizer.GetString("Unauthorized") });

        var products = await _productService.GetByCategoryAsync(category, userId.Value);
        return Ok(products);
    }

    private Guid? GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null ? Guid.Parse(userIdClaim) : null;
    }
}