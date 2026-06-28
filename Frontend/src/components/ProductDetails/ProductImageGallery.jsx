import React from 'react';
import { MdArrowForwardIos, MdArrowBackIosNew } from "react-icons/md";

const ProductImageGallery = ({
  game,
  selectedImageIndex,
  setSelectedImageIndex,
  showVideo,
  setShowVideo,
  isFullScreen,
  openFullScreen,
  closeFullScreen,
  nextImage,
  prevImage,
  fullScreenImageIndex,
  setFullScreenImageIndex,
}) => {
  const handleThumbnailClick = (index) => {
    setShowVideo(false);
    setSelectedImageIndex(index);
  };

  const handleVideoClick = () => {
    setShowVideo(true);
    setSelectedImageIndex(0);
  };

  const isSafeTrailerUrl = (u) => {
    try {
      if (!u) return false;
      const parsed = new URL(u, window.location.origin);
      const host = parsed.hostname.toLowerCase();
      const allowedHosts = [
        'www.youtube.com',
        'youtube.com',
        'youtu.be',
        'www.youtu.be',
        'player.vimeo.com',
        'vimeo.com',
        'www.vimeo.com',
        'www.youtube-nocookie.com',
      ];
      return allowedHosts.some((h) => host === h || host.endsWith('.' + h));
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        {showVideo ? (
          <div className="relative pt-[56.25%]">
            {(() => {
              const trailerUrl = game?.trailer || '';
              if (isSafeTrailerUrl(trailerUrl)) {
                return (
                  <iframe
                    src={trailerUrl}
                    title={`${game.name} Trailer`}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="no-referrer"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  />
                );
              }
              return (
                <div className="p-4 text-center text-gray-300">
                  <p>Trailer unavailable or blocked for security.</p>
                  {trailerUrl ? (
                    <a
                      href={trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-400 hover:text-red-300"
                    >
                      Open trailer in new tab
                    </a>
                  ) : null}
                </div>
              );
            })()}
          </div>
        ) : (
          <div
            className="cursor-zoom-in"
            onClick={() => openFullScreen(selectedImageIndex)}
          >
            <img
              src={game.images?.[selectedImageIndex] || '/images/placeholder-game.jpg'}
              alt={`${game.name} - Image ${selectedImageIndex + 1}`}
              className="w-full h-96 object-cover"
              onError={(e) => {
                e.target.src = '/images/placeholder-game.jpg';
              }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3">
        <button
          onClick={handleVideoClick}
          className={`relative rounded-lg overflow-hidden border-2 ${
            showVideo ? 'border-red-600' : 'border-gray-600'
          }`}
        >
          <div className="aspect-square bg-gray-700 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-white text-xs">▶</span>
              </div>
              <span className="text-xs">Trailer</span>
            </div>
          </div>
        </button>

        {game.images?.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`rounded-lg overflow-hidden border-2 cursor-pointer ${
              !showVideo && selectedImageIndex === index
                ? 'border-red-600'
                : 'border-gray-600'
            }`}
          >
            <img
              src={image}
              alt={`${game.name} ${index + 1}`}
              className="w-full h-20 object-cover"
              onError={(e) => {
                e.target.src = '/images/placeholder-game.jpg';
              }}
            />
          </button>
        ))}
      </div>

      {!showVideo && game.images && game.images.length > 1 && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={() =>
              setSelectedImageIndex((prev) =>
                prev > 0 ? prev - 1 : game.images.length - 1
              )
            }
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300 border border-gray-600 text-white"
          >
            <MdArrowBackIosNew />
          </button>
          <span className="px-4 py-2 text-gray-300">
            {selectedImageIndex + 1} / {game.images.length}
          </span>
          <button
            onClick={() =>
              setSelectedImageIndex((prev) =>
                prev < game.images.length - 1 ? prev + 1 : 0
              )
            }
            className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition duration-300 border border-gray-600 text-white"
          >
            <MdArrowForwardIos />
          </button>
        </div>
      )}

      {isFullScreen && game && game.images && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <button
            onClick={closeFullScreen}
            className="absolute top-4 right-4 text-white hover:text-red-500 z-10 bg-gray-800 rounded-full p-2 border border-gray-600"
          >
            <span className="text-2xl leading-none">×</span>
          </button>

          {game.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-red-500 z-10 bg-gray-800 rounded-full p-2 border border-gray-600"
              >
                <MdArrowBackIosNew />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-red-500 z-10 bg-gray-800 rounded-full p-2 border border-gray-600"
              >
                <MdArrowForwardIos />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg">
            {fullScreenImageIndex + 1} / {game.images.length}
          </div>

          <div className="max-w-4xl max-h-full p-4">
            <img
              src={game.images[fullScreenImageIndex]}
              alt={`${game.name} - Image ${fullScreenImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-2 overflow-x-auto max-w-full px-4">
            {game.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setFullScreenImageIndex(index)}
                className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                  fullScreenImageIndex === index
                    ? 'border-red-600'
                    : 'border-gray-600'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
