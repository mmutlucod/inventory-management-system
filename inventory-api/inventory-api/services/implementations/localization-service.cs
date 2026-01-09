using System.Globalization;
using System.Resources;
using inventory_api.Services.Interfaces;

namespace inventory_api.Services.Implementations;

public class LocalizationService : ILocalizationService
{
    private readonly ResourceManager _resourceManager;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<LocalizationService> _logger;

    public LocalizationService(
        IHttpContextAccessor httpContextAccessor,
        ILogger<LocalizationService> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;

        _resourceManager = new ResourceManager(
            "inventory_api.Resources.Messages",
            typeof(LocalizationService).Assembly
        );
    }

    public string GetString(string key)
    {
        try
        {
            var culture = GetCurrentCulture();
            var value = _resourceManager.GetString(key, culture);

            if (string.IsNullOrEmpty(value))
            {
                _logger.LogWarning("Translation key not found: {Key} for culture: {Culture}", key, culture.Name);
                return key;
            }

            return value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting localized string for key: {Key}", key);
            return key;
        }
    }

    public string GetString(string key, params object[] args)
    {
        try
        {
            var culture = GetCurrentCulture();
            var format = _resourceManager.GetString(key, culture);

            if (string.IsNullOrEmpty(format))
            {
                _logger.LogWarning("Translation key not found: {Key} for culture: {Culture}", key, culture.Name);
                return key;
            }

            return string.Format(culture, format, args);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error formatting localized string for key: {Key}", key);
            return key;
        }
    }

    private CultureInfo GetCurrentCulture()
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext != null)
            {
                var langHeader = httpContext.Request.Headers["X-Lang"].ToString();

                if (!string.IsNullOrEmpty(langHeader))
                {
                    _logger.LogDebug("Using language from X-Lang header: {Language}", langHeader);
                    return new CultureInfo(langHeader);
                }

                var acceptLanguage = httpContext.Request.Headers["Accept-Language"].ToString();
                if (!string.IsNullOrEmpty(acceptLanguage))
                {
                    var firstLang = acceptLanguage.Split(',')[0].Trim();
                    _logger.LogDebug("Using language from Accept-Language header: {Language}", firstLang);
                    return new CultureInfo(firstLang);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting culture from headers");
        }

        _logger.LogDebug("Using default culture: tr-TR");
        return new CultureInfo("tr-TR");
    }
}