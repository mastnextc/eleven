import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const ProductCard = ({ product }) => {
  const { toggleWishlist, wishlist } = useContext(ShopContext);
  const isWishlisted = wishlist.some((item) => item._id === product._id);

  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group relative bg-white border border-stone-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Product Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.isNewArrival && (
          <span className="bg-stone-900 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
            New
          </span>
        )}
        {product.isSale && (
          <span className="bg-rose-500 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
            Sale -{discountPercentage}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => toggleWishlist(product)}
        className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full border border-stone-100 text-stone-500 hover:text-rose-500 transition-colors shadow-sm"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block overflow-hidden relative aspect-[4/5] bg-stone-50">
        <img
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.images && product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">{product.brand || 'ELEVEN'}</p>
        <Link to={`/product/${product._id}`} className="block mt-1 font-medium text-stone-800 text-sm hover:text-stone-600 transition-colors line-clamp-1">
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center space-x-1 mt-1.5">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs text-stone-500 font-medium">{product.ratings || 0}</span>
          <span className="text-[10px] text-stone-400">({product.reviewsCount || 0})</span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline space-x-2 mt-2">
          {product.discountPrice ? (
            <>
              <span className="text-sm font-bold text-stone-900">₹{product.discountPrice}</span>
              <span className="text-xs text-stone-400 line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-stone-900">₹{product.price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
