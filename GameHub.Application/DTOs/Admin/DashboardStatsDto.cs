namespace GameHub.Application.DTOs.Admin
{
    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int TotalUsers { get; set; }
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<OrderStatusCount> OrderStatusDistribution { get; set; } = new();
        public List<DailySales> Last7DaysSales { get; set; }= new();
    }
}
