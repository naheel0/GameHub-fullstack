import { useEffect, useState } from "react";
import { useAdmin } from "./contexts/AdminContext";
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Plus, Trash2, X, Image, Video, GamepadIcon, Edit3, Shield } from "lucide-react";

export default function AdminAddProducts({ onClose, editingProduct }) {
  const { addProduct, editProduct } = useAdmin();

  const [formData, setFormData] = useState({
    name: "",
    genre: "",
    platform: "",
    price: "",
    rating: 4.0,
    inStock: true,
    trailer: "",
    images: [""],
    description: ""
  });

  const [newImage, setNewImage] = useState("");

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...editingProduct,
        price: editingProduct.price || "",
        rating: editingProduct.rating || 4.0,
        inStock: editingProduct.inStock !== undefined ? editingProduct.inStock : true,
        images: editingProduct.images || [""],
        trailer: editingProduct.trailer || ""
      });
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage("");
    }
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (index, value) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: updatedImages
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating),
      inStock: formData.inStock,
      images: formData.images.filter(img => img.trim() !== "")
    };

    if (editingProduct) {
      await editProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center text-white z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-linear-to-br from-gray-900 to-gray-800 p-6 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-700/50 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-xl">
              <GamepadIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {editingProduct ? "Edit Product" : "Add New Game"}
              </h2>
              <p className="text-sm text-gray-400">
                {editingProduct ? "Update game details" : "Add a new game to your store"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Elden Ring"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                Genre *
              </label>
              <input
                type="text"
                name="genre"
                placeholder="Action RPG"
                value={formData.genre}
                onChange={handleChange}
                className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Platform *
              </label>
              <input
                type="text"
                name="platform"
                placeholder="PC, PlayStation, Xbox"
                value={formData.platform}
                onChange={handleChange}
                className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                placeholder="3999"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200"
                required
                min="0"
                step="1"
              />
            </div>
          </div>

          {/* Rating & Stock Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                Rating *
              </label>
              <input
                type="number"
                name="rating"
                placeholder="4.5"
                value={formData.rating}
                onChange={handleChange}
                className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                required
                min="0"
                max="5"
                step="0.1"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 w-full cursor-pointer hover:bg-gray-700/50 transition-all duration-200">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.inStock ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.inStock ? 'left-7' : 'left-1'}`}></div>
                  </div>
                </div>
                <span className="text-gray-300 font-medium">In Stock</span>
                {formData.inStock ? (
                  <Shield className="w-4 h-4 text-green-400" />
                ) : (
                  <Shield className="w-4 h-4 text-gray-400" />
                )}
              </label>
            </div>
          </div>

          {/* Trailer URL */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Video className="w-4 h-4 text-red-400" />
              YouTube Trailer URL *
            </label>
            <input
              type="url"
              name="trailer"
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
              value={formData.trailer}
              onChange={handleChange}
              className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all duration-200"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
              Description *
            </label>
            <textarea
              name="description"
              placeholder="Enter detailed game description..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200 resize-none"
              required
            />
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Image className="w-4 h-4 text-yellow-400" />
              Product Images *
            </label>
            
            {/* Existing Images */}
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="flex-1 p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Remove image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector(`input[value="${image}"]`);
                    input?.focus();
                  }}
                  className="p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Edit image URL"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
              </div>
            ))}

            {/* Add New Image */}
            <div className="flex items-center gap-3">
              <input
                type="url"
                placeholder="Add new image URL..."
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                className="flex-1 p-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all duration-200"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="p-3 bg-green-600 hover:bg-green-500 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                title="Add image"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-medium">Add</span>
              </button>
            </div>
          </div>

          {/* Image Previews */}
          {formData.images.some(img => img.trim() !== "") && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Image className="w-4 h-4 text-yellow-400" />
                Image Previews
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.filter(img => img.trim() !== "").map((image, index) => (
                  <div key={index} className="relative group group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-xl border-2 border-gray-700 group-hover:border-yellow-500 transition-all duration-200"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-all duration-200"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.querySelectorAll('input[type="url"]')[index];
                          input?.focus();
                        }}
                        className="p-1.5 bg-blue-500/80 hover:bg-blue-500 rounded-lg transition-all duration-200"
                        title="Edit image URL"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trailer Preview */}
          {formData.trailer && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Video className="w-4 h-4 text-red-400" />
                Trailer Preview
              </label>
              <div className="aspect-video bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                <iframe
                  src={formData.trailer}
                  title="Trailer Preview"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-linear-to- from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium shadow-lg shadow-red-500/25 flex items-center gap-2"
            >
              {editingProduct ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  Update Game
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Game
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}