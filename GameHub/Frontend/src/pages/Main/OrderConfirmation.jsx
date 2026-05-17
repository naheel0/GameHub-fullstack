import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CheckBadgeIcon,
  ShoppingBagIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { 
  CheckBadgeIcon as CheckBadgeSolid,
  ShoppingBagIcon as ShoppingBagSolid 
} from '@heroicons/react/24/solid';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const orderData = location.state?.order || JSON.parse(localStorage.getItem('lastOrder') || 'null');
    
    if (orderData) {
      const processedOrder = processOrderData(orderData);
      setOrder(processedOrder);
      localStorage.setItem('lastOrder', JSON.stringify(processedOrder));
      
      if (location.state?.fromCart) {
        clearCart();
      }
    } else {
      navigate('/');
    }
    
    setLoading(false);
  }, [location, navigate, clearCart]);

  const processOrderData = (orderData) => {
    if (orderData.type === 'instant_purchase') {
      return {
        id: orderData.id || `order_${Date.now()}`,
        items: orderData.items || [],
        summary: orderData.summary || {
          subtotal: '0.00',
          tax: '0.00',
          total: '0.00'
        },
        status: 'completed',
        paymentMethod: orderData.paymentMethod || 'card',
        date: orderData.date || new Date().toISOString(),
        shippingAddress: orderData.shippingAddress || null,
        type: 'instant_purchase'
      };
    }
    
    return {
      id: orderData.id || `order_${Date.now()}`,
      items: orderData.items || [],
      summary: orderData.summary || {
        subtotal: '0.00',
        tax: '0.00',
        total: '0.00'
      },
      status: orderData.status || 'completed',
      paymentMethod: orderData.paymentMethod || 'card',
      date: orderData.date || new Date().toISOString(),
      shippingAddress: orderData.shippingAddress || null
    };
  };

  useEffect(() => {
    if (order) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order]);

  const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  const date = new Date(dateString);
  return isNaN(date) ? new Date().toLocaleString('en-US', options) : date.toLocaleString('en-US', options);
};

  const getPaymentMethodIcon = (method) => {
    if (!method) return <CreditCardIcon className="h-5 w-5" />;
    
    switch (method.toLowerCase()) {
      case 'card':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'paypal':
        return 'PP';
      case 'crypto':
        return '₿';
      default:
        return <CreditCardIcon className="h-5 w-5" />;
    }
  };

  const formatPaymentMethod = (method) => {
    const normalized = (method || '').toLowerCase();
    switch (normalized) {
      case 'creditdebitcard':
        return 'Credit/Debit Card';
      case 'paypal':
        return 'PayPal';
      case 'applepay':
        return 'Apple Pay';
      case 'googlepay':
        return 'Google Pay';
      case 'card':
        return 'Card';
      default:
        return method || 'Card';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-900 via-gray-900 to-black py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-black py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Order Not Found</h1>
            <p className="text-gray-400 mb-6">We couldn't find your order details.</p>
            <Link
              to="/"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-300"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderId = order.id || 'Unknown Order';
  const orderDate = order.date || new Date().toISOString();
  const orderStatus = order.status || 'completed';
  const paymentMethod = order.paymentMethod || 'card';
  const paymentMethodLabel = formatPaymentMethod(paymentMethod);
  const orderSummary = order.summary || { subtotal: '0.00', tax: '0.00', total: '0.00' };
  const orderItems = order.items || [];
  const shippingAddress = order.shippingAddress || null;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 via-gray-900 to-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
            <CheckBadgeSolid className="h-24 w-24 text-green-400 relative z-10 mx-auto mb-6" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-green-400 mb-2">
            Thank you for your purchase{user?.firstName ? `, ${user.firstName}` : ''}!
          </p>
          <p className="text-gray-400">
            Your order has been successfully processed and your games are ready to play.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden mb-8">
          {/* Order Header */}
          <div className="bg-linear-to-r from-green-600 to-green-700 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Order #{orderId.slice(-8).toUpperCase()}
                </h2>
                <p className="text-green-100 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {formatDate(orderDate)}
                </p>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2 mt-4 sm:mt-0">
                <span className="text-white font-semibold text-lg">
                  ₹{orderSummary.total || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {shippingAddress && Object.values(shippingAddress).some(Boolean) && (
            <div className="px-6 pb-2">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  {shippingAddress.addressId && (
                    <p><span className="text-gray-400">Address ID:</span> {shippingAddress.addressId}</p>
                  )}
                  {shippingAddress.fullName && <p><span className="text-gray-400">Name:</span> {shippingAddress.fullName}</p>}
                  {(shippingAddress.addressLine1 || shippingAddress.addressLine2) && (
                    <p>
                      <span className="text-gray-400">Address:</span> {shippingAddress.addressLine1}
                      {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ''}
                    </p>
                  )}
                  {(shippingAddress.city || shippingAddress.state || shippingAddress.zipCode) && (
                    <p>
                      <span className="text-gray-400">Location:</span> {shippingAddress.city}{shippingAddress.city && shippingAddress.state ? ', ' : ''}{shippingAddress.state} {shippingAddress.zipCode}
                    </p>
                  )}
                  {shippingAddress.country && <p><span className="text-gray-400">Country:</span> {shippingAddress.country}</p>}
                  {shippingAddress.phone && <p><span className="text-gray-400">Phone:</span> {shippingAddress.phone}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Order Content */}
          <div className="p-6">
            {/* Order Items */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <ShoppingBagSolid className="h-5 w-5 mr-2 text-green-400" />
                Games Purchased ({orderItems.length})
              </h3>
              {orderItems.length > 0 ? (
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-green-500/30 transition duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.image || '/images/placeholder-game.jpg'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-game.jpg';
                          }}
                        />
                        <div>
                          <h4 className="text-white font-semibold">{item.name || 'Unknown Game'}</h4>
                          <p className="text-gray-400 text-sm">Quantity: {item.quantity || 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">₹{item.price || '0.00'}</p>
                        <p className="text-green-400 text-sm">
                          ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-700/30 rounded-lg">
                  <p className="text-gray-400">No items in this order</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Payment & Delivery Info */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-400">Status</span>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {orderStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-400 flex items-center">
                      {getPaymentMethodIcon(paymentMethod)}
                      <span className="ml-2">Payment Method</span>
                    </span>
                    <span className="text-white font-semibold capitalize">
                      {paymentMethodLabel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-400 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      Delivery
                    </span>
                    <span className="text-green-400 font-semibold">Instant Digital</span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Cost Summary</h3>
                <div className="space-y-2 bg-gray-700/30 rounded-lg p-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal</span>
                    <span>₹{orderSummary.subtotal || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax</span>
                    <span>₹{orderSummary.tax || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Total</span>
                      <span className="text-green-400">₹{orderSummary.total || '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">
            What's Next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-green-500/30 transition duration-300">
              <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <EnvelopeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Check Your Email</h4>
              <p className="text-gray-400 text-sm">
                We've sent download links and installation instructions to your email.
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-green-500/30 transition duration-300">
              <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserIcon className="h-6 w-6 text-purple-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Access Your Library</h4>
              <p className="text-gray-400 text-sm">
                Your games are now available in your personal game library.
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-green-500/30 transition duration-300">
              <div className="bg-orange-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingBagIcon className="h-6 w-6 text-orange-400" />
              </div>
              <h4 className="text-white font-semibold mb-2">Need Help?</h4>
              <p className="text-gray-400 text-sm">
                Visit our support center for installation help or technical issues.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg transition duration-300 transform hover:scale-105 flex items-center justify-center font-semibold"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Continue Shopping
          </Link>
          
          <Link
            to="/"
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg transition duration-300 flex items-center justify-center font-semibold"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Back to Home
            {countdown > 0 && (
              <span className="ml-2 bg-gray-600 px-2 py-1 rounded text-xs">
                {countdown}s
              </span>
            )}
          </Link>
          
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition duration-300 flex items-center justify-center font-semibold"
          >
            Print Receipt
          </button>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 pt-6 border-t border-gray-700/50">
          <p className="text-gray-400 text-sm">
            Need assistance? <Link to="/contact" className="text-green-400 hover:text-green-300">Contact our support team</Link> • 
            Order confirmation sent to: <span className="text-white">{user?.email}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;