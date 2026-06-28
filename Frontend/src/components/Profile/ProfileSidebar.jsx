import React from 'react';
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const ProfileSidebar = ({ activeTab, onTabChange, cartSummary, wishlistCount, orderCount }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-8">
      <nav className="space-y-2">
        {[
          { id: 'overview', name: 'Overview', icon: UserIcon },
          { id: 'orders', name: 'Order History', icon: ShoppingBagIcon },
          { id: 'wishlist', name: 'Wishlist', icon: HeartIcon },
          { id: 'addresses', name: 'Addresses', icon: MapPinIcon },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-300 ${
              activeTab === item.id
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Cart Items</span>
            <span className="text-white font-semibold">
              {cartSummary.totalItems || 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Wishlist</span>
            <span className="text-white font-semibold">{wishlistCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Orders</span>
            <span className="text-white font-semibold">{orderCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;
