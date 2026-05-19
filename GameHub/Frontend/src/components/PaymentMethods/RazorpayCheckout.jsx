import React from 'react';

const RazorpayCheckout = ({
  razorpayKey,
  orderId,
  amount,
  currency = 'INR',
  name = 'GameHub',
  description = 'Game purchase',
  prefill = {},
  onSuccess,
  onError,
  className = 'px-4 py-2 bg-indigo-600 text-white rounded',
  buttonText,
}) => {
  const openCheckout = () => {
    if (!window.Razorpay) {
      onError?.(new Error('Razorpay script not loaded'));
      return;
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(amount * 100),
      currency,
      name,
      description,
      prefill,
      handler: function (response) {
        onSuccess?.(response);
      },
      modal: {
        ondismiss: function () {
          onError?.(new Error('Payment popup closed'));
        },
      },
    };

    try {
      if (orderId) {
        options.order_id = orderId;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      onError?.(err);
    }
  };

  return (
    <button
      type="button"
      onClick={openCheckout}
      className={className}
    >
      {buttonText || `Pay ${currency} ${amount}`}
    </button>
  );
};

export default RazorpayCheckout;
