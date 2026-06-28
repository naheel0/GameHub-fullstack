import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaStar } from 'react-icons/fa';

const FeaturedGamesSection = ({ featuredGames, renderStars, onWishlistToggle, isInWishlist }) => {
  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Featured Games</h2>
          <p className="text-xl text-gray-300">
            Discover our most popular titles
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredGames.map((game) => (
            <div
              key={game.id}
              className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition duration-300 border border-gray-800"
            >
              <Link to={`/product/${game.id}`}>
                <div className="relative">
                  <img
                    src={game.images?.[0] || '/images/placeholder-game.jpg'}
                    alt={game.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-game.jpg';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                    ₹{game.price}
                  </div>
                </div>
              </Link>
              <div className="p-6">
                <Link to={`/product/${game.id}`}>
                  <h3 className="text-xl font-semibold text-white mb-2 hover:text-red-500 transition duration-300">
                    {game.name}
                  </h3>
                </Link>
                <p className="text-gray-400 text-sm mb-3">{game.genre}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(game.rating)}
                    <span className="text-gray-300 ml-1">{game.rating}</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {game.platform}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/product/${game.id}`}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-center py-2 px-4 rounded transition duration-300"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => onWishlistToggle(game)}
                    className={`p-2 rounded transition duration-300 border ${
                      isInWishlist(game.id)
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                    }`}
                  >
                    <FaHeart className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="bg-transparent border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
          >
            View All Games
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGamesSection;
