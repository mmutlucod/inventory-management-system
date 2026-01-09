using FluentValidation;
using inventory_api.DTOs.Product;
using inventory_api.Services.Interfaces;

namespace inventory_api.Validators;

public class StockMovementCreateValidator : AbstractValidator<StockMovementCreateDto>
{
    public StockMovementCreateValidator(ILocalizationService localization)
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage(localization.GetString("ProductIdRequired"));

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage(localization.GetString("QuantityMustBePositive"));

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage(localization.GetString("MovementTypeRequired"))
            .Must(t => t == "in" || t == "out").WithMessage(localization.GetString("InvalidMovementType"));
    }
}