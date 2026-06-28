import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { FaStar } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroSection = ({ featuredGames, renderStars }) => {
  return (
    <div className="w-full h-[90vh] md:h-[85vh] sm:h-[70vh] relative overflow-hidden">
      {featuredGames.length === 0 ? (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <p className="text-gray-400">Loading featured games...</p>
        </div>
      ) : (
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
                <img
                  src={game.images?.[0] || '/images/placeholder-game.jpg'}
                  alt={game.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-game.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/60" />
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
                      onClick={() => window.open(game.trailer, '_blank')}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-red-700 px-8 py-4 rounded-lg font-bold text-lg transition duration-300 transform hover:scale-105"
                    >
                      Watch Trailer
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
};

export default HeroSection;
