import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from '../ui/CartDrawer';
import SearchOverlay from '../ui/SearchOverlay';
import AuthModal from '../ui/AuthModal';
import { useAppContext } from '../../context/AppContext';
import MaintenancePage from '../ui/MaintenancePage';

import { useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
  const { settings, isAdmin } = useAppContext();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (settings.maintenanceMode && !isAdmin && !isAdminRoute) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <SearchOverlay />
      <AuthModal />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
