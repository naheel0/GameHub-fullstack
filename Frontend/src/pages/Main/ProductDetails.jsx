import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon, HeartIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { GiFastBackwardButton } from 'react-icons/gi';
import { MdArrowForwardIos, MdArrowBackIosNew } from "react-icons/md";
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { BaseUrl, normalizeGame } from '../../Services/api';
import { ProductDetailsSkeleton } from '../../components/common/Skeleton';
import ProductImageGallery from '../../components/ProductDetails/ProductImageGallery';
import ProductInfo from '../../components/ProductDetails/ProductInfo';

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenImageIndex, setFullScreenImageIndex] = useState(0);
  const [isInWishlistState, setIsInWishlistState] = useState(false);

  const { addToCart } = useCart();
  const { user, authFetch } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const API_BASE = BaseUrl;

  useEffect(() => {
    if (!API_BASE) {
      setError('Make sure the GameHub API is running.');
      setApiUnavailable(true);
      setLoading(false);
      return;
    }

    const fetchGame = async () => {
      try {
        setLoading(true);
        const response = await authFetch(`${API_BASE}/games/${id}?_cb=${Date.now()}`);

        // Read body once as text, then parse JSON
        const rawText = await response.text().catch(() => '');
        let payload = null;
        try {
          payload = JSON.parse(rawText);
        } catch {
          payload = null;
        }

        // status 0 = corrupted browser cache (ERR_CACHE_READ_FAILURE) — body is still valid JSON
        // Only treat as failure if there is genuinely no usable payload
        if (!payload) {
          if (rawText.trimStart().startsWith('<')) {
            throw new Error('Make sure the GameHub API is running.');
          }
          throw new Error('Failed to fetch game data');
        }

        // A real API error returns ok=false with a non-zero status and no game data
        if (!response.ok && response.status !== 0) {
          throw new Error('Failed to fetch game data');
        }

        const normalized = normalizeGame(payload);
        if (normalized) {
          setGame(normalized);
        } else {
          throw new Error('Game not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game:', err);
        setError(err.message);
        setLoading(false);
      }
    };

fetchGame();
   }, [id, API_BASE, authFetch]);

  useEffect(() => {
    if (game && user) {
      setIsInWishlistState(isInWishlist(game.id));
    } else {
      setIsInWishlistState(false);
    }
  }, [game, user, isInWishlist]);

  const toggleWishlist = async () => {
    if (!game) return;

    if (!user) {
      navigate('/login', { state: { from: `/product/${game.id}` } });
      return;
    }

    setWishlistLoading(true);
    const previousState = isInWishlistState;

    try {
      if (isInWishlistState) {
        await removeFromWishlist(game.id);
        setIsInWishlistState(false);
      } else {
        await addToWishlist(game);
        setIsInWishlistState(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setIsInWishlistState(previousState);
      alert('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const nextImage = useCallback(() => {
    if (game?.images) {
      setFullScreenImageIndex((prev) =>
        prev < game.images.length - 1 ? prev + 1 : 0
      );
    }
  }, [game?.images]);

  const prevImage = useCallback(() => {
    if (game?.images) {
      setFullScreenImageIndex((prev) =>
        prev > 0 ? prev - 1 : game.images.length - 1
      );
    }
  }, [game?.images]);

  const handleAddToCart = async () => {
    if (!game) return;
    if (!game.inStock) {
      toast.error('Sorry, this game is out of stock!');
      return;
    }

    try {
      const ok = await addToCart(game, quantity);
      if (ok) {
        toast.success(`${quantity} ${game.name} added to cart!`);
      } else {
        toast.error('Could not add to cart. Please try again.');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Could not add to cart. Please try again.');
    }
  };

  const buyNow = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!game.inStock) {
      toast.error('Sorry, this game is out of stock!');
      return;
    }

    setBuyNowLoading(true);
    try {
      localStorage.setItem(
        'buyNowIntent',
        JSON.stringify({
          gameId: game.id,
          quantity: quantity,
          game: {
            id: game.id,
            name: game.name,
            price: game.price,
            image: game.images?.[0],
          },
        })
      );
      navigate('/payment', { state: { fromProduct: true, singleItem: true } });
    } catch (error) {
      console.error('Error preparing buy now:', error);
      toast.error('Could not proceed to checkout. Please try again.');
    } finally {
      setBuyNowLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) =>
      index < Math.floor(rating) ? (
        <StarIcon key={index} className="h-5 w-5 text-yellow-400" />
      ) : (
        <StarOutline key={index} className="h-5 w-5 text-yellow-400" />
      )
    );
  };

  if (loading) {
    return <ProductDetailsSkeleton />;
  }

  if (apiUnavailable) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-xl rounded-2xl border border-red-900 bg-red-950/40 p-8 text-center shadow-2xl shadow-red-950/20">
          <p className="text-sm uppercase tracking-[0.35em] text-red-300">
            Backend unavailable
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Make sure the GameHub API is running
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-300">
            The product page could not load game data because the API response
            was not JSON.
          </p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">Game not found</p>
          <Link
            to="/products"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 border border-red-600"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-300 hover:text-white mb-6"
        >
          <GiFastBackwardButton className="h-10 w-10" />
          <span>Back</span>
        </button>

        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <ProductImageGallery
              game={game}
              selectedImageIndex={selectedImageIndex}
              setSelectedImageIndex={setSelectedImageIndex}
              showVideo={showVideo}
              setShowVideo={setShowVideo}
              isFullScreen={isFullScreen}
              openFullScreen={() => setIsFullScreen(true)}
              closeFullScreen={() => setIsFullScreen(false)}
              nextImage={nextImage}
              prevImage={prevImage}
              fullScreenImageIndex={fullScreenImageIndex}
              setFullScreenImageIndex={setFullScreenImageIndex}
            />

            <ProductInfo
              game={game}
              quantity={quantity}
              setQuantity={setQuantity}
              isInWishlistState={isInWishlistState}
              wishlistLoading={wishlistLoading}
              onToggleWishlist={toggleWishlist}
              onAddToCart={handleAddToCart}
              onBuyNow={buyNow}
              buyNowLoading={buyNowLoading}
              user={user}
              renderStars={renderStars}
            />
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {game.genre && (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  More {game.genre} games coming soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
