import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, LogOut, Package, Menu, X, User, Search, MapPin, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data;
    },
    enabled: !!user,
  });

  const cartCount = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    "Fashion", "Men's Clothing", "Smartphones", "Laptops", "TV",
    "Watches", "Beauty", "Kitchen", "Furniture", "Shoes"
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full flex flex-col">
        {/* Main Navbar Top (Brand + Search + Icons) */}
        <div className="bg-slate-900 text-white w-full">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20 gap-6">
              
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="bg-brand-600 text-white p-2 rounded-xl group-hover:bg-brand-500 transition-colors">
                  <ShoppingBag size={24} strokeWidth={2.5} />
                </div>
                <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-brand-100 transition-colors">
                  Stockroom
                </span>
              </Link>

              {/* Delivery Address (Amazon style) */}
              <div className="hidden lg:flex items-center gap-1 hover:border hover:border-slate-500 border border-transparent p-1 rounded cursor-pointer shrink-0 transition-all">
                <MapPin size={20} className="text-slate-300 mt-2" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-slate-300 px-1">Deliver to</span>
                  <select className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none px-1 pb-1">
                    <option className="text-slate-900" value="India">India (All)</option>
                    <option className="text-slate-900" value="Andaman and Nicobar Islands">Andaman and Nicobar</option>
                    <option className="text-slate-900" value="Andhra Pradesh">Andhra Pradesh</option>
                    <option className="text-slate-900" value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option className="text-slate-900" value="Assam">Assam</option>
                    <option className="text-slate-900" value="Bihar">Bihar</option>
                    <option className="text-slate-900" value="Chandigarh">Chandigarh</option>
                    <option className="text-slate-900" value="Chhattisgarh">Chhattisgarh</option>
                    <option className="text-slate-900" value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
                    <option className="text-slate-900" value="Daman and Diu">Daman and Diu</option>
                    <option className="text-slate-900" value="Delhi">Delhi</option>
                    <option className="text-slate-900" value="Goa">Goa</option>
                    <option className="text-slate-900" value="Gujarat">Gujarat</option>
                    <option className="text-slate-900" value="Haryana">Haryana</option>
                    <option className="text-slate-900" value="Himachal Pradesh">Himachal Pradesh</option>
                    <option className="text-slate-900" value="Jammu and Kashmir">Jammu and Kashmir</option>
                    <option className="text-slate-900" value="Jharkhand">Jharkhand</option>
                    <option className="text-slate-900" value="Karnataka">Karnataka</option>
                    <option className="text-slate-900" value="Kerala">Kerala</option>
                    <option className="text-slate-900" value="Ladakh">Ladakh</option>
                    <option className="text-slate-900" value="Lakshadweep">Lakshadweep</option>
                    <option className="text-slate-900" value="Madhya Pradesh">Madhya Pradesh</option>
                    <option className="text-slate-900" value="Maharashtra">Maharashtra</option>
                    <option className="text-slate-900" value="Manipur">Manipur</option>
                    <option className="text-slate-900" value="Meghalaya">Meghalaya</option>
                    <option className="text-slate-900" value="Mizoram">Mizoram</option>
                    <option className="text-slate-900" value="Nagaland">Nagaland</option>
                    <option className="text-slate-900" value="Odisha">Odisha</option>
                    <option className="text-slate-900" value="Puducherry">Puducherry</option>
                    <option className="text-slate-900" value="Punjab">Punjab</option>
                    <option className="text-slate-900" value="Rajasthan">Rajasthan</option>
                    <option className="text-slate-900" value="Sikkim">Sikkim</option>
                    <option className="text-slate-900" value="Tamil Nadu">Tamil Nadu</option>
                    <option className="text-slate-900" value="Telangana">Telangana</option>
                    <option className="text-slate-900" value="Tripura">Tripura</option>
                    <option className="text-slate-900" value="Uttar Pradesh">Uttar Pradesh</option>
                    <option className="text-slate-900" value="Uttarakhand">Uttarakhand</option>
                    <option className="text-slate-900" value="West Bengal">West Bengal</option>
                  </select>
                </div>
              </div>

              {/* Central Search Bar */}
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-4xl h-11 relative">
                <input 
                  type="text" 
                  placeholder="Search for premium products, brands and more..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-4 pr-12 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
                />
                <button type="submit" className="absolute right-0 h-full px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-r-lg transition-colors flex items-center justify-center">
                  <Search size={20} strokeWidth={2.5} />
                </button>
              </form>

              {/* Right Icons */}
              <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                {user ? (
                  <>
                    <Link to="/profile" className="hidden md:flex flex-col leading-tight hover:border hover:border-slate-500 border border-transparent p-2 rounded transition-all">
                      <span className="text-xs text-slate-300">Hello, {user.name.split(' ')[0]}</span>
                      <span className="text-sm font-bold text-white flex items-center gap-1">Account & Lists <ChevronDown size={14} /></span>
                    </Link>
                    
                    <Link to="/orders" className="hidden md:flex flex-col leading-tight hover:border hover:border-slate-500 border border-transparent p-2 rounded transition-all">
                      <span className="text-xs text-slate-300">Returns</span>
                      <span className="text-sm font-bold text-white">& Orders</span>
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link to="/admin" className="hidden lg:flex bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded">
                        ADMIN
                      </Link>
                    )}

                    <Link to="/cart" className="flex items-center gap-1 hover:border hover:border-slate-500 border border-transparent p-2 rounded transition-all relative">
                      <div className="relative">
                        <ShoppingBag size={28} className="text-white" strokeWidth={2} />
                        {cartCount > 0 && (
                          <span className="absolute -top-1 -right-2 bg-amber-500 text-slate-900 text-xs font-extrabold px-1.5 rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </div>
                      <span className="hidden md:block text-sm font-bold text-white mt-auto">Cart</span>
                    </Link>

                    <button onClick={() => logout()} className="hidden md:flex items-center text-slate-400 hover:text-white transition-colors ml-2 p-2" title="Log out">
                      <LogOut size={20} />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link to="/login" className="hidden md:flex flex-col leading-tight hover:border hover:border-slate-500 border border-transparent p-2 rounded transition-all">
                      <span className="text-xs text-slate-300">Hello, sign in</span>
                      <span className="text-sm font-bold text-white flex items-center gap-1">Account & Lists <ChevronDown size={14} /></span>
                    </Link>
                    <Link to="/register" className="hidden md:flex bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors">
                      Sign Up
                    </Link>
                  </div>
                )}
                
                {/* Mobile Menu Toggle */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="md:hidden text-white hover:text-brand-300 transition-colors p-2"
                >
                  {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>
            
            {/* Mobile Search Bar (shows only on small screens) */}
            <form onSubmit={handleSearch} className="md:hidden w-full pb-4 relative">
              <input 
                type="text" 
                placeholder="Search Stockroom..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-4 pr-12 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 text-base shadow-inner"
              />
              <button type="submit" className="absolute right-0 top-0 h-11 px-4 bg-brand-600 text-white rounded-r-lg flex items-center justify-center">
                <Search size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Secondary Navbar (Categories Ribbon) */}
        <div className="bg-slate-800 text-slate-200 text-sm hidden md:block border-t border-slate-700">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-10 gap-6 overflow-x-auto no-scrollbar">
              <Link to="/products" className="flex items-center gap-1 font-bold hover:text-white hover:border-white border border-transparent p-1 rounded whitespace-nowrap">
                <Menu size={18} /> All
              </Link>
              {categories.map((cat, idx) => (
                <Link 
                  key={idx} 
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="hover:text-white hover:border-white border border-transparent p-1 rounded whitespace-nowrap"
                >
                  {cat}
                </Link>
              ))}
              <Link to="/products" className="font-bold text-amber-400 hover:text-amber-300 hover:border-amber-300 border border-transparent p-1 rounded ml-auto whitespace-nowrap">
                Today's Deals
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Remains mostly unchanged but styled slightly darker) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm md:hidden animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in-left" onClick={e => e.stopPropagation()}>
            {/* User Profile Header in Drawer */}
            <div className="bg-slate-900 p-6 flex items-center gap-3 text-white">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                <User size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">Browse</span>
                <span className="text-brand-400 text-sm font-semibold">Stockroom</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="ml-auto text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col overflow-y-auto flex-1">
              <div className="font-bold text-lg text-slate-900 mb-2 px-2">Trending</div>
              <Link to="/products" className="py-3 px-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded" onClick={() => setIsMobileMenuOpen(false)}>Best Sellers</Link>
              <Link to="/products" className="py-3 px-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded" onClick={() => setIsMobileMenuOpen(false)}>New Releases</Link>
              
              <div className="h-px bg-slate-200 my-4"></div>
              
              <div className="font-bold text-lg text-slate-900 mb-2 px-2">Shop By Category</div>
              {categories.slice(0, 5).map((cat, idx) => (
                <Link key={idx} to={`/products?category=${encodeURIComponent(cat)}`} className="py-3 px-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                  {cat}
                </Link>
              ))}
              
              <div className="h-px bg-slate-200 my-4"></div>
              
              <div className="font-bold text-lg text-slate-900 mb-2 px-2">Help & Settings</div>
              {user ? (
                <>
                  <Link to="/profile" className="py-3 px-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded" onClick={() => setIsMobileMenuOpen(false)}>Your Account</Link>
                  <Link to="/orders" className="py-3 px-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded" onClick={() => setIsMobileMenuOpen(false)}>Your Orders</Link>
                  <Link to="/wishlist" className="py-3 px-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded" onClick={() => setIsMobileMenuOpen(false)}>Your Wishlist</Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }} 
                    className="py-3 px-2 text-left text-slate-700 hover:bg-red-50 hover:text-danger rounded w-full"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="py-3 px-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" className="py-3 px-2 text-slate-700 hover:bg-slate-50 hover:text-brand-600 rounded" onClick={() => setIsMobileMenuOpen(false)}>Create Account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
