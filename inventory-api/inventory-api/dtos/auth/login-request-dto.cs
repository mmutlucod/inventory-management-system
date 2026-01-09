using System.ComponentModel.DataAnnotations;

namespace inventory_api.DTOs.Auth;

public class LoginRequestDto
{
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}