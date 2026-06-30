import React from 'react';
import { StarIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

const ProductInfo = ({
  game,
  quantity,
  setQuantity,
  isInWishlistState,
  wishlistLoading,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  buyNowLoading,
  user,
  renderStars,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{game.name}</h1>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1">
            {renderStars(game.rating)}
            <span className="ml-2 text-lg font-semibold text-gray-300">
              {game.rating}/5.0
            </span>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              game.inStock
                ? 'bg-green-900 text-green-300'
                : 'bg-red-900 text-red-300'
            }`}
          >
            {game.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-4xl font-bold text-white">₹{game.price}</span>
          {game.originalPrice && game.originalPrice > game.price && (
          <span className="text-xl text-gray-400 line-through">
            ₹{game.originalPrice}
          </span>
        )}
        {quantity > 1 && (
          <span className="text-lg text-green-400">
            Total: ₹{(game.price * quantity).toFixed(2)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-semibold text-gray-300">Genre:</span>
          <p className="text-gray-400">{game.genre}</p>
        </div>
        <div>
          <span className="font-semibold text-gray-300">Platform:</span>
          <p className="text-gray-400">{game.platform}</p>
        </div>
        <div className="col-span-2">
          <span className="font-semibold text-gray-300">Description:</span>
          <p className="text-gray-400 mt-1">{game.description}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="font-semibold text-gray-300">Quantity:</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 border border-gray-600 text-white"
          >
            -
          </button>
          <span className="w-12 text-center font-semibold text-white">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 border border-gray-600 text-white"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onAddToCart}
          disabled={!game.inStock}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg transition duration-300 border ${
            game.inStock
              ? 'bg-red-600 hover:bg-red-700 hover:transform hover:scale-105 transition duration-300 text-white border-red-600'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600'
          }`}
        >
          <ShoppingCartIcon className="h-5 w-5" />
          <span>Add to Cart</span>
        </button>

        <button
          onClick={onBuyNow}
          disabled={!game.inStock || buyNowLoading}
          className={`flex-1 py-3 px-6 rounded-lg transition duration-300 border ${
            game.inStock
              ? 'bg-green-600 hover:bg-green-700 hover:transform hover:scale-105 transition duration-300 text-white border-green-600'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed border-gray-600'
          }`}
        >
          {buyNowLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Buy Now'
          )}
        </button>

        <button
          onClick={onToggleWishlist}
          disabled={wishlistLoading}
          className={`p-3 rounded-lg border transition duration-300 ${
            isInWishlistState
              ? 'bg-red-900 border-red-700 text-red-400'
              : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
          } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={
            isInWishlistState
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
        >
          {wishlistLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : isInWishlistState ? (
            <HeartIcon className="h-5 w-5" />
          ) : (
            <HeartOutline className="h-5 w-5" />
          )}
        </button>
      </div>

      {!user && (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
          <p className="text-sm text-gray-300 text-center">
            <span className="text-red-400">Login</span> to save games to your wishlist
          </p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="font-semibold text-white mb-2">Features</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✅ Instant digital delivery</li>
          <li>✅ Free updates and patches</li>
          <li>✅ 24/7 customer support</li>
          <li>✅ 30-day money-back guarantee</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductInfo;
