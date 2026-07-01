import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { getImageUrl, handleImageError } from '../../Services/api';

const OrderHistoryTab = ({ orders, loading, formatDate, formatRupees }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBagIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
        <p className="text-gray-400 mb-6">Start shopping to see your order history here.</p>
        <Link
          to="/products"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-300 inline-block"
        >
          Browse Games
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => (
        <div key={order.id || index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Order #{order.id?.slice(-8).toUpperCase() || `ORDER_${index + 1}`}
              </h3>
              <p className="text-gray-400 text-sm">
                {order.date ? formatDate(order.date) : 'Date not available'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-red-500">
                {formatRupees(order.summary?.total || order.total)}
              </p>
              <span
                className={`inline-block px-2 py-1 rounded text-xs ${
                  (order.status || 'Completed').toLowerCase() === 'delivered'
                    ? 'bg-green-500'
                    : (order.status || 'Completed').toLowerCase() === 'pending'
                    ? 'bg-yellow-500'
                    : (order.status || 'Completed').toLowerCase() === 'cancelled'
                    ? 'bg-red-500'
                    : 'bg-gray-500'
                } text-white`}
              >
                {order.status || 'Completed'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {order.items?.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-center space-x-4">
                  <img
                      src={item.image ? item.image : getImageUrl([], 0)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                    />
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-gray-400 text-sm">{item.genre}</p>
                    <p className="text-gray-400 text-sm">Qty: {item.quantity || 1}</p>
                  </div>
                </div>
                <p className="text-white font-semibold">
                  {formatRupees(item.price)}
                </p>
              </div>
            ))}
          </div>

          {order.summary && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Subtotal:</span>
                <span>{formatRupees(order.summary.subtotal)}</span>
              </div>
              {order.summary.tax > 0 && (
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Tax:</span>
                  <span>{formatRupees(order.summary.tax)}</span>
                </div>
              )}
              {order.summary.shipping > 0 && (
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Shipping:</span>
                  <span>{formatRupees(order.summary.shipping)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-white mt-2 pt-2 border-t border-gray-600">
                <span>Total:</span>
                <span>{formatRupees(order.summary.total)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryTab;
