import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import Logo from "../common/Logo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const { getCartItemCount, getCartSummary } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleLogin = () => navigate("/login");
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };
  const handleCartClick = () => navigate("/cart");
  const handleWishlistClick = () => navigate("/wishlist");
  const handleProfileClick = () => {
    navigate("/profile");
    setIsMenuOpen(false);
  };

  const userRole = user?.role; // 'admin' or 'user'
  const handleAdminClick = () => navigate("/admin");
  return (
    <nav className="bg-black text-white shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-linear-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                <Logo />
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {["/", "/products", "/about", "/contact"].map((path, idx) => {
                const names = ["Home", "Products", "About", "Contact"];
                return (
                  <Link
                    key={idx}
                    to={path}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800 hover:text-red-400 transition duration-300"
                  >
                    {names[idx]}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side icons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Wishlist */}
            <button
              onClick={handleWishlistClick}
              className="p-2 rounded-md hover:bg-gray-800 transition duration-300 relative group"
            >
              <HeartIcon className="h-6 w-6" />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getWishlistCount()}
                </span>
              )}
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 text-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-700">
                <div className="p-3 text-sm">
                  <p className="font-semibold">
                    {getWishlistCount()} items in wishlist
                  </p>
                  <p className="text-gray-300">Click to view</p>
                </div>
              </div>
            </button>

            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="p-2 rounded-md hover:bg-gray-800 transition duration-300 relative group"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900 text-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-700">
                <div className="p-3 text-sm">
                  <p className="font-semibold">
                    {getCartItemCount()} items in cart
                  </p>
                  <p className="text-gray-300">
                    Total: ₹{getCartSummary().subtotal}
                  </p>
                </div>
              </div>
            </button>

            {/* User Account */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 hidden lg:block">
                  Welcome, {user.firstName}
                </span>
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 hover:transform hover:scale-105 transition duration-300 border border-red-600">
                    <UserIcon className="h-4 w-4" />
                    <span>Account</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-700">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                        <p className="font-semibold">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs">{user.email}</p>
                      </div>
                      {userRole === "admin" ? (
                        <button
                          onClick={handleAdminClick}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition duration-300"
                        >
                          Admin page
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleProfileClick}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition duration-300"
                          >
                            Profile
                          </button>
                          <button
                            onClick={handleWishlistClick}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition duration-300"
                          >
                            My Wishlist
                          </button>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition duration-300 border-t border-gray-700"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center space-x-1 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition duration-300 border border-red-600"
              >
                <UserIcon className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={handleWishlistClick}
              className="p-2 rounded-md hover:bg-gray-800 transition duration-300 relative"
            >
              <HeartIcon className="h-6 w-6" />
              {getWishlistCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getWishlistCount()}
                </span>
              )}
            </button>
            <button
              onClick={handleCartClick}
              className="p-2 rounded-md hover:bg-gray-800 transition duration-300 relative"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-800 transition duration-300"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {["/", "/products", "/about", "/contact"].map((path, idx) => {
              const names = ["Home", "Products", "About", "Contact"];
              return (
                <Link
                  key={idx}
                  to={path}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-red-400 transition duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {names[idx]}
                </Link>
              );
            })}

            <Link
              to="/wishlist"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-red-400 transition duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Wishlist ({getWishlistCount()})
            </Link>

            {/* User Section */}
            <div className="border-t border-gray-700 mt-2 pt-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-300">
                    <p className="font-semibold">Welcome, {user.firstName}</p>
                    <p className="text-xs">{user.email}</p>
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 hover:text-red-400 transition duration-300"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-800 transition duration-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800 transition duration-300 bg-red-600 "
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Login</span>
                </button>
              )}
            </div>

            {/* Cart & Wishlist summary */}
            <div className="px-3 py-2 text-sm text-gray-300 border-t border-gray-700">
              <p>Cart: {getCartItemCount()} items</p>
              <p>Wishlist: {getWishlistCount()} items</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
