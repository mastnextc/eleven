import React, { useContext, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Heart, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, toggleWishlist, wishlist, API_URL, token, products } = useContext(ShopContext);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  // Fetch product detail and reviews
  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
        setReviews(data.reviews);
        if (data.product.images && data.product.images[0]) {
          setActiveImage(data.product.images[0]);
        }
        if (data.product.sizes && data.product.sizes[0]) {
          setSelectedSize(data.product.sizes[0]);
        }
        if (data.product.colors && data.product.colors[0]) {
          setSelectedColor(data.product.colors[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  // Handle Review Submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewMessage("Please login to write a review.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: userRating, comment: userComment })
      });

      if (res.ok) {
        setReviewMessage("Review posted successfully!");
        setUserComment('');
        fetchProductDetail(); // Reload reviews and ratings
      } else {
        const data = await res.json();
        setReviewMessage(data.message || "Failed to post review.");
      }
    } catch (err) {
      console.error(err);
      setReviewMessage("Server error posting review.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-500">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-500">
        Product not found. <Link to="/shop" className="underline font-bold">Go back to shop</Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some(item => item._id === product._id);
  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Filter related products
  const relatedProducts = products
    .filter(p => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Product Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Side: Images Viewer */}
        <div className="md:col-span-6 space-y-4">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-stone-100 bg-stone-50">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 aspect-[4/5] rounded-lg overflow-hidden border ${
                    activeImage === img ? 'border-stone-900 ring-1 ring-stone-900' : 'border-stone-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Options Form */}
        <div className="md:col-span-6 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-400 font-bold">{product.brand || 'Elora'}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif mt-1 leading-tight">{product.name}</h1>
            
            {/* Rating Stars */}
            <div className="flex items-center space-x-1.5 mt-3">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-semibold text-stone-700">{product.ratings || 0}</span>
              <span className="text-xs text-stone-400">({product.reviewsCount || 0} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3 border-y border-stone-100 py-4">
            {product.discountPrice ? (
              <>
                <span className="text-2xl font-bold text-stone-900">₹{product.discountPrice}</span>
                <span className="text-sm text-stone-450 line-through">₹{product.price}</span>
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  -{discountPercentage}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-stone-900">₹{product.price}</span>
            )}
          </div>

          <p className="text-stone-500 text-sm leading-relaxed">{product.description}</p>

          {/* Sizes Select */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Select Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      selectedSize === size
                        ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                        : 'border-stone-200 text-stone-700 hover:border-stone-400 bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors Select */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Select Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`border rounded-full px-3.5 py-1.5 text-xs transition-all ${
                      selectedColor === color
                        ? 'bg-stone-900 border-stone-900 text-white font-semibold shadow-sm'
                        : 'border-stone-200 text-stone-600 hover:border-stone-455 bg-white'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border border-stone-200 rounded-lg">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-3.5 py-2 text-stone-500 hover:text-stone-700 font-bold"
              >
                -
              </button>
              <span className="px-3 py-2 text-xs font-bold text-stone-850">{qty}</span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                className="px-3.5 py-2 text-stone-500 hover:text-stone-700 font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={() => addToCart(product, qty, selectedSize, selectedColor)}
              disabled={product.stock === 0}
              className={`flex-1 flex items-center justify-center space-x-2 bg-stone-900 text-white font-semibold text-sm py-3 rounded-xl hover:bg-stone-850 transition-colors shadow-sm ${
                product.stock === 0 ? 'opacity-50 cursor-not-allowed bg-stone-400' : ''
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`border p-3 rounded-xl transition-all ${
                isWishlisted
                  ? 'border-rose-100 bg-rose-50/50 text-rose-500'
                  : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:bg-stone-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-[11px] text-stone-500">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-stone-400" />
              <span>Free Delivery in India</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-stone-400" />
              <span>7 Days Direct Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-stone-400" />
              <span>100% Original Fabric</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Form & Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-stone-100">
        {/* Review list */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-lg font-bold font-serif text-stone-900 border-b border-stone-100 pb-3">
            Customer Reviews ({reviews.length})
          </h2>
          {reviews.length > 0 ? (
            <div className="space-y-4 division-y division-stone-100">
              {reviews.map((rev) => (
                <div key={rev._id} className="pt-4 first:pt-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-stone-900 text-sm">{rev.userName}</h4>
                      <div className="flex text-amber-400 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 fill-current ${
                              i < rev.rating ? 'text-amber-400' : 'text-stone-250'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed mt-2">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-400">No reviews have been left for this product yet. Be the first one!</p>
          )}
        </div>

        {/* Add review form */}
        <div className="lg:col-span-5 bg-stone-50/50 border border-stone-100 p-6 rounded-2xl h-fit">
          <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wide border-b pb-2 mb-4">Write a Review</h3>
          {reviewMessage && (
            <div className={`p-2.5 rounded-lg text-xs font-semibold mb-4 ${
              reviewMessage.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {reviewMessage}
            </div>
          )}
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="p-1 text-amber-400"
                  >
                    <Star className={`w-5 h-5 fill-current ${star <= userRating ? 'text-amber-400' : 'text-stone-200'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Comment</label>
              <textarea
                rows="4"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share details about size fit, fabric quality, and print..."
                required
                className="w-full text-xs bg-white border border-stone-200 rounded-xl p-3 focus:outline-none focus:border-stone-400 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-stone-900 text-white font-semibold text-xs py-2.5 rounded-lg hover:bg-stone-850 transition-colors"
            >
              Post Review
            </button>
          </form>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-stone-100">
          <h2 className="text-xl font-bold font-serif text-stone-900 text-center">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {relatedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
