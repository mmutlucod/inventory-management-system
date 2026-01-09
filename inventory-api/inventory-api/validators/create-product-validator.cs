using FluentValidation;
using inventory_api.DTOs.Product;
using inventory_api.Services.Interfaces;

namespace inventory_api.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator(ILocalizationService localization)
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage(localization.GetString("ProductIdRequired"));

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage(localization.GetString("ProductNameRequired"))
            .MaximumLength(255).WithMessage(localization.GetString("ProductNameMaxLength"));

        RuleFor(x => x.Barcode)
            .MaximumLength(100).WithMessage(localization.GetString("BarcodeMaxLength"))
            .When(x => !string.IsNullOrEmpty(x.Barcode));

        RuleFor(x => x.Stock)
            .GreaterThanOrEqualTo(0).WithMessage(localization.GetString("StockNonNegative"));

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage(localization.GetString("PriceNonNegative"))
            .When(x => x.Price.HasValue);

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage(localization.GetString("CategoryMaxLength"))
            .When(x => !string.IsNullOrEmpty(x.Category));

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).WithMessage(localization.GetString("ImageUrlMaxLength"))
            .Must(BeAValidUrl).WithMessage(localization.GetString("ImageUrlInvalid"))
            .When(x => !string.IsNullOrEmpty(x.ImageUrl));
    }

    private bool BeAValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}