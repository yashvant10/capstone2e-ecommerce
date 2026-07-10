import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import { User, MapPin, Plus, Trash2, Mail, Calendar, Shield } from 'lucide-react';
import Badge from '../components/Badge';
import { ProfileSkeleton } from '../components/Skeleton';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: '', city: '', state: '', country: '', zipCode: '', isDefault: false
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/profile');
      return res.data;
    }
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/profile/addresses', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setShowAddressForm(false);
      setAddressForm({ address: '', city: '', state: '', country: '', zipCode: '', isDefault: false });
      toast.success('Address added successfully');
    },
    onError: () => toast.error('Failed to add address')
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/profile/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Address deleted');
    }
  });

  if (isLoading) return <div className="page-container py-12 max-w-4xl"><ProfileSkeleton /></div>;

  return (
    <div className="page-container py-10 max-w-4xl">
      <h1 className="font-display font-bold text-3xl text-slate-900 mb-8">My Profile</h1>

      {/* User Info Card */}
      <div className="card p-8 mb-8 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gradient opacity-5 rounded-bl-full pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full bg-brand-gradient text-white flex items-center justify-center font-display font-bold text-5xl shadow-lg shadow-brand-500/30 shrink-0">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
              <h2 className="font-display font-bold text-3xl text-slate-900">{profile?.name}</h2>
              {profile?.role === 'ADMIN' && <Badge variant="info" className="w-fit mx-auto md:mx-0"><Shield size={12} className="mr-1 inline" /> Admin</Badge>}
            </div>
            
            <div className="space-y-3 mt-6 text-slate-600">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Mail size={18} className="text-slate-400" />
                <span className="font-medium">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Calendar size={18} className="text-slate-400" />
                <span>Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
          
          <div>
            <button className="btn-secondary whitespace-nowrap">Edit Profile</button>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="card p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-brand-50 p-2.5 rounded-xl text-brand-600">
              <MapPin size={24} />
            </div>
            <h2 className="font-display font-bold text-2xl text-slate-900">Saved Addresses</h2>
          </div>
          <button 
            onClick={() => setShowAddressForm(!showAddressForm)}
            className="btn-primary py-2 px-4 text-sm"
          >
            <Plus size={18} /> Add New Address
          </button>
        </div>

        {/* Add Address Form */}
        {showAddressForm && (
          <form 
            onSubmit={(e) => { e.preventDefault(); addAddressMutation.mutate(addressForm); }}
            className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200 animate-fade-in-up"
          >
            <h3 className="font-semibold text-slate-900 mb-4">Add a new delivery address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder="Street Address" className="input-field md:col-span-2" value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} />
              <input required type="text" placeholder="City" className="input-field" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
              <input required type="text" placeholder="State/Province" className="input-field" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
              <input required type="text" placeholder="Country" className="input-field" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} />
              <input required type="text" placeholder="ZIP / Postal Code" className="input-field" value={addressForm.zipCode} onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})} />
              
              <label className="flex items-center gap-3 font-medium text-slate-700 md:col-span-2 p-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors w-fit">
                <input 
                  type="checkbox" 
                  checked={addressForm.isDefault} 
                  onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} 
                  className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                Set as Default Address
              </label>
            </div>
            <div className="flex gap-4 pt-6 mt-4 border-t border-slate-200 border-dashed">
              <button type="submit" disabled={addAddressMutation.isPending} className="btn-primary">Save Address</button>
              <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        {/* Saved Addresses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile?.addresses?.length === 0 && !showAddressForm && (
            <div className="col-span-full py-8 text-center text-slate-500">
              No delivery addresses saved yet.
            </div>
          )}
          {profile?.addresses?.map((addr: any) => (
            <div key={addr.id} className="p-6 border border-slate-200 rounded-2xl hover:border-brand-300 hover:shadow-md transition-all group relative bg-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-lg">{addr.city}</span>
                  {addr.isDefault && <Badge variant="info" className="ml-2">Default</Badge>}
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteAddressMutation.mutate(addr.id)}
                    className="p-2 text-slate-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete address"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-slate-600">
                <p className="leading-relaxed">{addr.address}</p>
                <p>{addr.state} — {addr.zipCode}</p>
                <p className="font-medium text-slate-500 mt-2">{addr.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
