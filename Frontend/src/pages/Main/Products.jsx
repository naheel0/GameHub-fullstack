import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import {
  StarIcon as StarOutline,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useAuth } from "../../contexts/AuthContext";
import { BaseUrl, normalizeGame } from "../../Services/api";
import { GameCardSkeleton } from "../../components/common/Skeleton";

const Products = () => {
  const [games, setGames] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { addToCart } = useCart();

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
        const response = await fetch(`${API_BASE}/games?pageSize=100`);
        if (!response.ok) {
          throw new Error("Failed to fetch games data");
        }
        const payload = await response.json();
        const items = payload?.data?.items || payload?.items || payload || [];
        const normalized = items.map(normalizeGame).filter(Boolean);
        setGames(normalized);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching games:", err);
      }
    };

    fetchGames();
  }, [API_BASE]);

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

    if (selectedGenre !== "All") {
      result = result.filter((game) => game.genre === selectedGenre);
    }

    if (selectedPlatform !== "All") {
      result = result.filter((game) =>
        game.platform.includes(selectedPlatform)
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
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

  const genres = useMemo(() => ["All", ...new Set(games.map((game) => game.genre))], [games]);
  
  const platforms = useMemo(() => [
    "All",
    ...new Set(games.flatMap((game) => game.platform.split(", "))),
  ], [games]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, selectedPlatform, sortBy]);

  const handleWishlist = useCallback((game) => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (isInWishlist(game.id)) {
      removeFromWishlist(game.id);
    } else {
      addToWishlist(game);
    }
  }, [user, navigate, location.pathname, isInWishlist, addToWishlist, removeFromWishlist]);

  const handleAddToCart = useCallback((game) => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!game.inStock) {
      toast.error("This game is out of stock!");
      return;
    }

    addToCart(game);
  }, [user, navigate, location.pathname, addToCart]);

  const renderStars = useCallback((rating) => {
    return Array.from({ length: 5 }, (_, index) =>
      index < Math.floor(rating) ? (
        <StarIcon key={index} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarOutline key={index} className="h-4 w-4 text-yellow-400" />
      )
    );
  }, []);

  const getPageNumbers = useCallback(() => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  }, [totalPages, currentPage]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedGenre("All");
    setSelectedPlatform("All");
    setSortBy("name");
  }, []);

  const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="h-10 bg-gray-800 animate-pulse rounded-lg w-64 mx-auto mb-4" />
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Our Games Collection
          </h1>
          <p className="text-lg text-gray-300">
            Discover the latest and greatest games
          </p>
          <div className="mt-2 text-sm text-gray-400">
            {filteredGames.length} games found • {getWishlistCount()} in
            wishlist
            {user && <span> • Welcome, {user.firstName || user.email}!</span>}
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900 rounded-lg shadow-md p-6 mb-8 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400"
              />
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              >
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 border border-gray-600"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentGames.map((game) => (
            <div
              key={game.id}
              className="bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 border border-gray-800 hover:border-gray-700"
            >
              {/* Game Image with Link */}
              <Link to={`/product/${game.id}`}>
                <div className="relative">
                  <img
                    src={game.images?.[0] || "/placeholder-game.jpg"}
                    alt={game.name}
                    className="w-full h-48 object-cover cursor-pointer"
                  />
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleWishlist(game);
                    }}
                    className="absolute top-2 right-2 p-2 bg-gray-800 rounded-full shadow-md hover:bg-gray-700 transition duration-300 border border-gray-700"
                    title={
                      isInWishlist(game.id)
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    {isInWishlist(game.id) ? (
                      <HeartIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartOutline className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {/* Out of Stock Badge */}
                  {!game.inStock && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      Out of Stock
                    </div>
                  )}
                </div>
              </Link>

              
              <div className="p-4">
               
                <Link to={`/product/${game.id}`}>
                  <h3 className="text-lg font-semibold text-white mb-2 hover:text-red-500 cursor-pointer transition duration-300">
                    {game.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400 mb-2">{game.genre}</p>
                <p className="text-xs text-gray-500 mb-3">{game.platform}</p>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  <div className="flex">{renderStars(game.rating)}</div>
                  <span className="ml-2 text-sm text-gray-300">
                    {game.rating}
                  </span>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-white">
                      ₹{game.price}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(game)}
                    disabled={!game.inStock}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition duration-300 ${
                      game.inStock
                        ? "bg-red-600 hover:bg-red-700 hover:transform hover:scale-105 transition duration-300 text-white border border-red-600"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
                    }`}
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>{game.inStock ? "Add to Cart" : "Out of Stock"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">
              No games found matching your criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 border border-red-600"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredGames.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            {/* Previous Button */}
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${
                currentPage === 1
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((number, index) => (
              <button
                key={index}
                onClick={() => typeof number === "number" && paginate(number)}
                className={`px-4 py-2 rounded-lg border ${
                  number === currentPage
                    ? "bg-red-600 text-white border-red-600"
                    : number === "..."
                    ? "bg-gray-800 text-gray-500 cursor-default border-gray-700"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
                }`}
                disabled={number === "..."}
              >
                {number}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${
                currentPage === totalPages
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600"
              }`}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
