import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { BaseUrl, normalizeGame } from '../Services/api';

const WishlistContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, authFetch } = useAuth();

  const API_BASE = BaseUrl;

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

  const mapWishlistItem = useCallback(async (item) => {
    const game = await fetchGame(item.gameId);

    return {
      id: item.gameId,
      name: game?.name || item.gameName || 'Unknown Game',
      price: typeof item.price === 'number' ? item.price : game?.price || 0,
      images: (game?.images && game.images.length > 0)
        ? game.images
        : item.image
          ? [item.image]
          : [],
      genre: game?.genre || '',
      platform: game?.platform || '',
      rating: game?.rating || 0,
      inStock: typeof game?.inStock === 'boolean' ? game.inStock : true,
      trailer: game?.trailer || '',
      description: game?.description || '',
    };
  }, [fetchGame]);

  const loadWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authFetch(`${API_BASE}/wishlist`);

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const items = await response.json();
      const mapped = await Promise.all((items || []).map(mapWishlistItem));
      setWishlist(mapped.filter(Boolean));
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('We could not load your wishlist. Please try again.');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, mapWishlistItem, user, authFetch]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const addToWishlist = async (game) => {
    if (!user) {
      toast.warning('Sign in to manage your wishlist.', { toastId: 'wishlist-auth-required' });
      return;
    }

    try {
      if (wishlist.some((item) => item.id === game.id)) {
        toast.info(`${game.name} is already in your wishlist!`);
        return;
      }

      const response = await authFetch(`${API_BASE}/wishlist/${game.id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }

      await loadWishlist();
      toast.success(`${game.name} added to wishlist!`);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Could not add that game to your wishlist.');
    }
  };

  const removeFromWishlist = async (gameId) => {
    if (!user) {
      toast.warning('Sign in to manage your wishlist.', { toastId: 'wishlist-auth-required' });
      return;
    }

    try {
      const response = await authFetch(`${API_BASE}/wishlist/${gameId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      setWishlist((prev) => prev.filter((item) => item.id !== gameId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Could not remove that item from your wishlist.');
    }
  };

  const isInWishlist = (gameId) => {
    return wishlist.some((item) => item.id === gameId);
  };

  const clearWishlist = async () => {
    if (!user) {
      toast.warning('Sign in to manage your wishlist.', { toastId: 'wishlist-auth-required' });
      return;
    }

    try {
      await Promise.all(wishlist.map((item) =>
        authFetch(`${API_BASE}/wishlist/${item.id}`, {
          method: 'DELETE',
        })
      ));

      setWishlist([]);
      toast.info('Wishlist cleared.');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Could not clear your wishlist. Please try again.');
    }
  };

  const moveToCart = async (item, onCartUpdated) => {
    if (!user) {
      toast.warning('Sign in to manage your wishlist.', { toastId: 'wishlist-auth-required' });
      return;
    }

    try {
      const response = await authFetch(`${API_BASE}/wishlist/${item.id}/move-to-cart`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to move item to cart');
      }

      await loadWishlist();
      if (typeof onCartUpdated === 'function') {
        await onCartUpdated();
      }

      toast.success(`${item.name} moved to cart!`);
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Could not move that item to your cart.');
    }
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  const getWishlistTotal = () => {
    return wishlist.reduce((total, item) => total + (item.price || 0), 0);
  };

  const isWishlistEmpty = () => {
    return wishlist.length === 0;
  };

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    moveToCart,
    getWishlistCount,
    getWishlistTotal,
    isWishlistEmpty,
    refreshWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
