using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameHub.Application.DTOs.Payments
{
    public class PaymentVerifyRequest
    {
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string RazorpayPaymentId { get; set; }=string.Empty;
        public string RazorpaySignature { get; set; } = string.Empty;
    }
}
