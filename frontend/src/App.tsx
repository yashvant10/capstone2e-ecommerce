import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';

// Layout wrapper to conditionally show Navbar/Footer
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isAdminPage = location.pathname.startsWith('/admin');
  
  const hideHeaderFooter = isAuthPage || isAdminPage;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {!hideHeaderFooter && <Navbar />}
      
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
      
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <h1 className="text-9xl font-display font-bold text-slate-200 mb-4 tracking-tighter">404</h1>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Page not found</h2>
              <p className="text-slate-500 mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
              <a href="/" className="btn-primary">Return Home</a>
            </div>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
