import React from 'react';
import {
  LockClosedIcon,
  ShieldCheckIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const CartSummary = ({ summary, onCheckout, onContinueShopping, hasOutOfStock }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-8">
      <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-300">
          <span>Items ({summary.totalItems}):</span>
          <span>₹{summary.subtotal}</span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span>Shipping:</span>
          <span className="text-green-400">FREE</span>
        </div>

        <div className="flex justify-between text-gray-300">
          <span>Tax:</span>
          <span>₹{summary.tax}</span>
        </div>

        <div className="border-t border-gray-700 my-4"></div>

        <div className="flex justify-between text-lg font-bold text-white">
          <span>Total:</span>
          <span>₹{summary.total}</span>
        </div>
      </div>

      <button
        onClick={onCheckout}
        disabled={hasOutOfStock}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
      >
        `Proceed to Payment - ₹${summary.total}`
      </button>

      {hasOutOfStock && (
        <div className="text-red-400 text-sm text-center mb-4">
          Please remove out-of-stock items before continuing to payment.
        </div>
      )}

      <button
        onClick={onContinueShopping}
        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 px-4 rounded-lg font-medium transition duration-300 border border-gray-700"
      >
        Continue Shopping
      </button>

      <div className="mt-6 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <LockClosedIcon className="h-4 w-4" />
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <ShieldCheckIcon className="h-4 w-4" />
          <span>Buyer Protection</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <TruckIcon className="h-4 w-4" />
          <span>Free Shipping</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
