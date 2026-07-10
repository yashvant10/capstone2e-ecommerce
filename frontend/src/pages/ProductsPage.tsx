import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Search, SlidersHorizontal, PackageSearch, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('newest');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      // Assuming a categories endpoint exists, if not this will silently fail which is fine
      try {
        const res = await api.get('/products/categories');
        return res.data;
      } catch {
        return [];
      }
    },
    retry: false
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', page, search, sort, category],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { page, search, sort, category, limit: 12 }
      });
      return res.data;
    }
  });

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-slate-900 mb-2 tracking-tight">The Collection</h1>
          <p className="text-lg text-slate-500">
            {data?.total ? `${data.total} products available` : 'Explore our premium products'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass p-4 rounded-2xl shadow-card border border-slate-100 mb-10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search our collection..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl border-none focus:ring-2 focus:ring-brand-500/20 transition-all text-sm font-medium text-slate-900"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <select
              className="w-full appearance-none py-3 pl-4 pr-10 bg-slate-50 hover:bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-brand-500/20 text-sm font-semibold text-slate-700 cursor-pointer transition-all outline-none"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <SlidersHorizontal size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 md:flex-none">
            <select
              className="w-full appearance-none py-3 pl-4 pr-10 bg-slate-50 hover:bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-brand-500/20 text-sm font-semibold text-slate-700 cursor-pointer transition-all outline-none"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <SlidersHorizontal size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState 
          icon={<PackageSearch />} 
          title="Failed to load products" 
          description="We encountered an error while fetching our collection. Please try again later."
        />
      ) : data?.data?.length === 0 ? (
        <EmptyState 
          icon={<Search />} 
          title="No products found" 
          description="We couldn't find anything matching your search criteria. Try adjusting your filters."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in-up">
            {data?.data.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {data?.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16 pb-8 border-t border-slate-100 pt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-inherit"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2 font-medium">
                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-500/20">{page}</span>
                <span className="text-slate-400 mx-1">of</span>
                <span className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600">{data?.totalPages}</span>
              </div>
              
              <button
                disabled={page === data?.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 hover:border-brand-500 hover:text-brand-600 transition-all disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-inherit"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
