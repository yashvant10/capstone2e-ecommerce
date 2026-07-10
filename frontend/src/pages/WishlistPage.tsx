import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, X } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';
import EmptyState from '../components/EmptyState';

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/wishlist');
      return res.data;
    }
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/wishlist/items/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    }
  });

  const addToCart = useMutation({
    mutationFn: async (productId: string) => {
      await api.post('/cart/items', { productId, quantity: 1 });
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      removeFromWishlist.mutate(productId);
      toast.success('Moved to cart!');
    }
  });

  if (isLoading) return <div className="page-container py-12"><div className="shimmer h-96 w-full rounded-3xl"></div></div>;

  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-rose-50 p-3 rounded-2xl text-rose-500">
          <Heart size={28} className="fill-rose-200" />
        </div>
        <h1 className="font-display font-bold text-4xl text-slate-900">My Wishlist</h1>
        {wishlist?.items?.length > 0 && (
          <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-sm">
            {wishlist.items.length} Items
          </span>
        )}
      </div>

      {!wishlist?.items?.length ? (
        <EmptyState 
          icon={<Heart className="fill-slate-100 text-slate-300" />} 
          title="Your wishlist is empty" 
          description="Save items you love and come back to them later. Your future self will thank you."
          actionLabel="Explore Products"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 animate-fade-in-up">
          {wishlist.items.map((item: any) => (
            <div key={item.id} className="card overflow-hidden flex flex-col group relative hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <Link to={`/products/${item.productId}`}>
                  <img 
                    src={item.product.imageUrl || `https://source.unsplash.com/400x400/?product,${item.product.name.split(' ')[0]}`}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                </Link>
                <button 
                  onClick={() => removeFromWishlist.mutate(item.productId)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-danger hover:bg-white shadow-sm transition-colors z-10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                  title="Remove from wishlist"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <Link to={`/products/${item.productId}`} className="font-display font-semibold text-lg text-slate-900 hover:text-brand-600 mb-1 line-clamp-1 transition-colors">
                  {item.product.name}
                </Link>
                <div className="font-bold text-xl text-slate-900 mb-6">${item.product.price.toFixed(2)}</div>
                
                <button 
                  onClick={() => addToCart.mutate(item.productId)}
                  disabled={item.product.stock === 0 || addToCart.isPending}
                  className="mt-auto w-full btn-primary py-2.5 rounded-xl justify-center group/btn shadow-md disabled:opacity-50"
                >
                  <ShoppingCart size={18} className="group-hover/btn:scale-110 transition-transform" />
                  {item.product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
