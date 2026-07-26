import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';

const Wishlist = () => {
  const { wishlist } = useContext(ShopContext);

  if (wishlist.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="bg-stone-50 border p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-stone-350">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-serif text-stone-900">Your wishlist is empty</h2>
        <p className="text-xs text-stone-400">Save items you like to view them later or quickly add them to your shopping bag.</p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="bg-stone-900 text-white font-medium text-xs px-6 py-2.5 rounded-full inline-block"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold font-serif text-stone-900 border-b border-stone-100 pb-3">My Wishlist ({wishlist.length})</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
