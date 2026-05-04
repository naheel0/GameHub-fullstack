using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameHub.Domain.Entities
{
    public class Purchase
    {
        public Guid OrderId { get; set; }= Guid.NewGuid();
        public int UserId { get; set; }
        public int Id { get; set; }
        public User user { get; set; } = null;
        public DateTime OrderDate { get; set; }= DateTime.UtcNow;
        public List<OrderItem> Items { get; set; } = new();
        public decimal SubTotal { get; set; }
        public decimal Tax {  get; set; }
        public decimal Total { get; set; }
        public Address ShippingAddress { get; set; } = new();
        public string PaymentMethod { get; set; }= string.Empty;
        public string Status {  get; set; }= "placed";
    }
}
