namespace inventory_api.Helpers;

public static class DateTimeHelper
{
    public static DateTime FromUnixTimeMilliseconds(long unixTime)
    {
        return DateTimeOffset.FromUnixTimeMilliseconds(unixTime).UtcDateTime;
    }

    public static long ToUnixTimeMilliseconds(DateTime dateTime)
    {
        return new DateTimeOffset(dateTime).ToUnixTimeMilliseconds();
    }

    public static long UtcNowUnixMilliseconds()
    {
        return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    }

    public static bool IsValidDate(DateTime date)
    {
        return date != default && date > DateTime.MinValue && date <= DateTime.UtcNow.AddDays(1);
    }

    public static bool IsFutureDate(DateTime date)
    {
        return date > DateTime.UtcNow;
    }

    public static bool IsPastDate(DateTime date)
    {
        return date < DateTime.UtcNow;
    }
}