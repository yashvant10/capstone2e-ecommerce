import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Truck, CheckCircle, CreditCard, Clock, ChevronRight } from 'lucide-react';
import api from '../api/client';
import { format } from 'date-fns';
import EmptyState from '../components/EmptyState';
import { OrderCardSkeleton } from '../components/Skeleton';
import Badge from '../components/Badge';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="page-container py-10 max-w-4xl">
        <div className="space-y-6">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <Badge variant="success">Delivered</Badge>;
      case 'SHIPPED': return <Badge variant="info">Shipped</Badge>;
      case 'PROCESSING': return <Badge variant="info">Processing</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Cancelled</Badge>;
      default: return <Badge variant="warning">{status}</Badge>;
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  return (
    <div className="page-container py-10 max-w-4xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-brand-50 p-3 rounded-2xl text-brand-600">
          <Package size={28} />
        </div>
        <h1 className="font-display font-bold text-4xl text-slate-900">Order History</h1>
      </div>

      {!orders?.length ? (
        <EmptyState 
          icon={<Package />} 
          title="No orders yet" 
          description="You haven't placed any orders yet. Start exploring our premium collection today."
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      ) : (
        <div className="space-y-8 animate-fade-in-up">
          {orders.map((order: any) => {
            const step = getStatusStep(order.status);
            
            return (
              <div key={order.id} className="card overflow-hidden">
                {/* Order Header */}
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date Placed</div>
                      <div className="font-medium text-slate-900">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Amount</div>
                      <div className="font-medium text-slate-900">${order.total.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Order Number</div>
                      <div className="font-mono text-sm text-slate-900">#{order.id.substring(0, 8)}</div>
                    </div>
                  </div>
                  
                  <Link to="#" className="btn-secondary py-2 px-4 text-sm group">
                    View Invoice <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                {/* Order Status Progress */}
                {step > 0 && (
                  <div className="px-6 pt-8 pb-4">
                    <div className="relative">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-500 transition-all duration-1000"
                          style={{ width: `${((step - 1) / 3) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="relative flex justify-between">
                        {['Placed', 'Processing', 'Shipped', 'Delivered'].map((label, idx) => {
                          const isCompleted = step > idx;
                          const isCurrent = step === idx + 1;
                          
                          return (
                            <div key={label} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-colors ${
                                isCompleted ? 'bg-brand-500 text-white' : 
                                isCurrent ? 'bg-brand-100 text-brand-600 border-brand-50' : 
                                'bg-slate-200 text-slate-400'
                              }`}>
                                {isCompleted ? <CheckCircle size={14} /> : 
                                 idx === 0 ? <Package size={14} /> :
                                 idx === 1 ? <Clock size={14} /> :
                                 idx === 2 ? <Truck size={14} /> :
                                 <CheckCircle size={14} />}
                              </div>
                              <span className={`mt-2 text-xs font-semibold ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                                {label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Order Body */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-700">Status:</span>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <CreditCard size={16} className={order.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-slate-400'} />
                      <span className={order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-slate-600'}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex gap-4 group">
                        <Link to={`/products/${item.productId}`} className="shrink-0 relative overflow-hidden rounded-xl border border-slate-100">
                          <img 
                            src={item.product.imageUrl || `https://source.unsplash.com/150x150/?product,${item.product.name.split(' ')[0]}`}
                            alt={item.product.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover bg-slate-50 group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80';
                            }}
                          />
                        </Link>
                        <div className="flex-1 min-w-0 py-1">
                          <h4 className="font-semibold text-slate-900 line-clamp-1 mb-1">
                            <Link to={`/products/${item.productId}`} className="hover:text-brand-600 transition-colors">
                              {item.product.name}
                            </Link>
                          </h4>
                          <div className="text-sm text-slate-500 mb-2">Qty: {item.quantity}</div>
                          <div className="font-medium text-slate-900">${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                        <div className="hidden sm:flex flex-col justify-center">
                          <Link to={`/products/${item.productId}`} className="btn-ghost text-xs py-1.5 px-3">Buy Again</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
