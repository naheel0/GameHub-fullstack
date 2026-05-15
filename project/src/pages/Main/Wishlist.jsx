import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { HeartIcon, ShoppingCartIcon, TrashIcon } from '@heroicons/react/24/solid';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist, getWishlistTotal, moveToCart, isWishlistEmpty } = useWishlist();
  const { refreshCart } = useCart();

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      index < Math.floor(rating) ? (
        <StarIcon key={index} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarOutline key={index} className="h-4 w-4 text-yellow-400" />
      )
    ));
  };

  if (isWishlistEmpty()) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HeartIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Your Wishlist is Empty</h1>
            <p className="text-gray-400 mb-8">Start adding games you love to your wishlist!</p>
            <Link
              to="/products"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-300"
            >
              Browse Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
            <p className="text-gray-400 mt-2">
              {wishlist.length} {wishlist.length === 1 ? 'game' : 'games'} • Total: ₹{getWishlistTotal().toFixed(2)}
            </p>
          </div>
          <button
            onClick={clearWishlist}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {wishlist.map(game => (
            <div key={game.id} className="bg-gray-900 rounded-lg shadow-md overflow-hidden border border-gray-800">
              <Link to={`/product/${game.id}`}>
                <img
                  src={game.images?.[0] || '/placeholder-game.jpg'}
                  alt={game.name}
                  className="w-full h-48 object-cover cursor-pointer"
                />
              </Link>

              <div className="p-4">
                <Link to={`/product/${game.id}`}>
                  <h3 className="text-lg font-semibold text-white mb-2 hover:text-red-500 cursor-pointer">
                    {game.name}
                  </h3>
                </Link>
                
                <p className="text-sm text-gray-400 mb-2">{game.genre}</p>
                <p className="text-xs text-gray-500 mb-3">{game.platform}</p>
                
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {renderStars(game.rating)}
                  </div>
                  <span className="ml-2 text-sm text-gray-300">{game.rating}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-white">₹{game.price}</span>
                  <span className={`text-sm ${game.inStock ? 'text-green-500' : 'text-red-500'}`}>
                    {game.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => removeFromWishlist(game.id)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition duration-300 flex items-center justify-center"
                  >
                    <HeartIcon className="h-4 w-4 mr-2 text-red-500" />
                    Remove
                  </button>
                  
                  <button
                    onClick={() => moveToCart(game, refreshCart)}
                    disabled={!game.inStock}
                    className={`flex-1 py-2 rounded-lg transition duration-300 flex items-center justify-center ${
                      game.inStock
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCartIcon className="h-4 w-4 mr-2" />
                    {game.inStock ? 'Move to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;