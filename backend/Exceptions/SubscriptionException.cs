public class SubscriptionException : Exception
{
    public string FeatureCode { get; }

    public SubscriptionException(string message, string featureCode) : base(message)
    {
        FeatureCode = featureCode;
    }
}