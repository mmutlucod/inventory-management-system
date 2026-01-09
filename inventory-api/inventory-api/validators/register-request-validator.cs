using FluentValidation;
using inventory_api.DTOs.Auth;
using inventory_api.Services.Interfaces;

namespace inventory_api.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator(ILocalizationService localization)
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage(localization.GetString("EmailRequired"))
            .EmailAddress().WithMessage(localization.GetString("EmailInvalid"))
            .MaximumLength(255).WithMessage(localization.GetString("EmailMaxLength"));

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage(localization.GetString("PasswordRequired"))
            .MinimumLength(6).WithMessage(localization.GetString("PasswordMinLength"))
            .MaximumLength(100).WithMessage(localization.GetString("PasswordMaxLength"))
            .Matches(@"[A-Z]").WithMessage(localization.GetString("PasswordUppercaseRequired"))
            .Matches(@"[a-z]").WithMessage(localization.GetString("PasswordLowercaseRequired"))
            .Matches(@"[0-9]").WithMessage(localization.GetString("PasswordDigitRequired"));

        RuleFor(x => x.ConfirmPassword)
            .NotEmpty().WithMessage(localization.GetString("ConfirmPasswordRequired"))
            .Equal(x => x.Password).WithMessage(localization.GetString("PasswordsDoNotMatch"));

        RuleFor(x => x.Name)
            .MaximumLength(255).WithMessage(localization.GetString("NameMaxLength"))
            .When(x => !string.IsNullOrEmpty(x.Name));
    }
}