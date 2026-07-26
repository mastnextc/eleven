import React, { useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const Shop = () => {
  const { products, searchQuery, setSearchQuery } = useContext(ShopContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [sortOption, setSortOption] = useState('newest');

  // Sync category query parameter
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat !== null) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Handle category filter updates
  const handleCategoryClick = (categoryName) => {
    const nextCat = selectedCategory === categoryName ? '' : categoryName;
    setSelectedCategory(nextCat);
    if (nextCat) {
      setSearchParams({ category: nextCat });
    } else {
      setSearchParams({});
    }
  };

  // Reset Filters
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSize('');
    setSelectedColor('');
    setMaxPrice(6000);
    setSearchQuery('');
    setSearchParams({});
  };

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((product) => {
      const matchSearch = searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchCategory = selectedCategory ? product.category === selectedCategory : true;
      const matchSize = selectedSize ? product.sizes.includes(selectedSize) : true;
      const matchColor = selectedColor ? product.colors.includes(selectedColor) : true;
      const matchPrice = (product.discountPrice || product.price) <= maxPrice;

      return matchSearch && matchCategory && matchSize && matchColor && matchPrice;
    })
    .sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;

      if (sortOption === 'price-asc') return priceA - priceB;
      if (sortOption === 'price-desc') return priceB - priceA;
      if (sortOption === 'rating') return b.ratings - a.ratings;
      return new Date(b.createdAt) - new Date(a.createdAt); // newest
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters - Desktop */}
        <aside className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="flex justify-between items-center border-b border-stone-150 pb-3">
            <h2 className="font-bold text-stone-900 flex items-center text-sm uppercase tracking-wide">
              <Filter className="w-4 h-4 mr-2" /> Filters
            </h2>
            <button onClick={clearFilters} className="text-xs text-amber-700 hover:text-amber-800 font-semibold">
              Clear All
            </button>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Categories</h3>
            <div className="space-y-2">
              {['Ethnic Wear', 'Dresses', 'Western Wear'].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`w-full text-left text-sm py-1.5 px-2.5 rounded-md transition-colors ${
                    selectedCategory === category
                      ? 'bg-stone-900 text-white font-medium'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                  className={`border rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedSize === size
                      ? 'bg-stone-900 border-stone-900 text-white'
                      : 'border-stone-200 text-stone-700 hover:border-stone-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {['Indigo Blue', 'Turmeric', 'Rust Red', 'Pink', 'Blue', 'White', 'Maroon', 'Emerald Green', 'Mustard', 'Rose Gold', 'Sky Blue', 'Yellow', 'Olive Green'].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                  className={`border rounded-full px-3.5 py-1.5 text-xs transition-all ${
                    selectedColor === color
                      ? 'bg-stone-900 border-stone-900 text-white font-medium'
                      : 'border-stone-200 text-stone-600 bg-white hover:border-stone-400'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Max Price: <span className="text-stone-950 font-bold">₹{maxPrice}</span>
            </h3>
            <input
              type="range"
              min="300"
              max="6000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-stone-900"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>₹300</span>
              <span>₹6,000</span>
            </div>
          </div>
        </aside>

        {/* Product Catalog Grid Section */}
        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-stone-100 pb-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 font-serif">
                {selectedCategory ? `${selectedCategory}` : 'Shop All Collections'}
              </h1>
              <p className="text-xs text-stone-500 mt-1">Showing {filteredProducts.length} items</p>
            </div>

            {/* Sort & Quick Filter Bar */}
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              {searchQuery && (
                <span className="text-xs bg-stone-100 border text-stone-600 px-3 py-1.5 rounded-full flex items-center">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-2 font-bold hover:text-stone-900">×</button>
                </span>
              )}
              
              <div className="flex items-center space-x-2 border border-stone-200 rounded-lg px-3 py-1.5 bg-white text-xs text-stone-600 w-full sm:w-auto justify-between">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-transparent focus:outline-none font-medium cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Popularity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Cards List Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-stone-50 border border-dashed rounded-3xl space-y-3">
              <SlidersHorizontal className="w-8 h-8 text-stone-300 mx-auto" />
              <h3 className="font-semibold text-stone-700">No products match your filters</h3>
              <p className="text-xs text-stone-400 max-w-xs mx-auto">Try resetting selected categories, sizes, colors, or broadening your price filter.</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-xs bg-stone-950 text-white font-semibold px-4 py-2 rounded-full"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
