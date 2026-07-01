import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { getImageUrl, handleImageError } from '../../Services/api';

const WishlistTab = ({ wishlist, formatRupees }) => {
  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <HeartIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Wishlist Empty</h3>
        <p className="text-gray-400 mb-6">Add games you love to your wishlist!</p>
        <Link
          to="/products"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-300 inline-block"
        >
          Browse Games
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {wishlist.map((game) => (
        <div
          key={game.id}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-red-500 transition duration-300"
        >
          <div className="flex items-center space-x-4">
            <img
              src={getImageUrl(game.images, 0)}
              alt={game.name}
              className="w-16 h-16 object-cover rounded"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {game.name}
              </h3>
              <p className="text-gray-400 text-sm mb-2">{game.genre || game.category || 'Game'}</p>
              <p className="text-red-500 font-bold">
                {formatRupees(game.price)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WishlistTab;
