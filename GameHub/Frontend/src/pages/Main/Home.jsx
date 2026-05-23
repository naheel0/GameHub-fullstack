import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../../contexts/WishlistContext";
import {
  FaHeart,
  FaStar,
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaAward,
  FaGamepad,
} from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { BaseUrl, normalizeGame } from "../../Services/api";

const Home = () => {
  const [featuredGames, setFeaturedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const API_BASE = BaseUrl;

  useEffect(() => {
    if (!API_BASE) {
      setApiUnavailable(true);
      setLoading(false);
      return;
    }

    const fetchGames = async () => {
      try {
        const response = await fetch(`${API_BASE}/games?pageSize=100`);
        if (!response.ok) {
          throw new Error("Failed to fetch games data");
        }
        const payload = await response.json();
        const items = payload?.data?.items || payload?.items || payload || [];
        const normalized = items.map(normalizeGame).filter(Boolean);
        setFeaturedGames(normalized.slice(0, 6));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching games:", err);
        setLoading(false);
      }
    };

    fetchGames();
  }, [API_BASE]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleWishlistToggle = (game) => {
    if (isInWishlist(game.id)) {
      removeFromWishlist(game.id);
    } else {
      addToWishlist(game);
    }
  };
  const features = [
    {
      icon: <FaShippingFast className="text-3xl" />,
      title: "Instant Delivery",
      description: "Get your games instantly after purchase",
    },
    {
      icon: <FaShieldAlt className="text-3xl" />,
      title: "Secure Payment",
      description: "100% secure and encrypted transactions",
    },
    {
      icon: <FaHeadset className="text-3xl" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support",
    },
    {
      icon: <FaAward className="text-3xl" />,
      title: "Best Prices",
      description: "Guaranteed lowest prices on all games",
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-400"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading amazing games...</p>
        </div>
      </div>
    );
  }

  if (apiUnavailable) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-2xl rounded-2xl border border-red-900 bg-red-950/40 p-8 text-center shadow-2xl shadow-red-950/20">
          <p className="text-sm uppercase tracking-[0.35em] text-red-300">Configuration required</p>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">API base URL is missing</h1>
          <p className="mt-4 text-base leading-7 text-gray-300">
            Set the Vercel environment variable VITE_API_BASE_URL to your deployed GameHub API URL, then redeploy the frontend.
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Until that variable is set, the app cannot load games from the backend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Swiper Carousel Section */}
      <div className="w-full h-[90vh] md:h-[85vh] sm:h-[70vh] relative overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          slidesPerView={1}
          loop
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          effect="fade"
          className="w-full h-full"
        >
          {featuredGames.map((game) => (
            <SwiperSlide key={game.id}>
              <div className="relative w-full h-full flex items-center justify-center text-center text-white">
                {/* Background Image */}
                <img
                  src={game.images?.[0] || "/images/placeholder-game.jpg"}
                  alt={game.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/images/placeholder-game.jpg";
                  }}
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/" />

                {/* Content */}
                <div className="relative z-10 px-6 sm:px-4">
                  <h2 className="text-5xl md:text-4xl sm:text-2xl font-bold mb-4 drop-shadow-lg">
                    {game.name}
                  </h2>
                  <p className="max-w-2xl mx-auto text-lg sm:text-sm text-gray-300 drop-shadow-md mb-8">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <div className="flex items-center space-x-1">
                      {renderStars(game.rating)}
                    </div>
                    <span className="text-lg">{game.rating}/5.0</span>
                    <span className="text-lg font-semibold text-red-500">
                      ₹{game.price}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      to={`/product/${game.id}`}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition duration-300 transform hover:scale-105"
                    >
                      Buy Now
                    </Link>
                    <button
                      onClick={() => window.open(game.trailer, "_blank")}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-red-700 px-8 py-4 rounded-lg font-bold text-lg transition duration-300 transform hover:scale-105 "
                    >
                      Watch Trailer
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Features Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose GameHub?
            </h2>
            <p className="text-xl text-gray-300">
              The ultimate gaming experience awaits
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300 border border-gray-700"
              >
                <div className="text-red-500 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games Grid */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Games
            </h2>
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
                      src={game.images?.[0] || "/images/placeholder-game.jpg"}
                      alt={game.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = "/images/placeholder-game.jpg";
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
                      onClick={() => handleWishlistToggle(game)}
                      className={`p-2 rounded transition duration-300 border ${
                        isInWishlist(game.id)
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
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

      {/* CTA Section */}
      <section className="bg-linear-to-r from-red-600 to-red-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FaGamepad className="text-6xl text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Join thousands of gamers and discover your next favorite game today.
            Instant delivery, unbeatable prices, and endless entertainment
            await.
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
    </div>
  );
};

export default Home;
