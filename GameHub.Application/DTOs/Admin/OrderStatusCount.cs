using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameHub.Application.DTOs.Admin
{
    public class OrderStatusCount
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
