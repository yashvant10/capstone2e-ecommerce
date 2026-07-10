import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MapPin, DollarSign } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto flex flex-col">
      {/* Back to top bar */}
      <button 
        onClick={scrollToTop}
        className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-4 text-center transition-colors"
      >
        Back to top
      </button>

      {/* Main Footer Links */}
      <div className="max-w-[1000px] mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold text-base mb-2">Get to Know Us</h3>
            <Link to="#" className="text-sm hover:underline">Careers</Link>
            <Link to="#" className="text-sm hover:underline">Blog</Link>
            <Link to="#" className="text-sm hover:underline">About Stockroom</Link>
            <Link to="#" className="text-sm hover:underline">Investor Relations</Link>
            <Link to="#" className="text-sm hover:underline">Stockroom Devices</Link>
            <Link to="#" className="text-sm hover:underline">Stockroom Science</Link>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold text-base mb-2">Make Money with Us</h3>
            <Link to="#" className="text-sm hover:underline">Sell products on Stockroom</Link>
            <Link to="#" className="text-sm hover:underline">Sell on Stockroom Business</Link>
            <Link to="#" className="text-sm hover:underline">Sell apps on Stockroom</Link>
            <Link to="#" className="text-sm hover:underline">Become an Affiliate</Link>
            <Link to="#" className="text-sm hover:underline">Advertise Your Products</Link>
            <Link to="#" className="text-sm hover:underline">Self-Publish with Us</Link>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold text-base mb-2">Stockroom Payment Products</h3>
            <Link to="#" className="text-sm hover:underline">Stockroom Business Card</Link>
            <Link to="#" className="text-sm hover:underline">Shop with Points</Link>
            <Link to="#" className="text-sm hover:underline">Reload Your Balance</Link>
            <Link to="#" className="text-sm hover:underline">Stockroom Currency Converter</Link>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-white font-bold text-base mb-2">Let Us Help You</h3>
            <Link to="#" className="text-sm hover:underline">Stockroom and COVID-19</Link>
            <Link to="#" className="text-sm hover:underline">Your Account</Link>
            <Link to="#" className="text-sm hover:underline">Your Orders</Link>
            <Link to="#" className="text-sm hover:underline">Shipping Rates & Policies</Link>
            <Link to="#" className="text-sm hover:underline">Returns & Replacements</Link>
            <Link to="#" className="text-sm hover:underline">Manage Your Content and Devices</Link>
            <Link to="#" className="text-sm hover:underline">Help</Link>
          </div>

        </div>
      </div>

      <div className="border-t border-slate-800"></div>

      {/* Footer Bottom / Settings */}
      <div className="max-w-7xl mx-auto px-4 py-8 w-full flex flex-col items-center gap-6">
        <Link to="/" className="text-2xl font-display font-bold text-white tracking-tight">Stockroom</Link>
        
        <div className="flex flex-wrap justify-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-600 rounded text-sm hover:text-white hover:border-slate-400 transition-colors">
            <Globe size={16} /> English
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-600 rounded text-sm hover:text-white hover:border-slate-400 transition-colors">
            <DollarSign size={16} /> USD - U.S. Dollar
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-600 rounded text-sm hover:text-white hover:border-slate-400 transition-colors">
            <MapPin size={16} /> India
          </button>
        </div>
      </div>

      <div className="bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="flex justify-center gap-6 mb-2">
          <Link to="#" className="hover:underline">Conditions of Use</Link>
          <Link to="#" className="hover:underline">Privacy Notice</Link>
          <Link to="#" className="hover:underline">Consumer Health Data Privacy Disclosure</Link>
          <Link to="#" className="hover:underline">Your Ads Privacy Choices</Link>
        </div>
        <p>© 2026, Stockroom.com, Inc. or its affiliates. Designed with precision.</p>
      </div>
    </footer>
  );
}
