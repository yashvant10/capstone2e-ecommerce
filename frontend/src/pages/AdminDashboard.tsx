import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { toast } from 'react-toastify';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShoppingBag, Package, DollarSign, LayoutDashboard, Ticket, LogOut, Menu, X, Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { Link } from 'react-router-dom';
import { TableRowSkeleton } from '../components/Skeleton';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard');
      return res.data;
    }
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const res = await api.get('/admin/orders');
      return res.data.data;
    }
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.put(`/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    }
  });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-950 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-brand-600 text-white p-2 rounded-lg">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Stockroom</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 mb-6">
          <div className="bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-widest py-1.5 px-3 rounded-full inline-block">
            Admin Portal
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === item.id 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 m-4 rounded-xl bg-slate-900">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{user?.name}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-danger hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-900 p-2 -ml-2"
            >
              <Menu size={24} />
            </button>
            <h1 className="font-display font-bold text-2xl text-slate-900 hidden sm:block capitalize">
              {activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="btn-secondary py-2 text-sm hidden sm:flex">View Storefront</Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          {dashLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && dashboard && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="Total Revenue" value={`$${dashboard.metrics?.totalRevenue?.toFixed(2) || '0.00'}`} icon={<DollarSign size={24} />} color="text-emerald-600" bg="bg-emerald-100" />
                    <MetricCard title="Total Orders" value={dashboard.metrics?.totalOrders || 0} icon={<Package size={24} />} color="text-brand-600" bg="bg-brand-100" />
                    <MetricCard title="Total Products" value={dashboard.metrics?.totalProducts || 0} icon={<ShoppingBag size={24} />} color="text-purple-600" bg="bg-purple-100" />
                    <MetricCard title="Total Users" value={dashboard.metrics?.totalUsers || 0} icon={<Users size={24} />} color="text-amber-600" bg="bg-amber-100" />
                  </div>

                  <div className="card p-6 border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-display font-bold text-xl text-slate-900">Revenue Overview (Last 7 Days)</h2>
                    </div>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboard.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                          <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px'}}
                            itemStyle={{color: '#0f172a', fontWeight: 'bold'}}
                            labelStyle={{color: '#64748b', marginBottom: '4px'}}
                          />
                          <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="card overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h2 className="font-display font-bold text-xl text-slate-900">Recent Orders</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Items</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {ordersLoading ? (
                          [...Array(5)].map((_, i) => <TableRowSkeleton key={i} />)
                        ) : orders?.length === 0 ? (
                          <tr><td colSpan={6} className="p-8 text-center text-slate-500">No orders found.</td></tr>
                        ) : orders?.map((order: any) => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 font-mono text-xs font-medium text-slate-700">#{order.id.substring(0, 8)}</td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">{order.user.name}</div>
                              <div className="text-xs text-slate-500">{order.user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-slate-600 space-y-1">
                                {order.items?.map((item: any) => (
                                  <div key={item.id} className="truncate max-w-[200px]">
                                    {item.quantity}x {item.product.name}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">${order.total.toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <Badge variant={
                                order.status === 'DELIVERED' ? 'success' :
                                order.status === 'CANCELLED' ? 'danger' :
                                order.status === 'SHIPPED' ? 'info' :
                                order.status === 'PROCESSING' ? 'info' : 'warning'
                              }>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <select 
                                value={order.status}
                                onChange={(e) => updateOrderStatus.mutate({ id: order.id, status: e.target.value })}
                                disabled={updateOrderStatus.isPending}
                                className="text-sm font-medium border border-slate-200 rounded-lg py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 hover:border-slate-300 transition-colors shadow-sm"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button className="btn-primary" onClick={() => toast.info('Product creation UI to be fully connected')}>
                      <Plus size={18} /> Add New Product
                    </button>
                  </div>
                  
                  <EmptyState 
                    icon={<ShoppingBag />} 
                    title="Products Management" 
                    description="The product management API is ready. Full CRUD UI is planned for the next iteration. For now, products can be managed via the database directly or Prisma Studio."
                  />
                </div>
              )}

              {/* COUPONS TAB */}
              {activeTab === 'coupons' && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button className="btn-primary" onClick={() => toast.info('Coupon creation UI to be fully connected')}>
                      <Ticket size={18} /> Add New Coupon
                    </button>
                  </div>
                  
                  <EmptyState 
                    icon={<Ticket />} 
                    title="Coupons Management" 
                    description="The coupon management API is ready. Full CRUD UI is planned for the next iteration. Discounts can be managed via Prisma Studio."
                  />
                </div>
              )}

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, color, bg }: any) {
  return (
    <div className="card p-6 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-2xl ${color} ${bg}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-500 mb-1">{title}</div>
        <div className="font-display font-bold text-3xl text-slate-900">{value}</div>
      </div>
    </div>
  );
}
