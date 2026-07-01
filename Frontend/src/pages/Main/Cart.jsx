import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { CartItemSkeleton } from '../../components/common/Skeleton';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import CartItem from '../../components/Cart/CartItem';
import CartSummary from '../../components/Cart/CartSummary';

const CartPage = () => {
  const {
    cart,
    loading,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartSummary,
    isEmpty,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const summary = getCartSummary();

  const handleQuantityChange = async (gameId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(gameId, newQuantity);
  };

  const handleRemoveItem = async (gameId) => {
    await removeFromCart(gameId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cart.some((item) => !item.inStock)) {
      toast.error(
        'Remove out-of-stock items before continuing to payment.'
      );
      return;
    }

    navigate('/payment', {
      state: {
        cartSummary: getCartSummary(),
        cartItems: cart,
      },
    });
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-gray-800 animate-pulse rounded w-48" />
            <div className="h-9 bg-gray-800 animate-pulse rounded w-24" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="h-6 bg-gray-800 animate-pulse rounded mb-6 w-32" />
                <div className="space-y-3 mb-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-gray-800 animate-pulse rounded w-20" />
                      <div className="h-4 bg-gray-800 animate-pulse rounded w-16" />
                    </div>
                  ))}
                </div>
                <div className="h-12 bg-gray-800 animate-pulse rounded mb-4" />
                <div className="h-12 bg-gray-800 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Please Log In
            </h2>
            <p className="text-gray-400 mb-8">
              You need to be logged in to view your cart.
            </p>
            <Link
              to="/login"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isEmpty()) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-400 mb-8">
              Looks like you haven't added any games to your cart yet.
            </p>
            <button
              onClick={handleContinueShopping}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition duration-300 border border-gray-700"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.cartItemId || item.id}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
            <CartSummary
              summary={summary}
              onCheckout={handleCheckout}
              onContinueShopping={handleContinueShopping}
              hasOutOfStock={cart.some((item) => !item.inStock)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
