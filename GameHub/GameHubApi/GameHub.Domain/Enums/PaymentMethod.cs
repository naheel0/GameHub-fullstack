namespace GameHub.Domain.Enums
{
    using System.ComponentModel.DataAnnotations;

    public enum PaymentMethod
    {
        [Display(Name = "Credit/Debit Card")]
        CreditDebitCard,

        [Display(Name = "PayPal")]
        PayPal,

        [Display(Name = "Apple Pay")]
        ApplePay,

        [Display(Name = "Google Pay")]
        GooglePay,

        [Display(Name = "Razorpay")]
        Razorpay
    }
}
