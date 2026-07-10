import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, ShieldCheck, MapPin } from 'lucide-react';
import api from '../api/client';
import { toast } from 'react-toastify';
import EmptyState from '../components/EmptyState';

export default function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await api.get('/cart');
      return res.data;
    }
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity <= 0) {
        await api.delete(`/cart/items/${id}`);
      } else {
        await api.put(`/cart/items/${id}`, { quantity });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('Failed to update cart')
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cart/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item removed');
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const orderItems = cart.items.map((i: any) => ({
        productId: i.productId,
        quantity: i.quantity
      }));
      // 1. Create Order in Backend
      const res = await api.post('/orders', {
        items: orderItems,
        deliveryAddress: address,
        couponCode: couponCode || undefined
      });
      const order = res.data;

      if (paymentMethod === 'COD') {
        return { order, rzpOrder: null, isCOD: true };
      }

      // 2. Create Razorpay Order
      const rzpRes = await api.post('/payments/create-order', { orderId: order.id });
      return { order, rzpOrder: rzpRes.data, isCOD: false };
    },
    onSuccess: async ({ order, rzpOrder, isCOD }) => {
      if (isCOD) {
        toast.success('Your order is successfully placed via Cash on Delivery!');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        navigate('/orders');
        return;
      }

      // 3. Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'Stockroom Premium',
          description: `Order #${order.id}`,
          order_id: rzpOrder.id,
          handler: async function (response: any) {
            try {
              // 4. Verify Payment on Backend
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.id
              });
              toast.success('Payment successful! Your order is successfully placed.');
              queryClient.invalidateQueries({ queryKey: ['cart'] });
              navigate('/orders');
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: 'Customer',
            email: 'customer@stockroom.com'
          },
          theme: {
            color: '#6366f1'
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast.error(response.error.description || 'Payment Failed');
        });
        rzp.open();
      };
      script.onerror = () => {
        toast.error('Failed to load Razorpay SDK');
      };
      document.body.appendChild(script);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create payment order');
    }
  });

  if (isLoading) {
    return <div className="page-container py-12"><div className="shimmer h-96 w-full rounded-3xl"></div></div>;
  }

  const subtotal = cart?.items?.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0) || 0;
  const shipping = subtotal > 100 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <div className="page-container py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-brand-50 p-3 rounded-2xl text-brand-600">
          <ShoppingBag size={28} />
        </div>
        <h1 className="font-display font-bold text-4xl text-slate-900">Shopping Cart</h1>
        {cart?.items?.length > 0 && (
          <span className="bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full text-sm">
            {cart.items.length} Items
          </span>
        )}
      </div>

      {!cart?.items?.length ? (
        <EmptyState 
          icon={<ShoppingBag />} 
          title="Your cart is empty" 
          description="Looks like you haven't added anything to your cart yet. Discover our premium collection and find something you love."
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-start">
          
          {/* Cart Items List */}
          <div className="flex-1 w-full space-y-6">
            {cart.items.map((item: any) => (
              <div key={item.id} className="card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group">
                <Link to={`/products/${item.productId}`} className="shrink-0 relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    <img 
                      src={item.product.imageUrl || 'https://placehold.co/400x400?text=No+Image'} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Error';
                      }}
                    />
                  </div>
                </Link>
                
                <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-slate-900 mb-1 line-clamp-2">
                      <Link to={`/products/${item.productId}`} className="hover:text-brand-600 transition-colors">
                        {item.product.name}
                      </Link>
                    </h3>
                    <div className="font-bold text-xl text-slate-900 mb-4">${item.product.price.toFixed(2)}</div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
                      <button 
                        onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity - 1 })} 
                        disabled={updateQuantity.isPending} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-semibold text-slate-900 text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })} 
                        disabled={updateQuantity.isPending || item.quantity >= item.product.stock} 
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="font-bold text-lg text-slate-900 hidden sm:block">
                        Total: ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                      <button 
                        onClick={() => removeMutation.mutate(item.id)} 
                        className="p-2 text-slate-400 hover:text-danger hover:bg-red-50 rounded-xl transition-all"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sticky Sidebar */}
          <div className="w-full lg:w-[400px] shrink-0 sticky top-28">
            <div className="card p-6 md:p-8 bg-gradient-to-b from-white to-slate-50 shadow-lg shadow-slate-200/50">
              <h2 className="font-display font-bold text-2xl text-slate-900 mb-6 border-b border-slate-100 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">{shipping === 0 ? <span className="text-emerald-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Coupon code" 
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value)} 
                    className="input-field py-2.5 text-sm" 
                  />
                  <button className="btn-secondary py-2.5 px-4 text-sm whitespace-nowrap">Apply</button>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-brand-500" /> Delivery Address
                </label>
                <textarea 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  className="input-field text-sm min-h-[80px] resize-none"
                  placeholder="Enter full address..."
                />
              </div>

              <div className="border-t border-slate-200 border-dashed pt-6 mb-6 flex justify-between items-end">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Total Amount</div>
                  <div className="text-xs text-slate-400">Including all taxes</div>
                </div>
                <span className="font-display font-bold text-3xl text-slate-900">${total.toFixed(2)}</span>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-3">Payment Method</label>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'RAZORPAY' ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 hover:border-brand-300'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="RAZORPAY" 
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span className="font-medium text-slate-900 text-sm">Pay Online (Razorpay)</span>
                  </label>
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 hover:border-brand-300'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD" 
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span className="font-medium text-slate-900 text-sm">Cash on Delivery (COD)</span>
                  </label>
                </div>
              </div>

              <button 
                onClick={() => checkoutMutation.mutate()} 
                disabled={checkoutMutation.isPending || !address.trim()} 
                className="w-full btn-primary py-4 text-lg justify-between px-6 shadow-brand-500/30 shadow-lg disabled:opacity-50"
              >
                <span>{checkoutMutation.isPending ? 'Processing...' : (paymentMethod === 'COD' ? 'Book Now' : 'Checkout Securely')}</span>
                <ArrowRight size={20} className={checkoutMutation.isPending ? "animate-pulse" : ""} />
              </button>

              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={16} /> Payments securely processed by Razorpay
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
