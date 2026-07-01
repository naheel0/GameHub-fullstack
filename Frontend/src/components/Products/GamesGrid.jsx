import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { FaHeart } from 'react-icons/fa';
import { getImageUrl, handleImageError } from '../../Services/api';

const GamesGrid = ({ games, onWishlist, onAddToCart, isInWishlist, renderStars }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-400">
          No games found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {games.map((game) => (
        <div
          key={game.id}
          className="bg-gray-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 border border-gray-800 hover:border-gray-700"
        >
          <Link to={`/product/${game.id}`}>
            <div className="relative">
              <img
                src={getImageUrl(game.images, 0)}
                alt={game.name}
                className="w-full h-48 object-cover cursor-pointer"
                loading="lazy"
                decoding="async"
                onError={handleImageError}
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onWishlist(game);
                }}
                className="absolute top-2 right-2 p-2 bg-gray-800 rounded-full shadow-md hover:bg-gray-700 transition duration-300 border border-gray-700"
                title={isInWishlist(game.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-label={isInWishlist(game.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <FaHeart className={`h-5 w-5 ${isInWishlist(game.id) ? 'text-red-500' : 'text-gray-400'}`} />
              </button>
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

            <div className="flex items-center mb-3">
              <div className="flex">{renderStars(game.rating)}</div>
              <span className="ml-2 text-sm text-gray-300">{game.rating}</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-white">
                  ₹{game.price}
                </span>
              </div>
              <button
                onClick={() => onAddToCart(game)}
                disabled={!game.inStock}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition duration-300 ${
                  game.inStock
                    ? 'bg-red-600 hover:bg-red-700 hover:transform hover:scale-105 text-white border border-red-600'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600'
                }`}
              >
                <ShoppingCartIcon className="h-4 w-4" />
                <span>{game.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GamesGrid;
