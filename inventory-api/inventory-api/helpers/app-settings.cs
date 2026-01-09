namespace inventory_api.Helpers;

public class JwtSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; }
    public int RefreshTokenExpiryDays { get; set; }
}

public class CorsSettings
{
    public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
}
public class SyncSettings
{
    public int MaxRecordsPerPull { get; set; }
    public string ConflictResolution { get; set; } = "LastWriteWins";
}