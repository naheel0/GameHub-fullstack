import React from 'react';
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';

const CartItem = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-lg p-6"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="shrink-0">
          <img
            src={item.images?.[0] || '/images/placeholder-game.jpg'}
            alt={item.name}
            className="w-24 h-32 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = '/images/placeholder-game.jpg';
            }}
          />
        </div>

        <div className="grow">
          <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
              {item.genre}
            </span>
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
              {item.platform}
            </span>
          </div>
          {!item.inStock && (
            <span className="text-red-400 text-sm font-medium">Out of Stock</span>
          )}
        </div>

        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-gray-400">Quantity:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 disabled:opacity-50 transition duration-300"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-white font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-gray-700 disabled:opacity-50 transition duration-300"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-white">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                ₹{item.price} each
              </div>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-gray-400 hover:text-red-400 transition duration-300"
              title="Remove item"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
