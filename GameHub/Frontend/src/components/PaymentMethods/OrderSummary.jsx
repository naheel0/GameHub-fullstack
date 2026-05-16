import React from "react";
import { FaShieldAlt, FaLock } from "react-icons/fa";
import { SiStripe } from "react-icons/si";
const OrderSummary = ({ summary, orderItems, selectedAddress }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 sticky top-6 border border-gray-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>

      {/* Order Items */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {orderItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-b-0"
          >
            <div className="flex items-center space-x-3">
              <img
                src={item.image || "/api/placeholder/40/40"}
                alt={item.name}
                className="w-10 h-10 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = "/api/placeholder/40/40";
                  e.target.onerror = null;
                }}
              />
              <div>
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
            </div>
            <span className="font-semibold text-white">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-gray-700/50 pt-4">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Subtotal</span>
          <span>₹{summary?.subtotal || "0.00"}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Tax</span>
          <span>₹{summary?.tax || "0.00"}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Shipping</span>
          <span className="text-green-400">FREE</span>
        </div>
      </div>

      <div className="border-t border-gray-700/50 pt-4 mb-4">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-white">Total</span>
          <span className="text-red-500">₹{summary?.total || "0.00"}</span>
        </div>
      </div>

      {/* Shipping Address Preview */}
      {selectedAddress && (
        <div className="border-t border-gray-700/50 pt-4 mb-4">
          <h4 className="font-semibold text-white mb-2">Shipping to:</h4>
          <div className="text-sm text-gray-300">
            <p className="font-medium">{selectedAddress.fullName}</p>
            <p>{selectedAddress.addressLine1}</p>
            {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
            <p>
              {selectedAddress.city}, {selectedAddress.state}{" "}
              {selectedAddress.zipCode}
            </p>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="border-t border-gray-700/50 pt-4">
        <div className="flex justify-center space-x-4 mb-3">
          <SiStripe className="text-blue-400 text-2xl" />
          <FaShieldAlt className="text-green-400 text-2xl" />
          <FaLock className="text-red-500 text-2xl" />
        </div>
        <p className="text-xs text-gray-400 text-center">
          Your payment is secure and encrypted. We do not store your payment
          details.
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;