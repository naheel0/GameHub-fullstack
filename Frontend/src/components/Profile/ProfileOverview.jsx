import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserIcon as UserSolid,
  ShoppingBagIcon as ShoppingBagSolid,
  HeartIcon as HeartSolid,
  CalendarIcon,
} from '@heroicons/react/24/solid';

const ProfileOverview = ({
  user,
  isEditing,
  formData,
  onInputChange,
  onSave,
  onCancel,
  loading,
  formatRupees,
  cartSummary,
  wishlistCount,
  onViewWishlist,
  onViewOrders,
  orderCount,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Profile Information</h2>
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={onInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={onInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={onSave}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-300 flex items-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition duration-300 flex items-center space-x-2"
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <p className="text-white text-lg">{user.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <p className="text-white text-lg">{user.lastName}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                Email
              </label>
              <p className="text-white text-lg">{user.email}</p>
            </div>

            {user.phone && (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                  Phone Number
                </label>
                <p className="text-white text-lg">{user.phone}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center hover:border-red-500 transition duration-300">
          <ShoppingBagSolid className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Shopping Cart</h3>
          <p className="text-gray-400 mb-4">
            {cartSummary.totalItems || 0} items • {formatRupees(cartSummary.subtotal)}
          </p>
          <Link
            to="/cart"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300 inline-block"
          >
            View Cart
          </Link>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center hover:border-red-500 transition duration-300">
          <HeartSolid className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Wishlist</h3>
          <p className="text-gray-400 mb-4">
            {wishlistCount} games saved for later
          </p>
          <button
            onClick={onViewWishlist}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            View Wishlist
          </button>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center hover:border-red-500 transition duration-300">
          <CalendarIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Order History</h3>
          <p className="text-gray-400 mb-4">
            {orderCount} total orders
          </p>
          <button
            onClick={onViewOrders}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-300"
          >
            View Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
