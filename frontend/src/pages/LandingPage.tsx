import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Shield, Headphones, ArrowRight, ChevronRight, ChevronLeft, Timer, Star, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

const categories = [
  { name: 'All', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80' },
  { name: 'Mobiles', img: 'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?w=200&q=80' },
  { name: 'Fashion', img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=80' },
  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=200&q=80' },
  { name: 'Home', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80' },
  { name: 'Beauty', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80' },
  { name: 'Appliances', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200&q=80' },
  { name: 'Toys', img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200&q=80' },
  { name: 'Sports', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&q=80' },
  { name: 'Furniture', img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=200&q=80' },
  { name: 'Groceries', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
];

const banners = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80",
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&q=80",
  "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1600&q=80"
];

export default function LandingPage() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const { data: productsData } = useQuery({
    queryKey: ['products', 'landing'],
    queryFn: async () => {
      const res = await api.get('/products?limit=20');
      return res.data;
    }
  });

  const products = productsData?.products || [];
  const dealOfTheDay = products.filter((p: any) => p.discount > 0).slice(0, 6);
  const bestSellers = products.slice(6, 12);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 pb-10">
      
      {/* Category Circles (Flipkart Style) */}
      <div className="bg-white shadow-sm mb-4">
        <div className="max-w-[1600px] mx-auto px-4 py-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between gap-6 md:justify-center md:gap-12 min-w-max">
            {categories.map((cat, idx) => (
              <Link to={cat.name === 'All' ? '/products' : `/products?category=${encodeURIComponent(cat.name)}`} key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 group-hover:shadow-md transition-shadow">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto w-full px-2 sm:px-4 flex flex-col gap-4 sm:gap-6">
        
        {/* Hero Carousel */}
        <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-slate-200 rounded-lg overflow-hidden group">
          {banners.map((banner, idx) => (
            <div 
              key={idx} 
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img src={banner} alt="Promotional Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent flex items-center">
                <div className="px-10 md:px-20 max-w-2xl">
                  <span className="inline-block px-3 py-1 bg-amber-500 text-slate-900 font-bold text-xs uppercase tracking-wider rounded-full mb-4">Big Sale</span>
                  <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight">Mega Markdown Event</h2>
                  <p className="text-slate-200 text-lg md:text-xl mb-8 hidden md:block">Up to 80% off on top electronics, fashion, and home appliances. Unmissable deals!</p>
                  <Link to="/products" className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-brand-500/50 transition-all text-lg">
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
          <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white/30 hover:bg-white text-white hover:text-slate-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 bg-white/30 hover:bg-white text-white hover:text-slate-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 backdrop-blur-sm">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Bento Promotional Grid (Amazon Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col">
            <h3 className="font-bold text-xl text-slate-900 mb-4">Upgrade your tech</h3>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <Link to="/products?category=Mobiles" className="group"><img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80" alt="Phones" className="w-full aspect-square object-cover rounded mb-1" /><span className="text-xs text-slate-600 group-hover:text-brand-600">Smartphones</span></Link>
              <Link to="/products?category=Laptops" className="group"><img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80" alt="Laptops" className="w-full aspect-square object-cover rounded mb-1" /><span className="text-xs text-slate-600 group-hover:text-brand-600">Laptops</span></Link>
              <Link to="/products?category=Audio" className="group"><img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80" alt="Audio" className="w-full aspect-square object-cover rounded mb-1" /><span className="text-xs text-slate-600 group-hover:text-brand-600">Headphones</span></Link>
              <Link to="/products?category=Watches" className="group"><img src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&q=80" alt="Wearables" className="w-full aspect-square object-cover rounded mb-1" /><span className="text-xs text-slate-600 group-hover:text-brand-600">Smartwatches</span></Link>
            </div>
            <Link to="/products" className="text-brand-600 text-sm font-semibold mt-4 hover:underline">See more</Link>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col">
            <h3 className="font-bold text-xl text-slate-900 mb-4">Revamp your home</h3>
            <Link to="/products?category=Furniture" className="flex-1 mb-4 overflow-hidden rounded group">
              <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80" alt="Home" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </Link>
            <Link to="/products?category=Furniture" className="text-brand-600 text-sm font-semibold hover:underline">Explore Furniture</Link>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col">
            <h3 className="font-bold text-xl text-slate-900 mb-4">Fashion Top Trends</h3>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <Link to="/products?category=Fashion" className="group"><img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80" alt="Men" className="w-full aspect-square object-cover rounded mb-1" /><span className="text-xs text-slate-600 group-hover:text-brand-600">Men's</span></Link>
              <Link to="/products?category=Fashion" className="group"><img src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&q=80" alt="Women" className="w-full aspect-square object-cover rounded mb-1" /><span className="text-xs text-slate-600 group-hover:text-brand-600">Women's</span></Link>
              <Link to="/products?category=Shoes" className="group"><img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80" alt="Shoes" className="w-full aspect-square object-cover rounded mb-1" /><span className="text-xs text-slate-600 group-hover:text-brand-600">Footwear</span></Link>
              <Link to="/products?category=Bags" className="group"><img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80" alt="Bags" className="w-full aspect-square object-cover rounded mb-1" /><span className="text-xs text-slate-600 group-hover:text-brand-600">Bags & Luggage</span></Link>
            </div>
            <Link to="/products?category=Fashion" className="text-brand-600 text-sm font-semibold mt-4 hover:underline">Shop clothing</Link>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col">
            <div className="bg-slate-900 rounded-lg p-6 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
              <h3 className="font-bold text-2xl text-white mb-2 z-10">Sign in for your best experience</h3>
              <p className="text-slate-400 text-sm mb-6 z-10">Manage orders, track shipping, and get exclusive recommendations.</p>
              <Link to="/login" className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2 w-full rounded shadow-sm transition-colors z-10 mb-2">Sign in securely</Link>
              <Link to="/register" className="text-brand-400 hover:text-brand-300 text-sm font-semibold z-10">New to Stockroom? Start here.</Link>
            </div>
          </div>
        </div>

        {/* Deal of the Day (Horizontal Scroll) */}
        {dealOfTheDay.length > 0 && (
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Deal of the Day <span className="bg-danger text-white text-xs px-2 py-1 rounded animate-pulse">LIVE</span>
              </h2>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium ml-auto">
                <Timer size={18} className="text-brand-600" /> Ends in: <span className="text-danger font-bold">12:45:00</span>
              </div>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
              {dealOfTheDay.map((product: any) => (
                <Link to={`/products/${product.id}`} key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[240px] sm:w-[240px] flex flex-col group snap-start">
                  <div className="w-full aspect-square bg-slate-50 rounded-lg overflow-hidden mb-3 relative">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {product.discount > 0 && (
                      <span className="absolute top-2 left-2 bg-danger text-white text-xs font-bold px-2 py-1 rounded">{product.discount}% OFF</span>
                    )}
                  </div>
                  <h4 className="font-medium text-slate-900 line-clamp-2 mb-1 group-hover:text-brand-600">{product.name}</h4>
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs text-slate-600 font-semibold">{product.avgRating?.toFixed(1) || '4.5'}</span>
                    <span className="text-xs text-slate-400">({product.reviewsCount || Math.floor(Math.random() * 500)})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
                    <span className="text-xs text-slate-400 line-through">${(product.price / (1 - product.discount / 100)).toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Best Sellers (Horizontal Scroll) */}
        {bestSellers.length > 0 && (
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Best Sellers in Electronics & More</h2>
              <Link to="/products" className="text-brand-600 text-sm font-semibold hover:underline">Shop all</Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
              {bestSellers.map((product: any) => (
                <Link to={`/products/${product.id}`} key={product.id} className="min-w-[200px] w-[200px] sm:min-w-[240px] sm:w-[240px] flex flex-col group snap-start">
                  <div className="w-full aspect-square bg-slate-50 rounded-lg overflow-hidden mb-3">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="font-medium text-slate-900 line-clamp-2 mb-1 group-hover:text-brand-600">{product.name}</h4>
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs text-slate-600 font-semibold">{product.avgRating?.toFixed(1) || '4.8'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-lg font-bold text-slate-900">${product.price.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Value Proposition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-start gap-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-full"><Truck size={24} /></div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Fast & Free Delivery</h4>
              <p className="text-sm text-slate-500">Free shipping on millions of items for Prime members.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full"><Shield size={24} /></div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Safe & Secure Payments</h4>
              <p className="text-sm text-slate-500">100% secure payment gateway powered by industry leaders.</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><Headphones size={24} /></div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">24/7 Customer Service</h4>
              <p className="text-sm text-slate-500">We're here to help you anytime, anywhere.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
