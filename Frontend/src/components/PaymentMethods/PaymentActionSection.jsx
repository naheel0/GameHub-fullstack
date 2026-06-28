import React from 'react';

const PaymentActionSection = ({ isProcessing, onPay, disabled }) => {
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-2xl p-6 border border-gray-700/50">
      <h2 className="text-2xl font-bold text-white mb-4">Continue to Payment</h2>
      <button
        type="button"
        onClick={onPay}
        disabled={disabled}
        className="w-full bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 px-6 rounded-lg transition duration-300 font-semibold flex items-center justify-center space-x-2 border border-red-600 disabled:border-gray-600"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Redirecting...
          </>
        ) : (
          <>
            <span>Continue with Razorpay</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentActionSection;
