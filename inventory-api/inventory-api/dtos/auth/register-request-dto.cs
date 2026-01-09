using System.ComponentModel.DataAnnotations;

namespace inventory_api.DTOs.Auth;

public class RegisterRequestDto
{
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    public string ConfirmPassword { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Name { get; set; }
}