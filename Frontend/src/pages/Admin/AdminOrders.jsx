import { Eye, Trash2, Package, X, Users, IndianRupee, MapPin, Calendar, Phone } from "lucide-react";
import { useAdmin } from "./contexts/AdminContext";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState,useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import SearchBar from "./components/SearchBar";
import { getImageUrl, handleImageError } from "../../Services/api";

export default function AdminOrders() {
  const { orders, deleteOrder, updateOrderStatus, users, loading } = useAdmin();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!searchQuery) {
      setFilteredOrders(orders);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
        setFilteredOrders(orders.filter(
          (order) =>
            (order.orderId || order.id).toString().toLowerCase().includes(lowerQuery) ||
            (order.email || '').toLowerCase().includes(lowerQuery)
        ));
    }
  }, [orders, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };


  const getTotalPrice = (items, total) =>
    items && items.length
      ? items.reduce((sum, item) => sum + item.price * (item.quantity || item.qty || 1), 0)
      : (total || 0);

  const getTotalQty = (items) =>
    items.reduce((sum, item) => sum + (item.quantity || item.qty || 1), 0);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(id);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateOrderStatus(id, newStatus);
  };

  const getUsernameFromEmail = (email) => {
    const user = users.find((user) => user.email === email);
    return user?.firstName || user?.name || email;
  };

 const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentOrders = filteredOrders?.slice(indexOfFirstItem, indexOfLastItem) || [];
const totalPages = Math.ceil((filteredOrders?.length || 0) / itemsPerPage);

  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black/70 backdrop-blur-md flex items-center justify-center">
        <div className="bg-gray-800 rounded-xl p-6 flex items-center gap-3 border border-gray-700">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
          <span className="text-white">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/70 backdrop-blur-md px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-3xl p-6 sm:p-8 w-full max-w-6xl mx-auto shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <Package className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Order Management
              </h2>
              <p className="text-sm text-gray-400">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, orders.length)} of {orders.length} orders
              </p>
            </div>
          </div>
          <SearchBar onSearch={handleSearch}
          className="px-3 py-3" />

          {/* Items Per Page */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>per page</span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No orders found</p>
          </div>
        ) : (
          <>
            {/* Orders Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-700/50">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="p-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">Order ID</th>
                    <th className="p-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">Customer</th>
                    <th className="p-4 text-left text-gray-300 font-semibold text-sm uppercase tracking-wider">Total</th>
                    <th className="p-4 text-center text-gray-300 font-semibold text-sm uppercase tracking-wider">Items</th>
                    <th className="p-4 text-center text-gray-300 font-semibold text-sm uppercase tracking-wider">Status</th>
                    <th className="p-4 text-center text-gray-300 font-semibold text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-700/50">
                  {currentOrders.map((order) => (
                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/30 transition-all duration-200 group">
                      {/* Order ID */}
                      <td className="p-4">
                        <div className="text-white font-medium">{order.orderId || order.id}</div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="text-gray-300">{getUsernameFromEmail(order.email)}</div>
                        <div className="text-gray-400 text-sm">{order.email}</div>
                      </td>

                      {/* Total */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          <IndianRupee className="w-4 h-4" />
                          {getTotalPrice(order.items, order.total).toLocaleString()}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="p-4 text-center">
                        <div className="text-white font-medium">{getTotalQty(order.items)}</div>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <select
                          value={order.status || "Pending"}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`bg-gray-800 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200 cursor-pointer ${
                            order.status?.toLowerCase() === "delivered"
                              ? "border-green-500 text-green-400"
                              : order.status?.toLowerCase() === "cancelled"
                              ? "border-red-500 text-red-400"
                              : "border-yellow-500 text-yellow-400"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Placed">Placed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 group-hover:scale-110"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <div className="text-gray-400 text-sm">Page {currentPage} of {totalPages}</div>

              <div className="flex items-center gap-2">
                <button onClick={goToPrevPage} disabled={currentPage === 1} className={`flex items-center gap-1 px-3 py-2 rounded-lg transition duration-200 ${currentPage === 1 ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
                  <ChevronLeftIcon className="h-6 w-5" />
                </button>
                {getPageNumbers().map((pageNumber, index) => (
                  <button key={index} onClick={() => typeof pageNumber === "number" && goToPage(pageNumber)} disabled={pageNumber === "..."} className={`min-w-10 h-10 flex items-center justify-center rounded-lg transition duration-200 ${pageNumber === currentPage ? "bg-red-600 text-white" : pageNumber === "..." ? "text-gray-500 cursor-default" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
                    {pageNumber}
                  </button>
                ))}
                <button onClick={goToNextPage} disabled={currentPage === totalPages} className={`flex items-center gap-1 px-3 py-2 rounded-lg transition duration-200 ${currentPage === totalPages ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-gray-700 hover:bg-gray-600 text-white"}`}>
                  <ChevronRightIcon className="h-6 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-3xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl">
                  <Package className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Order Details</h2>
                  <p className="text-gray-400 text-sm font-mono">{selectedOrder.orderId || selectedOrder.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="text-white font-semibold">Customer Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400 text-xs">Name</p>
                  <p className="text-white text-sm">{selectedOrder.userFullName || getUsernameFromEmail(selectedOrder.email)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="text-white text-sm break-all">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Order Date</p>
                  <div className="flex items-center gap-1 text-white text-sm">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    {selectedOrder.date ? new Date(selectedOrder.date).toLocaleString() : "—"}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    selectedOrder.status?.toLowerCase() === "delivered"
                      ? "text-green-400 border-green-500 bg-green-500/20"
                      : selectedOrder.status?.toLowerCase() === "cancelled"
                      ? "text-red-400 border-red-500 bg-red-500/20"
                      : "text-yellow-400 border-yellow-500 bg-yellow-500/20"
                  }`}>
                    {selectedOrder.status || "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && Object.values(selectedOrder.shippingAddress).some(Boolean) && (
              <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <h3 className="text-white font-semibold">Shipping Address</h3>
                </div>
                <div className="text-sm space-y-1">
                  {selectedOrder.shippingAddress.fullName && (
                    <p className="text-white font-medium">{selectedOrder.shippingAddress.fullName}</p>
                  )}
                  {selectedOrder.shippingAddress.phone && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Phone className="w-3 h-3 text-gray-500" />
                      {selectedOrder.shippingAddress.phone}
                    </div>
                  )}
                  <p className="text-gray-300">
                    {[
                      selectedOrder.shippingAddress.addressLine1,
                      selectedOrder.shippingAddress.addressLine2,
                    ].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-gray-300">
                    {[
                      selectedOrder.shippingAddress.city,
                      selectedOrder.shippingAddress.state,
                      selectedOrder.shippingAddress.zipCode,
                    ].filter(Boolean).join(", ")}
                  </p>
                  {selectedOrder.shippingAddress.country && (
                    <p className="text-gray-300">{selectedOrder.shippingAddress.country}</p>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/50">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-4 h-4 text-green-400" />
                <h3 className="text-white font-semibold">Order Items</h3>
              </div>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-700/30 p-3 rounded-xl border border-gray-600/50">
                    <img
                      src={item.image || getImageUrl([], 0)}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg shrink-0"
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">Qty: {item.qty || item.quantity || 1} × ₹{item.price.toLocaleString()}</p>
                    </div>
                    <div className="text-white font-semibold text-sm shrink-0">
                      ₹{(item.price * (item.qty || item.quantity || 1)).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 space-y-2">
              {selectedOrder.subtotal != null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">₹{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
              )}
              {selectedOrder.tax != null && selectedOrder.tax > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-white">₹{selectedOrder.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-gray-300 font-medium">Total</span>
                <div className="flex items-center gap-1 text-xl font-bold text-white">
                  <IndianRupee className="w-5 h-5" />
                  {getTotalPrice(selectedOrder.items, selectedOrder.total).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
