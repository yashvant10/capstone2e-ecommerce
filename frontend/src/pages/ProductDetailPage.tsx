import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { Star, Minus, Plus, ShoppingCart, Heart, Truck, Shield, MapPin, Share2, Lock } from 'lucide-react';
import Badge from '../components/Badge';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/cart/items', { productId: product.id, quantity });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.name} added to cart`);
    },
    onError: (err: any) => {
      // Auto logout if 401
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.error?.message || 'Failed to add to cart');
      }
    }
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await api.post('/wishlist/items', { productId: product.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist');
    },
    onError: (err: any) => {
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        navigate('/login');
      } else {
        toast.error('Failed to add to wishlist');
      }
    }
  });

  if (isLoading) {
    return <div className="max-w-[1600px] mx-auto p-8"><div className="shimmer h-96 w-full rounded-lg"></div></div>;
  }

  if (isError || !product) {
    return (
      <div className="max-w-[1600px] mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Product not found</h2>
        <button onClick={() => navigate('/products')} className="btn-primary py-2 px-6">Back to Shop</button>
      </div>
    );
  }

  const avgRating = product.avgRating || 4.5;
  const isOutOfStock = product.stock === 0;
  const originalPrice = product.discount > 0 ? (product.price / (1 - product.discount / 100)) : product.price;

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Category Breadcrumb */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 text-sm text-slate-500 hidden md:block">
        <div className="max-w-[1600px] mx-auto flex items-center gap-2">
          <Link to="/" className="hover:underline">Home</Link>
          <span>›</span>
          <Link to={`/products?category=${product.category?.name}`} className="hover:underline">{product.category?.name || 'General'}</Link>
          <span>›</span>
          <span className="text-slate-900 truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT: Image Gallery */}
          <div className="w-full lg:w-[40%] flex flex-col gap-4 sticky top-24">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden relative aspect-square group flex items-center justify-center p-4">
              <img 
                src={product.imageUrl || 'https://placehold.co/800x800?text=No+Image'}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-150 transition-transform duration-500 origin-center cursor-zoom-in"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x800?text=Error'; }}
              />
              <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow border border-slate-100 text-slate-500 hover:text-slate-900 z-10"><Share2 size={20} /></button>
            </div>
            {/* Thumbnails (Simulated) */}
            <div className="flex gap-2 justify-center">
              {[product.imageUrl, product.imageUrl, product.imageUrl].map((img, i) => (
                <div key={i} className={`w-16 h-16 border-2 rounded overflow-hidden cursor-pointer ${i === 0 ? 'border-brand-500' : 'border-slate-200 opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* CENTER: Product Details */}
          <div className="w-full lg:w-[40%] flex flex-col">
            <h1 className="font-display font-medium text-2xl lg:text-3xl text-slate-900 leading-tight mb-2">
              {product.brand && <span className="font-bold text-brand-700 mr-2">{product.brand}</span>}
              {product.name}
            </h1>
            
            <Link to="#" className="text-sm text-brand-600 hover:underline mb-2">Visit the {product.brand || 'Stockroom'} Store</Link>

            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 mr-1">{avgRating.toFixed(1)}</span>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
                ))}
              </div>
              <span className="text-brand-600 text-sm hover:underline cursor-pointer">{product.reviewsCount || Math.floor(Math.random() * 500) + 12} ratings</span>
            </div>

            <div className="mb-4">
              {product.discount > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-danger text-2xl font-light">-{product.discount}%</span>
                  <span className="text-3xl font-medium text-slate-900">
                    <span className="text-sm align-top">$</span>
                    {product.price.toFixed(2)}
                  </span>
                </div>
              )}
              {product.discount === 0 && (
                <span className="text-3xl font-medium text-slate-900">
                  <span className="text-sm align-top">$</span>
                  {product.price.toFixed(2)}
                </span>
              )}
              {product.discount > 0 && (
                <div className="text-sm text-slate-500">
                  Typical price: <span className="line-through">${originalPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="text-sm text-slate-600 font-bold mt-2">FREE Returns</div>
              <div className="text-sm text-slate-600 mt-1">All prices include tax.</div>
            </div>

            {/* Simulated Variations */}
            <div className="mb-6 pb-6 border-b border-slate-200">
              <div className="font-bold text-slate-900 mb-2">Color: <span className="font-normal text-slate-700">Default Signature</span></div>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-brand-500 cursor-pointer shadow-sm"></div>
                <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-transparent hover:border-slate-400 cursor-pointer shadow-sm"></div>
                <div className="w-10 h-10 rounded-full bg-red-900 border-2 border-transparent hover:border-slate-400 cursor-pointer shadow-sm"></div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-slate-900 mb-2">About this item</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                <li>Premium quality {product.category?.name?.toLowerCase() || 'item'} designed for everyday use.</li>
                <li>Manufactured by {product.brand || 'top global brands'} ensuring strict quality control and durability.</li>
                <li>Features a sleek, modern design that fits perfectly into any lifestyle or environment.</li>
                <li>Includes a comprehensive 2-year warranty covering all manufacturing defects.</li>
                <li>{product.description}</li>
              </ul>
            </div>
            
            <div className="flex items-center gap-4 text-brand-700 text-sm font-semibold hover:underline cursor-pointer mb-6">
              <Shield size={16} /> Report incorrect product information.
            </div>
          </div>

          {/* RIGHT: Buy Box */}
          <div className="w-full lg:w-[20%]">
            <div className="border border-slate-200 rounded-lg p-4 flex flex-col sticky top-24 bg-white shadow-sm">
              <span className="text-2xl font-medium text-slate-900 mb-2">
                <span className="text-sm align-top">$</span>
                {product.price.toFixed(2)}
              </span>
              
              <div className="text-sm text-slate-600 mb-4">
                FREE delivery <span className="font-bold text-slate-900">Tomorrow</span> if you order within 5 hrs 30 mins.
              </div>

              <div className="flex items-center gap-1 text-sm text-brand-700 hover:underline cursor-pointer mb-4">
                <MapPin size={16} /> Deliver to Select City
              </div>

              <h4 className={`text-lg font-bold mb-4 ${isOutOfStock ? 'text-danger' : 'text-emerald-700'}`}>
                {isOutOfStock ? 'Currently unavailable.' : 'In Stock'}
              </h4>

              {!isOutOfStock && (
                <div className="mb-4">
                  <label className="text-sm text-slate-700 font-semibold mb-1 block">Quantity:</label>
                  <select 
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded shadow-sm focus:ring-2 focus:ring-brand-500 outline-none"
                  >
                    {[...Array(Math.min(10, product.stock))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                onClick={() => {
                  if (!user) return toast.info('Please log in first');
                  addToCartMutation.mutate();
                }}
                disabled={isOutOfStock || addToCartMutation.isPending}
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold py-2.5 rounded-full shadow-sm mb-3 disabled:opacity-50 transition-colors"
              >
                {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
              </button>

              <button 
                onClick={() => {
                  if (!user) return toast.info('Please log in first');
                  addToCartMutation.mutate();
                  setTimeout(() => navigate('/cart'), 500);
                }}
                disabled={isOutOfStock || addToCartMutation.isPending}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-full shadow-sm mb-4 disabled:opacity-50 transition-colors"
              >
                Buy Now
              </button>

              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 justify-center">
                <Lock size={14} className="text-slate-400" /> Secure transaction
              </div>

              <div className="text-xs text-slate-600 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 mb-4">
                <span className="text-slate-500">Ships from</span>
                <span>Stockroom Fulfillment</span>
                <span className="text-slate-500">Sold by</span>
                <span>{product.brand || 'Stockroom Global'}</span>
                <span className="text-slate-500">Returns</span>
                <span className="text-brand-600 hover:underline cursor-pointer">Eligible for Return</span>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <button 
                  onClick={() => {
                    if (!user) return toast.info('Please log in first');
                    addToWishlistMutation.mutate();
                  }}
                  className="w-full text-left py-1.5 px-3 border border-slate-300 rounded shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Add to List
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
