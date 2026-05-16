import React, { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

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
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (cart.some((item) => !item.inStock)) {
      toast.error(
        "Please remove out-of-stock items before proceeding to payment."
      );
      return;
    }

      setIsCheckingOut(true);
    try {
      navigate("/payment", {
        state: {
          cartSummary: getCartSummary(),
          cartItems: cart,
        },
      });
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to proceed to payment.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading your cart...</p>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            disabled={isCheckingOut}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition duration-300 border border-gray-700 disabled:opacity-50"
          >
            <TrashIcon className="h-4 w-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.cartItemId || item.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Game Image */}
                  <div className="shrink-0">
                    <img
                      src={item.images?.[0] || "/images/placeholder-game.jpg"}
                      alt={item.name}
                      className="w-24 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = "/images/placeholder-game.jpg";
                      }}
                    />
                  </div>

                  {/* Game Details */}
                  <div className="grow">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                        {item.genre}
                      </span>
                      <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                        {item.platform}
                      </span>
                    </div>
                    {!item.inStock && (
                      <span className="text-red-400 text-sm font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-3 mb-4">
                      <label className="text-sm text-gray-400">Quantity:</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || isCheckingOut}
                          className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 disabled:opacity-50 transition duration-300"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-white font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={isCheckingOut}
                          className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 disabled:opacity-50 transition duration-300"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">
                          ₹{item.price} each
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        disabled={isCheckingOut}
                        className="text-gray-400 hover:text-red-400 transition duration-300 disabled:opacity-50"
                        title="Remove item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Order Summary
              </h3>

              {/* Summary Rows */}
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

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.some((item) => !item.inStock)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  `Proceed to Payment - ₹${summary.total}`
                )}
              </button>

              {cart.some((item) => !item.inStock) && (
                <div className="text-red-400 text-sm text-center mb-4">
                  ⚠️ Some items in your cart are out of stock. Please remove
                  them to proceed.
                </div>
              )}

              <button
                onClick={handleContinueShopping}
                disabled={isCheckingOut}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 px-4 rounded-lg font-medium transition duration-300 border border-gray-700 disabled:opacity-50"
              >
                Continue Shopping
              </button>
            </div>

            {/* Security Badges */}
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
        </div>
      </div>
    </div>
  );
};

export default CartPage;
