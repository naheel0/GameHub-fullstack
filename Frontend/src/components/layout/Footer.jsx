import React from 'react';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaDiscord, 
  FaSteam,
  FaShieldAlt,
  FaCreditCard,
  FaHeadset,
  FaShippingFast
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white mt-16 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold bg-linear-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                GameHub
              </span>
            </div>
            <p className="text-gray-400 mb-4 text-sm">
              Your ultimate destination for gaming products. Discover the latest games, consoles, and accessories at unbeatable prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-red-500 transition duration-300">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition duration-300">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition duration-300">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition duration-300">
                <FaDiscord size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-500 transition duration-300">
                <FaSteam size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  All Products
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  PC Games
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Console Games
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Gaming Accessories
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Pre-orders
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Digital Codes
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-red-400 transition duration-300 text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <FaShippingFast className="text-red-500 text-xl" />
            <div>
              <h4 className="font-semibold text-sm text-white">Free Shipping</h4>
              <p className="text-gray-400 text-xs">On orders over $50</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaCreditCard className="text-red-500 text-xl" />
            <div>
              <h4 className="font-semibold text-sm text-white">Secure Payment</h4>
              <p className="text-gray-400 text-xs">100% secure & safe</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaHeadset className="text-red-500 text-xl" />
            <div>
              <h4 className="font-semibold text-sm text-white">24/7 Support</h4>
              <p className="text-gray-400 text-xs">Dedicated support</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <FaShieldAlt className="text-red-500 text-xl" />
            <div>
              <h4 className="font-semibold text-sm text-white">Guarantee</h4>
              <p className="text-gray-400 text-xs">30-day money back</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 GameHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;