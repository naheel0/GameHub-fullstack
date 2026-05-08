using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GameHub.Application.DTOs.Admin
{
    public class DailySales
    {
        public DateTime Date {  get; set; }
        public decimal Amount { get; set; }
    }
}
