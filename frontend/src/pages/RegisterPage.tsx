import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create user in Supabase
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { name }
        }
      });
      if (error) throw error;
      if (!data.session) {
        toast.info("Please check your email to verify your account.");
        navigate('/login');
        return;
      }
      
      // 2. Exchange Supabase token for our internal JWT
      const res = await api.post('/auth/supabase-login', { accessToken: data.session.access_token, name });
      
      setAuth(res.data.user, res.data.accessToken);
      toast.success(`Account created successfully! Welcome, ${res.data.user.name}.`);
      navigate('/products');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: { redirectTo: window.location.origin + '/products' }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'Google Login failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-dark-gradient flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[100px] animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] animate-float stagger-2"></div>
        
        <Link to="/" className="relative z-10 flex items-center gap-3 text-white">
          <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
            <ShoppingBag size={24} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">
            Stockroom
          </span>
        </Link>
        
        <div className="relative z-10 max-w-md">
          <h1 className="font-display font-bold text-5xl text-white leading-tight mb-6 animate-fade-in-up">
            Join the premium experience.
          </h1>
          <p className="text-slate-300 text-lg animate-fade-in-up stagger-1">
            Create an account today to unlock exclusive offers, personalized recommendations, and a seamless checkout process.
          </p>
          
          <div className="mt-12 space-y-6 animate-fade-in-up stagger-2">
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><User size={18} /></div>
              <span>Personalized profile and recommendations</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20"><ShoppingBag size={18} /></div>
              <span>Faster checkout with saved addresses</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-slate-400 text-sm animate-fade-in-up stagger-3">
          &copy; {new Date().getFullYear()} Stockroom. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-slate-900">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <ShoppingBag size={20} />
          </div>
          <span className="font-display font-bold text-xl">Stockroom</span>
        </Link>

        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-10 text-center lg:text-left mt-12 lg:mt-0">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-900 mb-3">Create Account</h2>
            <p className="text-slate-500 text-lg">Sign up in seconds and start shopping.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="text"
                  required
                  className="input-field pl-11"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  className="input-field pl-11"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="input-field pl-11 pr-11"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Must be at least 6 characters long.</p>
            </div>
            
            <button
              type="submit"
              disabled={loading || !email || !password || !name}
              className="w-full btn-primary py-4 text-lg justify-between px-6 mt-4"
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
              <ArrowRight size={20} className={loading ? "animate-pulse" : ""} />
            </button>
            
            <div className="relative flex items-center py-5">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">Or sign up with</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full btn-secondary py-4 text-lg flex items-center justify-center gap-3 px-6"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline underline-offset-4 transition-all">
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
