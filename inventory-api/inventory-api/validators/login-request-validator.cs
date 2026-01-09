using FluentValidation;
using inventory_api.DTOs.Auth;
using inventory_api.Services.Interfaces;

namespace inventory_api.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator(ILocalizationService localization)
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage(localization.GetString("EmailRequired"))
            .EmailAddress().WithMessage(localization.GetString("EmailInvalid"))
            .MaximumLength(255).WithMessage(localization.GetString("EmailMaxLength"));

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage(localization.GetString("PasswordRequired"))
            .MinimumLength(6).WithMessage(localization.GetString("PasswordMinLength"))
            .MaximumLength(100).WithMessage(localization.GetString("PasswordMaxLength"));
    }
}