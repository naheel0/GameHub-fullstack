import { useEffect, useRef, useState } from "react";
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
    images: [],
    description: ""
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [trailerFile, setTrailerFile] = useState(null);

  const imageInputRef = useRef(null);
  const trailerInputRef = useRef(null);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        ...editingProduct,
        price: editingProduct.price || "",
        rating: editingProduct.rating || 4.0,
        inStock: editingProduct.inStock !== undefined ? editingProduct.inStock : true,
        images: editingProduct.images || [],
        trailer: editingProduct.trailer || ""
      });
      setImageFiles([]);
      setTrailerFile(null);
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageFilesChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImageFiles((prev) => [...prev, ...mapped]);
    event.target.value = "";
  };

  const handleRemoveExistingImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveNewImage = (index) => {
    setImageFiles((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  const handleTrailerChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (trailerFile?.preview) {
      URL.revokeObjectURL(trailerFile.preview);
    }

    setTrailerFile({
      file,
      preview: URL.createObjectURL(file)
    });
    event.target.value = "";
  };

  // clearTrailerFile removed — not used

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasImages = formData.images.length > 0 || imageFiles.length > 0;
    const hasTrailer = Boolean(formData.trailer) || Boolean(trailerFile);

    if (!hasImages && !editingProduct) {
      window.alert("Please add at least one product image.");
      return;
    }

    if (!hasTrailer && !editingProduct) {
      window.alert("Please add a trailer file.");
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating),
      inStock: formData.inStock,
      images: (formData.images || []).filter(Boolean),
      imageFiles: imageFiles.map((item) => item.file),
      trailerFile: trailerFile?.file || null
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

          {/* Trailer File Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Video className="w-4 h-4 text-red-400" />
              Trailer File *
            </label>

            <input
              ref={trailerInputRef}
              type="file"
              accept="video/*"
              onChange={handleTrailerChange}
              className="hidden"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => trailerInputRef.current?.click()}
                className="px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Upload Trailer
              </button>

              <div className="text-sm text-gray-400">Accepted: MP4, WEBM, MOV</div>
            </div>
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

          {/* Images Section (file inputs) */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <Image className="w-4 h-4 text-yellow-400" />
              Product Images *
            </label>

            <div className="flex items-center gap-3">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFilesChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Upload Images
              </button>

              <div className="text-sm text-gray-400">You can upload multiple images. Existing URLs remain shown below.</div>
            </div>

            {/* Previews for existing URL images and newly selected files */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Image className="w-4 h-4 text-yellow-400" />
                Image Previews
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((image, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-xl border-2 border-gray-700 group-hover:border-yellow-500 transition-all duration-200"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Image+Error'; }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(index)}
                        className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-all duration-200"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {imageFiles.map((img, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={img.preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-20 object-cover rounded-xl border-2 border-gray-700 group-hover:border-yellow-500 transition-all duration-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg transition-all duration-200"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trailer Preview */}
          {(formData.trailer || trailerFile) && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <Video className="w-4 h-4 text-red-400" />
                Trailer Preview
              </label>
              <div className="aspect-video bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                {trailerFile ? (
                  <video src={trailerFile.preview} controls className="w-full h-full" />
                ) : (
                  <iframe
                    src={formData.trailer}
                    title="Trailer Preview"
                    className="w-full h-full"
                    allowFullScreen
                  />
                )}
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