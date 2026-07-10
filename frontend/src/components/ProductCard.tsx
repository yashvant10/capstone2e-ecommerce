import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';

export default function ProductCard({ product }: { product: any }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/cart/items', { productId: product.id, quantity: 1 });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.name} added to cart`);
    },
    onError: (err: any) => {
      if (err.response?.status === 401) {
        useAuthStore.getState().logout();
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error('Failed to add to cart');
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
      }
    }
  });

  const avgRating = product.avgRating || 4.5;
  const originalPrice = product.price / (1 - (product.discount || 0) / 100);

  return (
    <div className="group relative bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center p-4">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={product.imageUrl || 'https://placehold.co/600x600?text=No+Image'}
            alt={product.name}
            className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x600?text=Error';
            }}
          />
        </Link>
        
        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            if (!user) return toast.info('Please log in first');
            addToWishlistMutation.mutate();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white text-slate-400 hover:text-danger shadow border border-slate-100 transition-colors z-10"
          title="Add to Wishlist"
        >
          <Heart size={16} />
        </button>

        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-danger text-white text-[10px] font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        
        {product.brand && (
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 block">
            {product.brand}
          </span>
        )}
        
        <Link to={`/products/${product.id}`} className="block group-hover:text-brand-600 transition-colors mb-1 flex-1">
          <h3 className="font-medium text-slate-900 text-sm md:text-base line-clamp-2 leading-tight">{product.name}</h3>
        </Link>
        
        <div className="flex items-center gap-1 mb-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
          ))}
          <span className="text-xs text-brand-600 hover:underline cursor-pointer ml-1">{product.reviewsCount || Math.floor(Math.random() * 200)}</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-2">
          10K+ bought in past month
        </div>
        
        <div className="flex flex-col mt-auto pt-2">
          <div className="flex items-end gap-1.5 mb-1">
            <span className="text-xl font-bold text-slate-900">
              <span className="text-xs align-top">$</span>
              {product.price.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-slate-500 line-through mb-1">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-[11px] text-slate-600 mb-2">
            <CheckCircle size={12} className="text-emerald-500" />
            <span className="font-bold">Stockroom</span> <span className="text-brand-600 font-bold">Premium</span> Delivery
          </div>

          <button 
            onClick={() => {
              if (!user) {
                toast.info('Please login to add items to cart');
                return;
              }
              addToCartMutation.mutate();
            }}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 text-slate-900 py-1.5 rounded-full text-xs font-bold hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addToCartMutation.isPending ? (
              <span className="w-3 h-3 border border-slate-900 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <ShoppingCart size={14} />
            )}
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
