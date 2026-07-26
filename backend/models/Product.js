const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  category: { type: String, required: true },
  subCategory: { type: String },
  brand: { type: String },
  images: [{ type: String }], // Cloudinary URLs
  sizes: [{ type: String }], // ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  colors: [{ type: String }], // Hex codes or names
  stock: { type: Number, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isSale: { type: Boolean, default: false },
  ratings: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
