import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { useWishlist } from '../../contexts/WishlistContext';
import { BaseUrl, normalizeGame } from '../../Services/api';
import { GameCardSkeleton, HeroSkeleton, FeatureSkeleton } from '../../components/common/Skeleton';
import HeroSection from '../../components/Home/HeroSection';
import FeaturesSection from '../../components/Home/FeaturesSection';
import FeaturedGamesSection from '../../components/Home/FeaturedGamesSection';
import CTASction from '../../components/Home/CTASction';

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
          throw new Error('Failed to fetch games data');
        }
        const payload = await response.json();
        const items = payload?.data?.items || payload?.items || payload || [];
        const normalized = items.map(normalizeGame).filter(Boolean);
        setFeaturedGames(normalized.slice(0, 6));
        setLoading(false);
      } catch (err) {
        console.debug('Error fetching games:', err);
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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-400'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="w-full h-[90vh] md:h-[85vh] sm:h-[70vh] relative overflow-hidden">
          <HeroSkeleton />
        </div>
        <section className="bg-gray-900 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-10 bg-gray-800 animate-pulse rounded-lg w-64 mx-auto mb-4" />
              <div className="h-6 bg-gray-800 animate-pulse rounded-lg w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <FeatureSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-10 bg-gray-800 animate-pulse rounded-lg w-64 mx-auto mb-4" />
              <div className="h-6 bg-gray-800 animate-pulse rounded-lg w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (apiUnavailable) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-2xl rounded-2xl border border-red-900 bg-red-950/40 p-8 text-center shadow-2xl shadow-red-950/20">
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Backend unavailable
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-300">
            The application cannot reach the backend API. Please check configuration and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <HeroSection
        featuredGames={featuredGames}
        renderStars={renderStars}
      />
      <FeaturesSection />
      <FeaturedGamesSection
        featuredGames={featuredGames}
        renderStars={renderStars}
        onWishlistToggle={handleWishlistToggle}
        isInWishlist={isInWishlist}
      />
      <CTASction />
    </div>
  );
};

export default Home;
