import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { BaseUrl, normalizeGame } from '../../Services/api';
import { GameCardSkeleton } from '../../components/common/Skeleton';
import FiltersBar from '../../components/Products/FiltersBar';
import GamesGrid from '../../components/Products/GamesGrid';
import Pagination from '../../components/Products/Pagination';

const Products = () => {
  const [games, setGames] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const locationRef = useRef(location.pathname);
  locationRef.current = location.pathname;

  const { addToCart } = useCart();
  const { authFetch } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount } =
    useWishlist();
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage] = useState(6);

  const API_BASE = BaseUrl;

       useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE}/games?pageSize=100`;
        const response = await authFetch(url, { cache: 'no-store' });

        // Read body once as text, then parse JSON
        const rawText = await response.text().catch(() => '');
        let payload = null;
        try {
          payload = JSON.parse(rawText);
        } catch {
          payload = null;
        }

        // status 0 means the browser served a corrupted cache entry (ERR_CACHE_READ_FAILURE).
        // The body is still valid JSON in that case — treat it as success when payload.success is true
        // or when we can extract items from it. A genuine server error returns non-zero status.
        const isSuccessPayload = payload &&
          (payload.success === true || payload?.data?.items || Array.isArray(payload?.items) || Array.isArray(payload));

        if (!isSuccessPayload) {
          if (rawText.trimStart().startsWith('<')) {
            throw new Error('Make sure the GameHub API is running.');
          }
          if (response.status !== 0) {
            console.error('Games fetch failed:', response.status, rawText.slice(0, 200));
            throw new Error(`Failed to fetch games data (status ${response.status})`);
          }
          // status 0 + no usable payload = network failure
          throw new Error('Network error — please check your connection and try again.');
        }

        const items = payload?.data?.items || payload?.items || (Array.isArray(payload) ? payload : []);
        const normalized = items.map(normalizeGame).filter(Boolean);
        setGames(normalized);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError(err.message || 'Could not load games. Please try again.');
        setLoading(false);
      }
    };

fetchGames();
   }, [API_BASE, authFetch]);

  const filteredGames = useMemo(() => {
    let result = [...games];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (game) =>
          game.name.toLowerCase().includes(lowerTerm) ||
          game.genre.toLowerCase().includes(lowerTerm) ||
          game.description?.toLowerCase().includes(lowerTerm)
      );
    }

    if (selectedGenre !== 'All') {
      result = result.filter((game) => game.genre === selectedGenre);
    }

    if (selectedPlatform !== 'All') {
      result = result.filter((game) => game.platform.includes(selectedPlatform));
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [games, searchTerm, selectedGenre, selectedPlatform, sortBy]);

  const currentGames = useMemo(() => {
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    return filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  }, [currentPage, filteredGames, gamesPerPage]);

  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  const genres = useMemo(
    () => ['All', ...new Set(games.map((game) => game.genre))],
    [games]
  );

  const platforms = useMemo(
    () => [
      'All',
      ...new Set(games.flatMap((game) => game.platform.split(', '))),
    ],
    [games]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, selectedPlatform, sortBy]);

  const handleWishlist = useCallback(
    (game) => {
      if (!user) {
        navigate('/login', { state: { from: locationRef.current } });
        return;
      }

      if (isInWishlist(game.id)) {
        removeFromWishlist(game.id);
      } else {
        addToWishlist(game);
      }
    },
    [user, navigate, isInWishlist, addToWishlist, removeFromWishlist]
  );

  const handleAddToCart = useCallback(
    async (game) => {
      if (!user) {
        navigate('/login', { state: { from: locationRef.current } });
        return;
      }

      if (!game.inStock) {
        toast.error('This game is out of stock!');
        return;
      }

      try {
        const ok = await addToCart(game);
        if (ok) {
          toast.success(`${game.name} added to cart!`);
        } else {
          toast.error('Could not add to cart. Please try again.');
        }
      } catch (err) {
        console.error('Error adding to cart:', err);
        toast.error('Could not add to cart. Please try again.');
      }
    },
    [user, navigate, addToCart]
  );

  const renderStars = useCallback((rating) => {
    return Array.from({ length: 5 }, (_, index) =>
      index < Math.floor(rating) ? (
        <StarIcon key={index} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarOutline key={index} className="h-4 w-4 text-yellow-400" />
      )
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSelectedPlatform('All');
    setSortBy('name');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-800 animate-pulse rounded w-64 mx-auto mb-4" />
            <div className="h-5 bg-gray-800 animate-pulse rounded w-96 mx-auto" />
          </div>
          <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-8 border border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-800 animate-pulse rounded mb-2 w-20" />
                  <div className="h-10 bg-gray-800 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-xl font-semibold">Error: {error}</p>
          <p className="mt-2 text-sm text-gray-400">
            Make sure the GameHub API is running
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Our Games Collection
          </h1>
          <p className="text-lg text-gray-300">
            Discover the latest and greatest games
          </p>
          <div className="mt-2 text-sm text-gray-400">
            {filteredGames.length} games found • {getWishlistCount()} in wishlist
            {user && <span> • Welcome, {user.firstName || user.email}!</span>}
          </div>
        </div>

        <FiltersBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          sortBy={sortBy}
          setSortBy={setSortBy}
          genres={genres}
          platforms={platforms}
          onClearFilters={clearFilters}
        />

        <GamesGrid
          games={currentGames}
          onWishlist={handleWishlist}
          onAddToCart={handleAddToCart}
          user={user}
          isInWishlist={isInWishlist}
          renderStars={renderStars}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Products;
