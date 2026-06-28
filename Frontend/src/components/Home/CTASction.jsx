import React from 'react';
import { Link } from 'react-router-dom';
import { FaGamepad } from 'react-icons/fa';

const CTASction = () => {
  return (
    <section className="bg-linear-to-r from-red-600 to-red-800 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FaGamepad className="text-6xl text-white mx-auto mb-6" />
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Start Your Adventure?
        </h2>
        <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
          Join thousands of gamers and discover your next favorite game today.
          Instant delivery, unbeatable prices, and endless entertainment await.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition duration-300 transform hover:scale-105"
          >
            Browse All Games
          </Link>
          <Link
            to="/about"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-lg font-bold text-lg transition duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASction;
