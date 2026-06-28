import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { BaseUrl } from '../../Services/api';
import { 
  CheckBadgeIcon,
  ShoppingBagIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { 
  CheckBadgeIcon as CheckBadgeSolid,
  ShoppingBagIcon as ShoppingBagSolid 
} from '@heroicons/react/24/solid';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart, refreshCart } = useCart();
  const { user, loading: authLoading, authFetch } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  const clearPendingPaymentDraft = () => {
    try {
      localStorage.removeItem('pendingRazorpayOrder');
    } catch (error) {
      console.debug('Failed to remove pendingRazorpayOrder', error);
    }
  };

  const extractPurchaseIdFromReference = (value) => {
    if (!value) return null;
    const match = /^purchase-(\d+)-/i.exec(value);
    return match ? Number(match[1]) : null;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasRazorpayCallback = Boolean(
      params.get('razorpay_order_id') ||
        params.get('razorpay_payment_id') ||
        params.get('razorpay_payment_link_id') ||
        params.get('payment_link_id') ||
        params.get('payment_link') ||
        params.get('razorpay_payment_link_status') ||
        params.get('status'),
    );

    const orderData = location.state?.order || JSON.parse(localStorage.getItem('lastOrder') || 'null');

    if (orderData) {
      const processedOrder = processOrderData(orderData);
      setOrder(processedOrder);
      localStorage.setItem('lastOrder', JSON.stringify(processedOrder));

      if (location.state?.fromCart) {
        clearCart();
      }

      setLoading(false);
      return;
    }

    if (hasRazorpayCallback) {
      // Leave pendingPurchase and pendingRazorpayOrder for handlePaidPaymentLink/handleFailedPaymentLink
      // to read. They will be cleaned up after verification.
      setLoading(true);
      return;
    }

    clearPendingPaymentDraft();
    setLoading(false);
    navigate('/');
  }, [location, navigate, clearCart]);

  const handlePaidPaymentLink = async (user, paymentLinkId, razorpayPaymentId) => {
    // Read pendingPurchase BEFORE removal to get the purchaseId for confirmation
    const pendingPurchaseRaw = (() => {
      try {
        const raw = localStorage.getItem('pendingPurchase');
        const parsed = raw ? Number(raw) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      } catch (e) {
        console.debug('Failed to read pendingPurchase', e);
        return null;
      }
    })();

    // Read pendingRazorpayOrder BEFORE clearPendingPaymentDraft for fallback
    const pendingOrder = (() => {
      try {
        return JSON.parse(localStorage.getItem('pendingRazorpayOrder') || 'null');
      } catch (error) {
        console.debug('Failed to read pendingRazorpayOrder', error);
        return null;
      }
    })();

    // Remove pendingPurchase synchronously BEFORE any await to prevent
    // loadCart() auto-restore logic from winning the race and restoring cart items
    try { localStorage.removeItem('pendingPurchase'); } catch (error) { console.debug('Failed to remove pendingPurchase', error); }
    clearPendingPaymentDraft();

    try {
      setLoading(true);

      const purchaseId = pendingOrder?.purchaseId || pendingPurchaseRaw;
      let confirmed = false;

      if (purchaseId) {
        const confirmResp = await authFetch(`${BaseUrl}/payments/confirm-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            purchaseId,
            razorpayPaymentLinkId: paymentLinkId || '',
            razorpayPaymentId: razorpayPaymentId || '',
          }),
        });

        if (confirmResp.ok) {
          const confirmation = await confirmResp.json();
          if (confirmation?.success && confirmation?.orderId) {
            confirmed = true;
            const orderResp = await authFetch(`${BaseUrl}/orders/${confirmation.orderId}`);
            if (orderResp.ok) {
              const orderData = await orderResp.json();
              const processed = processOrderData(orderData);
              setOrder(processed);
              localStorage.setItem('lastOrder', JSON.stringify(processed));
            }
          }
        }
      }

      if (!confirmed && pendingOrder) {
        const processed = processOrderData(pendingOrder);
        setOrder(processed);
        localStorage.setItem('lastOrder', JSON.stringify(processed));
      }

      // Only clear cart for non-buy-now purchases (Buy Now doesn't add items to cart)
      const hasBuyNowIntent = localStorage.getItem('buyNowIntent');
      if (!hasBuyNowIntent) {
        await clearCart();
      }
      // Clean up buyNowIntent after successful payment
      if (hasBuyNowIntent) {
        try { localStorage.removeItem('buyNowIntent'); } catch { /* ignore */ }
      }
    } catch (err) {
      console.error('Finalize paid payment link error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFailedPaymentLink = async (user, referenceId) => {
    // For Buy Now, there's nothing to restore since items were never in cart
    const hasBuyNowIntent = localStorage.getItem('buyNowIntent');
    try {
      setLoading(true);
      const purchaseFromReference = extractPurchaseIdFromReference(referenceId);
      const pendingRaw = localStorage.getItem('pendingPurchase');
      const pendingParsed = pendingRaw ? Number(pendingRaw) : NaN;
      const purchaseId = purchaseFromReference || (Number.isFinite(pendingParsed) && pendingParsed > 0 ? pendingParsed : null);

      if (purchaseId && !hasBuyNowIntent) {
        const resp = await authFetch(`${BaseUrl}/payments/restore/${purchaseId}`, {
          method: 'POST',
        });
        if (resp.ok) {
          await refreshCart();
          try { localStorage.removeItem('pendingPurchase'); } catch (e) { console.debug('Failed to remove pendingPurchase', e); }
          clearPendingPaymentDraft();
        }
      } else if (!hasBuyNowIntent) {
        await refreshCart();
        clearPendingPaymentDraft();
      } else {
        // Buy Now failure: just clean up and go back to products
        clearPendingPaymentDraft();
        try { localStorage.removeItem('pendingPurchase'); } catch { /* ignore */ }
        try { localStorage.removeItem('buyNowIntent'); } catch { /* ignore */ }
      }
    } catch (err) {
      console.error('Restore cart error:', err);
    } finally {
      setLoading(false);
      navigate(hasBuyNowIntent ? '/products' : '/cart');
    }
  };

  const handleRazorpayVerification = async (user, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    // For Buy Now, there's nothing to restore since items were never in cart
    const hasBuyNowIntent = localStorage.getItem('buyNowIntent');
    try {
      setLoading(true);
      const resp = await authFetch(`${BaseUrl}/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          RazorpayOrderId: razorpayOrderId,
          RazorpayPaymentId: razorpayPaymentId,
          RazorpaySignature: razorpaySignature,
        }),
      });

      if (!resp.ok) {
        if (!hasBuyNowIntent) await refreshCart();
        clearPendingPaymentDraft();
        try { localStorage.removeItem('buyNowIntent'); } catch { /* ignore */ }
        navigate(hasBuyNowIntent ? '/products' : '/cart');
        return;
      }

      const verification = await resp.json();
      if (verification?.success) {
        const orderResp = await authFetch(`${BaseUrl}/orders/${verification.orderId}`);
        if (orderResp.ok) {
          const orderData = await orderResp.json();
          const processed = processOrderData(orderData);
          setOrder(processed);
          localStorage.setItem('lastOrder', JSON.stringify(processed));
          try { localStorage.removeItem('pendingPurchase'); } catch (e) { console.debug('Failed to remove pendingPurchase', e); }
          clearPendingPaymentDraft();
          // Only clear cart for non-buy-now purchases (Buy Now doesn't add items to cart)
          if (!hasBuyNowIntent) {
            await clearCart();
          }
          // Clean up buyNowIntent after successful payment
          if (hasBuyNowIntent) {
            try { localStorage.removeItem('buyNowIntent'); } catch { /* ignore */ }
          }
        }
      } else {
        if (!hasBuyNowIntent) await refreshCart();
        clearPendingPaymentDraft();
        try { localStorage.removeItem('buyNowIntent'); } catch { /* ignore */ }
        navigate(hasBuyNowIntent ? '/products' : '/cart');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      if (!hasBuyNowIntent) await refreshCart();
      clearPendingPaymentDraft();
      try { localStorage.removeItem('buyNowIntent'); } catch { /* ignore */ }
      navigate(hasBuyNowIntent ? '/products' : '/cart');
    } finally {
      setLoading(false);
    }
  };

  // Handle Razorpay callback query parameters (redirects back to frontend)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const razorpayOrderId = params.get('razorpay_order_id');
    const razorpayPaymentId = params.get('razorpay_payment_id');
    const razorpaySignature = params.get('razorpay_signature');
    const paymentLinkId =
      params.get('razorpay_payment_link_id') ||
      params.get('payment_link_id') ||
      params.get('payment_link');
    const referenceId =
      params.get('razorpay_payment_link_reference_id') ||
      params.get('reference_id') ||
      params.get('reference');
    const paymentLinkStatus =
      params.get('razorpay_payment_link_status') ||
      params.get('status');

    const runVerification = async () => {
      // wait for auth initialization to avoid false negatives
      if (authLoading) return;

      // Handle payment link callback
      if (paymentLinkId) {
        if (!user) {
          navigate('/login');
          return;
        }

        const isPaid =
          (paymentLinkStatus && paymentLinkStatus.toLowerCase() === 'paid') ||
          (!paymentLinkStatus && Boolean(razorpayPaymentId));
        if (isPaid) {
          await handlePaidPaymentLink(user, paymentLinkId, razorpayPaymentId);
        } else {
          await handleFailedPaymentLink(user, referenceId);
        }
        return;
      }

      // Handle Razorpay direct verification
      if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
        if (!user) {
          navigate('/login');
          return;
        }
        await handleRazorpayVerification(user, razorpayOrderId, razorpayPaymentId, razorpaySignature);
        return;
      }
    };

    runVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, user, navigate, authLoading, authFetch]);

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
        paymentMethod: orderData.paymentMethod || 'Razorpay',
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
      paymentMethod: orderData.paymentMethod || 'Razorpay',
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

  const renderShippingAddressField = (label, value, showComma = false) => {
    if (!value) return null;
    return (
      <p>
        <span className="text-gray-400">{label}:</span> {value}
        {showComma ? ', ' : ''}
      </p>
    );
  };

  const hasShippingAddress = (address) => {
    return address && Object.values(address).some(Boolean);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-900 via-gray-900 to-black py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-24 w-24 bg-gray-800 animate-pulse rounded-full mx-auto mb-6" />
            <div className="h-10 bg-gray-800 animate-pulse rounded-lg w-64 mx-auto mb-4" />
            <div className="h-6 bg-gray-800 animate-pulse rounded w-96 mx-auto" />
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 mb-8">
            <div className="h-6 bg-gray-800 animate-pulse rounded w-32 mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-800 animate-pulse rounded-lg" />
                  <div>
                    <div className="h-5 bg-gray-800 animate-pulse rounded w-32 mb-2" />
                    <div className="h-4 bg-gray-800 animate-pulse rounded w-16" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-5 bg-gray-800 animate-pulse rounded w-12 mb-1" />
                  <div className="h-4 bg-gray-800 animate-pulse rounded w-16" />
                </div>
              </div>
            ))}
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

          {hasShippingAddress(shippingAddress) && (
            <div className="px-6 pb-2">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                <div className="space-y-1 text-sm text-gray-300">
                  {renderShippingAddressField('Address ID', shippingAddress.addressId)}
                  {renderShippingAddressField('Name', shippingAddress.fullName)}
                  {(shippingAddress.addressLine1 || shippingAddress.addressLine2) && renderShippingAddressField(
                    'Address',
                    `${shippingAddress.addressLine1}${shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ''}`
                  )}
                  {(shippingAddress.city || shippingAddress.state || shippingAddress.zipCode) && renderShippingAddressField(
                    'Location',
                    `${shippingAddress.city}${shippingAddress.city && shippingAddress.state ? ', ' : ''}${shippingAddress.state} ${shippingAddress.zipCode}`
                  )}
                  {renderShippingAddressField('Country', shippingAddress.country)}
                  {renderShippingAddressField('Phone', shippingAddress.phone)}
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