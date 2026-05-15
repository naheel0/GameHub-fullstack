import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { BaseUrl, buildAuthHeaders, normalizeGame } from '../Services/api';

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
  const { user } = useAuth();

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
    if (!user || !token) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/wishlist`, {
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const items = await response.json();
      const mapped = await Promise.all((items || []).map(mapWishlistItem));
      setWishlist(mapped.filter(Boolean));
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, mapWishlistItem, token, user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const addToWishlist = async (game) => {
    if (!user || !token) {
      toast.warning('Please log in to manage your wishlist.');
      return;
    }

    try {
      if (wishlist.some((item) => item.id === game.id)) {
        toast.info(`${game.name} is already in your wishlist!`);
        return;
      }

      const response = await fetch(`${API_BASE}/wishlist/${game.id}`, {
        method: 'POST',
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to add to wishlist');
      }

      await loadWishlist();
      toast.success(`${game.name} added to wishlist!`);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (gameId) => {
    if (!user || !token) {
      toast.warning('Please log in to manage your wishlist.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/wishlist/${gameId}`, {
        method: 'DELETE',
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      setWishlist((prev) => prev.filter((item) => item.id !== gameId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const isInWishlist = (gameId) => {
    return wishlist.some((item) => item.id === gameId);
  };

  const clearWishlist = async () => {
    if (!user || !token) {
      toast.warning('Please log in to manage your wishlist.');
      return;
    }

    try {
      await Promise.all(wishlist.map((item) =>
        fetch(`${API_BASE}/wishlist/${item.id}`, {
          method: 'DELETE',
          headers: {
            ...buildAuthHeaders(token),
          },
          credentials: 'include',
        })
      ));

      setWishlist([]);
      toast.info('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    }
  };

  const moveToCart = async (item, onCartUpdated) => {
    if (!user || !token) {
      toast.warning('Please log in to manage your wishlist.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/wishlist/${item.id}/move-to-cart`, {
        method: 'POST',
        headers: {
          ...buildAuthHeaders(token),
        },
        credentials: 'include',
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
      toast.error('Failed to move item to cart');
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
