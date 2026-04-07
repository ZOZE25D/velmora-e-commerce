import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import SupplierDashboard from './pages/SupplierDashboard';
import MyOrders from './pages/MyOrders';
import MyFavorites from './pages/MyFavorites';
import ProfilePage from './pages/ProfilePage';
import OurStory from './pages/OurStory';
import Sustainability from './pages/Sustainability';
import Careers from './pages/Careers';
import Press from './pages/Press';
import Contact from './pages/Contact';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import SizeGuide from './pages/SizeGuide';
import FAQ from './pages/FAQ';
import OrderTracking from './pages/OrderTracking';
import BrandIdentity from './pages/BrandIdentity';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminLayout from './components/admin/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSubscribers from './pages/admin/AdminSubscribers';
import AdminApplications from './pages/admin/AdminApplications';
import AdminMessages from './pages/admin/AdminMessages';
import AdminReturns from './pages/admin/AdminReturns';
import AdminSettings from './pages/admin/AdminSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminLogin from './pages/admin/AdminLogin';
import MaintenancePage from './pages/MaintenancePage';
import ScrollToTop from './components/ui/ScrollToTop';
import { AppProvider, useAppContext } from './context/AppContext';
import { SeedService } from './services/SeedService';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

function AppRoutes() {
  const { settings, isAdmin, isAuthReady, user } = useAppContext();
  const location = useLocation();

  useEffect(() => {
    if (isAuthReady && user) {
      SeedService.seedProductsIfNeeded(user);
    }
  }, [isAuthReady, user]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-velmora-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-velmora-900 dark:text-velmora-100 mx-auto mb-4" />
          <p className="text-velmora-600 dark:text-velmora-400 font-medium animate-pulse">Loading Velmora...</p>
        </div>
      </div>
    );
  }

  // If maintenance mode is on and user is NOT an admin, show maintenance page
  // We allow admins to see the site so they can fix things or turn it off
  // CRITICAL: We NEVER show maintenance page for admin paths to ensure access
  const isAdminPath = location.pathname.startsWith('/admin');
  
  if (settings.maintenanceMode && !isAdmin && !isAdminPath) {
    // Only redirect if we are sure the user is NOT an admin
    // If auth is still loading (isAuthReady is false), the loader above handles it
    return (
      <Routes>
        <Route path="*" element={<MaintenancePage />} />
      </Routes>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="category/:category" element={<CategoryPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="favorites" element={<MyFavorites />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="our-story" element={<OurStory />} />
          <Route path="sustainability" element={<Sustainability />} />
          <Route path="careers" element={<Careers />} />
          <Route path="press" element={<Press />} />
          <Route path="contact" element={<Contact />} />
          <Route path="shipping" element={<Shipping />} />
          <Route path="returns" element={<Returns />} />
          <Route path="size-guide" element={<SizeGuide />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="tracking" element={<OrderTracking />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="supplier" element={<SupplierDashboard />} />
          {/* Fallback for other links */}
          <Route path="*" element={<CategoryPage />} />
        </Route>

        {/* Admin Routes - Outside main Layout */}
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="subscribers" element={<AdminSubscribers />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppProvider>
        <Toaster position="top-center" richColors />
        <AppRoutes />
      </AppProvider>
    </Router>
  );
}
