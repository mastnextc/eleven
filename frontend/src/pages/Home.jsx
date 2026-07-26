import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';

const Home = () => {
  const { products } = useContext(ShopContext);

  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative bg-stone-100 overflow-hidden">
        <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-12 gap-8 items-center px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-white border border-stone-200 rounded-full px-3.5 py-1 text-xs text-stone-700 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Unveiling the Autumn Collection 2026</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 font-serif leading-tight">
              Grace in every <br />
              <span className="text-amber-700 italic font-medium">Thread and Fold</span>
            </h1>
            <p className="max-w-xl mx-auto lg:mx-0 text-stone-500 text-sm sm:text-base leading-relaxed">
              Explore timeless classics, authentic handloom weaves, and contemporary Western statement styles meticulously crafted to celebrate womanhood.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                to="/shop"
                className="bg-stone-900 text-white font-medium text-sm px-8 py-3 rounded-full hover:bg-stone-850 transition-colors shadow-md"
              >
                Shop New Arrivals
              </Link>
              <Link
                to="/shop?category=Ethnic Wear"
                className="bg-white border border-stone-300 text-stone-700 font-medium text-sm px-8 py-3 rounded-full hover:bg-stone-50 transition-colors"
              >
                Explore Ethnic Wear
              </Link>
            </div>
          </div>

          {/* Banner Images */}
          <div className="hidden lg:grid lg:col-span-6 grid-cols-2 gap-4 relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=60"
                alt="Ethnic Wear"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-4 border-white translate-y-8">
              <img
                src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60"
                alt="Western Wear"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">Curated Categories</h2>
            <p className="text-xs text-stone-500 mt-1">Shop premium styles handpicked for your special moments</p>
          </div>
          <Link to="/shop" className="text-xs font-semibold text-amber-700 flex items-center hover:text-amber-800">
            View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {/* Category 1 */}
          <Link to="/shop?category=Ethnic Wear" className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=60"
              alt="Ethnic Wear"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-white text-lg font-bold">Ethnic Wear</h3>
                <p className="text-white/80 text-[10px] uppercase tracking-wider font-semibold">Kurtis & Suits</p>
              </div>
            </div>
          </Link>

          {/* Category 2 */}
          <Link to="/shop?category=Dresses" className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=60"
              alt="Dresses"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-white text-lg font-bold">Dresses</h3>
                <p className="text-white/80 text-[10px] uppercase tracking-wider font-semibold">Midi, Gowns & Maxis</p>
              </div>
            </div>
          </Link>

          {/* Category 3 */}
          <Link to="/shop?category=Western Wear" className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=60"
              alt="Western Wear"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <div>
                <h3 className="text-white text-lg font-bold">Western Wear</h3>
                <p className="text-white/80 text-[10px] uppercase tracking-wider font-semibold">Tops, Blouses & Casuals</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">New Arrivals</h2>
          <p className="text-stone-500 text-sm mt-2">Latest additions fresh off our design studios</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {newArrivals.length > 0 ? (
            newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-stone-400 text-sm">No new arrivals available right now.</p>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-950 text-amber-50 rounded-3xl overflow-hidden p-8 sm:p-12 relative flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
          <div className="space-y-4 max-w-lg text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">Flat 20% Off Your First Order</h2>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              Unlock exclusive discounts. Use coupon code <span className="font-bold text-white bg-amber-900/60 px-2 py-0.5 rounded tracking-wide">FASHION20</span> at checkout on minimum purchases of ₹999.
            </p>
            <div className="pt-2">
              <Link to="/shop" className="inline-flex items-center text-xs font-bold tracking-wide uppercase bg-white text-stone-900 px-6 py-2.5 rounded-full hover:bg-stone-50 transition-colors">
                Redeem Offer <ArrowRight className="w-3.5 h-3.5 ml-2 text-stone-900" />
              </Link>
            </div>
          </div>
          <div className="w-48 sm:w-64 aspect-square bg-amber-900/40 rounded-full flex items-center justify-center border border-amber-900/30">
            <div className="text-center p-6 border-4 border-amber-200/20 rounded-full w-full h-full flex flex-col justify-center items-center">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-200">Limited Offer</span>
              <span className="text-5xl font-black font-serif text-white mt-1">20%</span>
              <span className="text-[10px] tracking-wide uppercase font-bold text-amber-200 mt-1">DISCOUNT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">Best Sellers</h2>
          <p className="text-stone-500 text-sm mt-2">Styles loved and recommended by customers nationwide</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {bestSellers.length > 0 ? (
            bestSellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-stone-400 text-sm">No best sellers populated yet.</p>
          )}
        </div>
      </section>

      {/* Features Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-100 pt-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="space-y-3 flex flex-col items-center">
            <div className="bg-stone-50 p-4 rounded-full border border-stone-100 text-stone-850">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-stone-900">Secure Payments</h4>
            <p className="text-xs text-stone-500 leading-normal max-w-[240px]">
              Encrypted transactions processed via Paytm gateway. Supports wallet, cards, and UPI.
            </p>
          </div>
          <div className="space-y-3 flex flex-col items-center">
            <div className="bg-stone-50 p-4 rounded-full border border-stone-100 text-stone-850">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-stone-900">Easy Returns</h4>
            <p className="text-xs text-stone-500 leading-normal max-w-[240px]">
              Don't fit your choice? We offer direct, hassle-free 7-day return and exchange policy.
            </p>
          </div>
          <div className="space-y-3 flex flex-col items-center">
            <div className="bg-stone-50 p-4 rounded-full border border-stone-100 text-stone-850">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-stone-900">100% Original Designs</h4>
            <p className="text-xs text-stone-500 leading-normal max-w-[240px]">
              We stand behind our fabrics and embroidery work. Shop authentic designs straight from manufacturers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
