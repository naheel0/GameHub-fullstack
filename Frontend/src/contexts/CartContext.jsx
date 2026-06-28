import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { BaseUrl, fetchWithGameCache } from '../Services/api';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, authFetch, loading: authLoading } = useAuth();

  const API_BASE = BaseUrl;

  const fetchGame = useCallback(async (gameId) => {
    try {
      const response = await fetchWithGameCache(API_BASE, gameId);
      return response;
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
    if (authLoading) return;

    if (!user) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authFetch(`${API_BASE}/cart`);

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const items = await response.json();
      // Only attempt to restore cart for non-buy-now purchases (Buy Now items were never in cart)
      const hasBuyNowIntent = typeof window !== 'undefined' && localStorage.getItem('buyNowIntent');
      if ((!items || items.length === 0) && !hasBuyNowIntent && typeof window !== 'undefined') {
        try {
          const pending = localStorage.getItem('pendingPurchase');
          if (pending) {
            const pid = Number(pending);
            if (!Number.isNaN(pid)) {
              const restoreResp = await authFetch(`${API_BASE}/payments/restore/${pid}`, {
                method: 'POST',
              });
              if (restoreResp && restoreResp.ok) {
                localStorage.removeItem('pendingPurchase');
                // re-fetch cart items from server
                const reResp = await authFetch(`${API_BASE}/cart`);
                if (reResp.ok) {
                  const reItems = await reResp.json();
                  const mappedRe = await Promise.all((reItems || []).map(mapCartItem));
                  setCart(mappedRe.filter(Boolean));
                  setLoading(false);
                  return;
                }
              }
            }
          }
        } catch (restoreErr) {
          console.error('Error attempting to restore pending purchase cart:', restoreErr);
        }
      }
      const mapped = await Promise.all((items || []).map(mapCartItem));
      setCart(mapped.filter(Boolean));
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('We could not load your cart. Please try again.');
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, authFetch, authLoading, mapCartItem, user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (game, quantity = 1) => {
    if (!user) {
      toast.warning('Sign in to add items to your cart.');
      return false;
    }

    if (!game.inStock) {
      toast.error('This game is currently out of stock.');
      return false;
    }

    try {
      const response = await authFetch(`${API_BASE}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: game.id, quantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      await loadCart();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (gameId) => {
    if (!user) {
      toast.warning('Sign in to manage your cart.');
      return false;
    }

    try {
      const response = await authFetch(`${API_BASE}/cart/${gameId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }

      setCart((prev) => prev.filter((item) => item.id !== gameId));
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Could not remove that item from your cart.');
      return false;
    }
  };

  const updateQuantity = async (gameId, newQuantity) => {
    if (!user) {
      toast.warning('Sign in to manage your cart.');
      return false;
    }

    if (newQuantity < 1) {
      return await removeFromCart(gameId);
    }

    try {
      const response = await authFetch(`${API_BASE}/cart/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      toast.error('Could not update the item quantity.');
      return false;
    }
  };

  const clearCart = async () => {
    if (!user) {
      toast.warning('Sign in to manage your cart.');
      return false;
    }

    try {
      const response = await authFetch(`${API_BASE}/cart`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      setCart([]);
      toast.info('Cart cleared.');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Could not clear your cart. Please try again.');
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
    if (!user) {
      toast.warning('Sign in to continue to checkout.');
      return { success: false, error: 'User not logged in' };
    }

    if (isEmpty()) {
      toast.warning('Your cart is empty.');
      return { success: false, error: 'Cart is empty' };
    }

    const resolvedAddressId =
      typeof address === 'string'
        ? address
        : address?.addressId || address?.id;

    if (!resolvedAddressId) {
      toast.error('Please choose a shipping address.');
      return { success: false, error: 'No address selected' };
    }

    try {
      // Ensure server-side cart is populated. Some flows may keep cart only client-side.
      const serverCartResp = await authFetch(`${API_BASE}/cart`);
      if (serverCartResp.ok) {
        const serverItems = await serverCartResp.json().catch(() => []);
        if ((!serverItems || serverItems.length === 0) && cart.length > 0) {
          // Sync local cart items to server
          let syncError = null;
          for (const item of cart) {
            try {
              await authFetch(`${API_BASE}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: item.id, quantity: item.quantity }),
              });
            } catch (err) {
              syncError = err;
              console.debug('Failed to sync local cart item to server', item, err);
            }
          }
          if (syncError) {
            throw new Error('Some cart items could not be synced to the server. Please try again.');
          }
        }
      }

      const response = await authFetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Force Razorpay as the only supported payment method
        body: JSON.stringify({
          addressId: resolvedAddressId,
          paymentMethod: 'Razorpay',
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        let errorMessage = 'Failed to process checkout';
        try {
          const parsed = JSON.parse(text || '{}');
          errorMessage = parsed?.message || parsed?.error || errorMessage;
        } catch { /* not JSON */ }
        throw new Error(errorMessage + (text ? ` -- ${text}` : ''));
      }

      const orderDto = await response.json();
      // Defensive check: ensure the server returned a valid order id
      if (!orderDto || !(orderDto.orderId || orderDto.id)) {
        toast.error('Payment went through, but the order could not be saved. Please contact support.');
        return { success: false, error: 'Order not persisted' };
      }
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
        purchaseId: orderDto.purchaseId ?? orderDto.PurchaseId,
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
      try {
        const pid = order.purchaseId;
        if (pid) localStorage.setItem('pendingPurchase', String(pid));
      } catch (error) {
        console.error('Failed to store pending purchase:', error);
      }

      toast.success('Order created. Complete payment to confirm it.');
      return { success: true, order };
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(error.message || 'Could not process checkout.');
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
