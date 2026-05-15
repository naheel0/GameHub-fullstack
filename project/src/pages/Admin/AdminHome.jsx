import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useAdmin } from "./contexts/AdminContext";
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default function AdminHome() {
  const { products, users, orders } = useAdmin();
  // Stats Cards Data
  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      change: "+12%",
      color: "from-violet-500 to-purple-600",
      bgColor:
        "bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20",
    },
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      change: "+8%",
      color: "from-emerald-500 to-green-600",
      bgColor:
        "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20",
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingCart,
      change: "+23%",
      color: "from-amber-500 to-orange-600",
      bgColor:
        "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20",
    },
    {
      title: "Revenue",
      value: `₹${orders
        .reduce((sum, order) => sum + (order.total || 0), 0)
        .toLocaleString()}`,
      icon: TrendingUp,
      change: "+15%",
      color: "from-blue-500 to-cyan-600",
      bgColor:
        "bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20",
    },
  ];

  // Order Status Data for Pie Chart
  const orderStatusData = orders.reduce((acc, order) => {
    const status = order.status || "Pending";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.keys(orderStatusData).map((status) => ({
    name: status,
    value: orderStatusData[status],
  }));

  const CHART_COLORS = [
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
  ];

  
  const salesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toLocaleDateString("en-US", { weekday: "short" });
    const dailyOrders = orders.filter(
      (o) => new Date(o.date).toDateString() === date.toDateString()
    );
    return {
      day: dateString,
      sales: dailyOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    };
  }).reverse();

  const recentOrders = orders.slice(-5).reverse();

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-xs border border-slate-200 dark:border-slate-700">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            📅{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-2xl shadow-xs border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm ${stat.bgColor} overflow-hidden group hover:shadow-md transition-all duration-300`}
          >
            {/* Animated background element */}
            <div
              className={`absolute -top-4 -right-4 w-20 h-20 bg-linear-to-r ${stat.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
            ></div>

            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-emerald-500 text-sm font-semibold">
                    {stat.change}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    from last month
                  </span>
                </div>
              </div>
              <div
                className={`p-4 rounded-xl bg-linear-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-xs border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
              Order Status Distribution
            </h3>
          </div>
          {pieChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        strokeWidth={2}
                        stroke="#fff"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "12px",
                      color: "#f8fafc",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                    }}
                    itemStyle={{
                      color: "#f8fafc", 
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <Package className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-lg">No order data available</p>
              <p className="text-sm mt-1">
                Orders will appear here once placed
              </p>
            </div>
          )}
        </motion.div>

        {/* Sales Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-xs border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
              Recent Sales Trend
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  strokeOpacity={0.6}
                />
                <XAxis
                  dataKey="day"
                  stroke="#64748b"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                  }}
                  formatter={(value) => [`₹${value}`, "Sales"]}
                  cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
                />
                <Bar
                  dataKey="sales"
                  fill="url(#salesGradient)"
                  radius={[8, 8, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-xs border border-slate-200/60 dark:border-slate-700/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
            Recent Orders
          </h3>
        </div>
        <div className="space-y-3">
          {recentOrders.length > 0 ? (
            recentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4  bg-slate-50/50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-600 rounded-lg shadow-xs">
                    <ShoppingCart className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-slate-800 dark:text-white font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      Order #{order.orderId}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {order.email}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-800 dark:text-white font-bold text-lg">
                    ₹{(order.total || 0).toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      order.status === "Delivered"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : order.status === "Pending"
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                        : order.status === "Cancelled"
                        ? "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                        : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No recent orders</p>
              <p className="text-sm mt-1">New orders will appear here</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
