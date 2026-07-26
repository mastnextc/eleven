import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo className="h-8 w-auto" dark />
            <p className="mt-4 text-xs leading-6 text-stone-400">
              Discover premium designs curated exclusively for the modern woman. Elevating your everyday wardrobe with timeless classics and contemporary fashion.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Shop Categories</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link to="/shop?category=Ethnic Wear" className="hover:text-white transition-colors">Ethnic Wear</Link></li>
              <li><Link to="/shop?category=Dresses" className="hover:text-white transition-colors">Designer Dresses</Link></li>
              <li><Link to="/shop?category=Western Wear" className="hover:text-white transition-colors">Western Tops</Link></li>
              <li><Link to="/shop" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Customer Service</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Payments Supported</h4>
            <p className="mt-4 text-xs text-stone-400">
              Secure payments powered by Paytm checkout. Supports Paytm Wallet, UPI, Debit Cards, and Cash on Delivery.
            </p>
            <div className="flex items-center space-x-3 mt-4">
              <span className="bg-stone-800 text-[10px] font-bold text-stone-300 px-2 py-1 rounded">Paytm</span>
              <span className="bg-stone-800 text-[10px] font-bold text-stone-300 px-2 py-1 rounded">UPI</span>
              <span className="bg-stone-800 text-[10px] font-bold text-stone-300 px-2 py-1 rounded">Cards</span>
              <span className="bg-stone-800 text-[10px] font-bold text-stone-300 px-2 py-1 rounded">COD</span>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-400">
          <p>© 2026 ELEVEN. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
