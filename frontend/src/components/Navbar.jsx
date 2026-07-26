import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Search, Heart, ShoppingBag, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
  const { getCartCount, wishlist, user, logout, searchQuery, setSearchQuery } = useContext(ShopContext);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/shop');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo className="h-7 sm:h-8 w-auto" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 text-sm font-medium text-stone-600">
            <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-stone-900 transition-colors">Shop</Link>
            <Link to="/shop?category=Ethnic Wear" className="hover:text-stone-900 transition-colors">Ethnic Wear</Link>
            <Link to="/shop?category=Dresses" className="hover:text-stone-900 transition-colors">Dresses</Link>
            <Link to="/shop?category=Western Wear" className="hover:text-stone-900 transition-colors">Western Wear</Link>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-64">
            <input
              type="text"
              placeholder="Search fashion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-full py-1.5 pl-4 pr-10 text-xs focus:outline-none focus:border-stone-400"
            />
            <button type="submit" className="absolute right-3 text-stone-400 hover:text-stone-600">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Icons Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative p-1.5 text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-50 transition-all">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative p-1.5 text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-50 transition-all">
              <ShoppingBag className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-1 p-1.5 text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-50 transition-all"
              >
                <User className="w-5 h-5" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2.5 w-48 bg-white border border-stone-100 rounded-lg shadow-lg py-1.5 text-sm z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100 font-medium text-stone-900">
                        Hey, {user.name}
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-stone-700 hover:bg-stone-50"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-2 text-stone-700 hover:bg-stone-50"
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2 text-rose-600 hover:bg-rose-50 border-t border-stone-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-2 text-stone-700 hover:bg-stone-50"
                      >
                        Login
                      </Link>
                      <Link
                        to="/login?tab=register"
                        onClick={() => setShowProfileMenu(false)}
                        className="block px-4 py-2 text-stone-700 hover:bg-stone-50"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 text-stone-600 hover:text-stone-900 rounded-full hover:bg-stone-50"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Links Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-3 space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            Shop All
          </Link>
          <Link
            to="/shop?category=Ethnic Wear"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            Ethnic Wear
          </Link>
          <Link
            to="/shop?category=Dresses"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            Dresses
          </Link>
          <Link
            to="/shop?category=Western Wear"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-stone-700 hover:bg-stone-50 hover:text-stone-900"
          >
            Western Wear
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
