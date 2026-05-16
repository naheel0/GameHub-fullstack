import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { BaseUrl, buildAuthHeaders, normalizeGame } from '../Services/api';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const mapPaymentMethod = (method) => {
  switch ((method || '').toLowerCase()) {
    case 'card':
      return 'CreditDebitCard';
    case 'paypal':
      return 'PayPal';
    case 'apple':
      return 'ApplePay';
    case 'google':
      return 'GooglePay';
    default:
      return 'CreditDebitCard';
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, authFetch } = useAuth();

  const API_BASE = BaseUrl;
  const token = user?.accessToken;

  const fetchGame = useCallback(async (gameId) => {
    try {
      const response = await fetch(`${API_BASE}/games/${gameId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return normalizeGame(data);
    } catch (error) {
      console.error('Error fetching game:', error);
      return null;
    }
  }, [API_BASE]);

  const mapCartItem = useCallback(async (item) => {
    const game = await fetchGame(item.gameId);

    return {
      id: item.gameId,
      cartItemId: item.gameId,
      name: game?.name || item.gameName || 'Unknown Game',
      price: typeof item.price === 'number' ? item.price : game?.price || 0,
      quantity: item.quantity || 1,
      images: (game?.images && game.images.length > 0)
        ? game.images
        : item.image
          ? [item.image]
          : [],
      inStock: typeof game?.inStock === 'boolean' ? game.inStock : true,
      genre: game?.genre || '',
      platform: game?.platform || '',
      rating: game?.rating || 0,
      description: game?.description || '',
      trailer: game?.trailer || '',
    };
  }, [fetchGame]);

  const loadCart = useCallback(async () => {
    if (!user || !token) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authFetch(`${API_BASE}/cart`, {
        headers: { ...buildAuthHeaders(token) },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const items = await response.json();
      const mapped = await Promise.all((items || []).map(mapCartItem));
      setCart(mapped.filter(Boolean));
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Failed to load cart');
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, mapCartItem, token, user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (game, quantity = 1) => {
    if (!user || !token) {
      toast.warning('Please log in to add items to your cart.');
      return false;
    }

    if (!game.inStock) {
      toast.error('Sorry, this game is out of stock!');
      return false;
    }

    try {
      const response = await authFetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...buildAuthHeaders(token) },
        credentials: 'include',
        body: JSON.stringify({ gameId: game.id, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      await loadCart();
      toast.success(`${game.name} added to cart!`);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      return false;
    }
  };

  const removeFromCart = async (gameId) => {
    if (!user || !token) {
      toast.warning('Please log in to manage your cart.');
      return false;
    }

    try {
      const response = await authFetch(`${API_BASE}/cart/${gameId}`, {
        method: 'DELETE',
        headers: { ...buildAuthHeaders(token) },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }

      setCart((prev) => prev.filter((item) => item.id !== gameId));
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove from cart');
      return false;
    }
  };

  const updateQuantity = async (gameId, newQuantity) => {
    if (!user || !token) {
      toast.warning('Please log in to manage your cart.');
      return false;
    }

    if (newQuantity < 1) {
      return await removeFromCart(gameId);
    }

    try {
      const response = await authFetch(`${API_BASE}/cart/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...buildAuthHeaders(token) },
        credentials: 'include',
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      setCart((prev) => prev.map((item) => (
        item.id === gameId ? { ...item, quantity: newQuantity } : item
      )));
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      return false;
    }
  };

  const clearCart = async () => {
    if (!user || !token) {
      toast.warning('Please log in to manage your cart.');
      return false;
    }

    try {
      const response = await authFetch(`${API_BASE}/cart`, {
        method: 'DELETE',
        headers: { ...buildAuthHeaders(token) },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setCart([]);
      toast.info('Cart cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return false;
    }
  };

  const getCartSummary = () => {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return {
      totalItems,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      items: cart.length,
    };
  };

  const getItemQuantity = (gameId) => {
    const item = cart.find((cartItem) => cartItem.id === gameId);
    return item ? item.quantity : 0;
  };

  const isInCart = (gameId) => {
    return cart.some((item) => item.id === gameId);
  };

  const isEmpty = () => {
    return cart.length === 0;
  };

  const checkout = async (paymentMethod, address) => {
    if (!user || !token) {
      toast.warning('Please log in to checkout.');
      return { success: false, error: 'User not logged in' };
    }

    if (isEmpty()) {
      toast.warning('Your cart is empty.');
      return { success: false, error: 'Cart is empty' };
    }

    if (!address?.addressId && !address?.id) {
      toast.error('Please select a shipping address.');
      return { success: false, error: 'No address selected' };
    }

    try {
      const response = await authFetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...buildAuthHeaders(token) },
        credentials: 'include',
        body: JSON.stringify({
          addressId: address.addressId || address.id,
          paymentMethod: mapPaymentMethod(paymentMethod),
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload?.message || 'Failed to process checkout');
      }

      const orderDto = await response.json();
      const items = await Promise.all((orderDto.items || []).map(async (item) => {
        const game = await fetchGame(item.gameId);
        return {
          gameId: item.gameId,
          name: item.gameName || game?.name || 'Unknown Game',
          price: item.price,
          quantity: item.quantity,
          image: game?.images?.[0] || '',
          genre: game?.genre || '',
          platform: game?.platform || '',
        };
      }));

      const order = {
        id: orderDto.orderId,
        items,
        summary: {
          subtotal: Number(orderDto.subTotal || 0).toFixed(2),
          tax: Number(orderDto.tax || 0).toFixed(2),
          total: Number(orderDto.total || 0).toFixed(2),
        },
        paymentMethod: orderDto.paymentMethod,
        status: orderDto.status,
        date: orderDto.orderDate,
        shippingAddress: orderDto.shippingAddress || address,
      };

      setCart([]);
      toast.success('Order placed successfully! Thank you for your purchase.');
      return { success: true, order };
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(error.message || 'Failed to process checkout');
      return { success: false, error: error.message };
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    refreshCart,
    getCartSummary,
    getItemQuantity,
    isInCart,
    isEmpty,
    getCartItemCount: () => getCartSummary().totalItems,
    getTotalPrice: () => parseFloat(getCartSummary().subtotal),
    isCartEmpty: isEmpty,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
