import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Store,
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight,
  CreditCard,
  Loader2,
  MessageSquare,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Moon,
  Sun,
  Languages,
  Mail,
  Briefcase,
  RefreshCcw
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { FirestoreService } from '../../services/FirestoreService';
import { orderBy, limit } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const AdminLayout: React.FC = () => {
  const { isAdmin, logout, user, isAuthReady, formatPrice, theme, toggleTheme, language, setLanguage, settings } = useAppContext();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    products: any[];
    orders: any[];
    users: any[];
  }>({ products: [], orders: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    // Apply theme class 
  }, [theme]);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults({ products: [], orders: [], users: [] });
        setShowSearchResults(false);
        return;
      }

      setIsSearching(true);
      setShowSearchResults(true);
      try {
        const query = searchQuery.toLowerCase();
        
        // Fetch data for searching
        const [products, orders, users] = await Promise.all([
          FirestoreService.getCollection('products'),
          FirestoreService.getCollection('orders'),
          FirestoreService.getCollection('users')
        ]);

        const filteredProducts = (products || []).filter((p: any) => 
          p.name?.toLowerCase().includes(query) || 
          p.category?.toLowerCase().includes(query)
        ).slice(0, 5);

        const filteredOrders = (orders || []).filter((o: any) => 
          o.displayId?.toLowerCase().includes(query) || 
          o.id?.toLowerCase().includes(query) ||
          o.shippingAddress?.name?.toLowerCase().includes(query)
        ).slice(0, 5);

        const filteredUsers = (users || []).filter((u: any) => 
          u.name?.toLowerCase().includes(query) || 
          u.email?.toLowerCase().includes(query)
        ).slice(0, 5);

        setSearchResults({
          products: filteredProducts,
          orders: filteredOrders,
          users: filteredUsers
        });
      } catch (error) {
        console.error('Global search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isAuthReady && !isAdmin) {
      if (!user) {
        navigate('/admin/login');
      }
    }
  }, [isAuthReady, isAdmin, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      const q = [
        orderBy('createdAt', 'desc'),
        limit(10)
      ];

      const unsubscribe = FirestoreService.subscribeToCollection('notifications', (data) => {
        setNotifications(data);
      }, q);

      return () => unsubscribe();
    }
  }, [isAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await FirestoreService.markNotificationAsRead(id);
  };

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.link) navigate(notif.link);
    setIsNotificationsOpen(false);
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-velmora-950">
        <Loader2 className="w-10 h-10 animate-spin text-velmora-900" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-40 pb-24 text-center bg-white dark:bg-velmora-950 min-h-screen">
        <h2 className="text-2xl font-display font-bold mb-4 dark:text-white">Access Denied</h2>
        <p className="dark:text-velmora-400">You do not have permission to view this page.</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 bg-velmora-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 transition-all"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/products', icon: Package, label: t('admin.products') },
    { path: '/admin/orders', icon: ShoppingBag, label: t('Orders') },
    { path: '/admin/users', icon: Users, label: t('admin.users') },
    { path: '/admin/suppliers', icon: Store, label: t('admin.suppliers') },
    { path: '/admin/payments', icon: CreditCard, label: t('admin.payments') },
    { path: '/admin/returns', icon: RefreshCcw, label: 'Returns' },
    { path: '/admin/subscribers', icon: Mail, label: t('admin.subscribers') },
    { path: '/admin/applications', icon: Briefcase, label: t('admin.applications') },
    { path: '/admin/messages', icon: MessageSquare, label: t('admin.messages') },
    { path: '/admin/settings', icon: Settings, label: t('admin.settings') },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-velmora-50 dark:bg-velmora-950 flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 ${language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'} z-50 bg-white dark:bg-velmora-900 border-velmora-200 dark:border-white/5 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-velmora-100 dark:border-white/5">
            <Link to="/" className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 bg-velmora-900 rounded-lg flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">V</span>
              </div>
              {isSidebarOpen && (
                <span className="font-display font-bold text-xl tracking-tight whitespace-nowrap dark:text-white">
                  {settings?.siteName || 'VELMORA'}
                </span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all group ${
                    isActive 
                      ? 'bg-velmora-900 text-white shadow-lg shadow-velmora-900/20' 
                      : 'text-velmora-500 dark:text-velmora-400 hover:bg-velmora-100 dark:hover:bg-white/5 hover:text-velmora-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-velmora-900 dark:group-hover:text-white'}`} />
                  {isSidebarOpen && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                  )}
                  {isActive && isSidebarOpen && (
                    <motion.div layoutId="active-indicator" className={`${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
                      <ChevronRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-velmora-100 dark:border-white/5">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">{t('admin.logout')}</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? (language === 'ar' ? 'mr-64' : 'ml-64') : (language === 'ar' ? 'mr-20' : 'ml-20')}`}>
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-velmora-900 border-b border-velmora-200 dark:border-white/5 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-lg transition-colors text-velmora-500 dark:text-velmora-400"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="relative hidden md:block" ref={searchRef}>
              <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400`} />
              <input 
                type="text" 
                placeholder={t('admin.searchPlaceholder')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
                className={`${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-velmora-50 dark:bg-white/5 border border-velmora-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all w-64 dark:text-white`}
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute ${language === 'ar' ? 'right-0' : 'left-0'} mt-2 w-[400px] bg-white dark:bg-velmora-900 rounded-2xl shadow-2xl border border-velmora-100 dark:border-white/5 overflow-hidden z-50`}
                  >
                    <div className="p-4 max-h-[500px] overflow-y-auto">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-velmora-400" />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Products */}
                          {searchResults.products.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-velmora-400 mb-3 px-2">{t('admin.products')}</h4>
                              <div className="space-y-1">
                                {searchResults.products.map(product => (
                                  <button
                                    key={product.id}
                                    onClick={() => {
                                      navigate('/admin/products');
                                      setShowSearchResults(false);
                                      setSearchQuery('');
                                    }}
                                    className="w-full flex items-center p-2 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
                                  >
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-velmora-100 dark:bg-white/5 mr-3">
                                      {product.image ? (
                                        <img src={product.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <ImageIcon className="w-4 h-4 text-velmora-300" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-velmora-900 dark:text-white group-hover:text-velmora-900 transition-colors">{product.name}</p>
                                      <p className="text-xs text-velmora-500 dark:text-velmora-400">{product.category} • {formatPrice(product.price)}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Orders */}
                          {searchResults.orders.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-velmora-400 mb-3 px-2">{t('Orders')}</h4>
                              <div className="space-y-1">
                                {searchResults.orders.map(order => (
                                  <button
                                    key={order.id}
                                    onClick={() => {
                                      navigate('/admin/orders');
                                      setShowSearchResults(false);
                                      setSearchQuery('');
                                    }}
                                    className="w-full flex items-center p-2 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 flex items-center justify-center mr-3">
                                      <ShoppingBag size={18} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-velmora-900 dark:text-white group-hover:text-velmora-900 transition-colors">{order.displayId || order.id}</p>
                                      <p className="text-xs text-velmora-500 dark:text-velmora-400">{order.shippingAddress?.name} • {formatPrice(order.totalPrice)}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Users */}
                          {searchResults.users.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider text-velmora-400 mb-3 px-2">{t('admin.users')}</h4>
                              <div className="space-y-1">
                                {searchResults.users.map(user => (
                                  <button
                                    key={user.id}
                                    onClick={() => {
                                      navigate('/admin/users');
                                      setShowSearchResults(false);
                                      setSearchQuery('');
                                    }}
                                    className="w-full flex items-center p-2 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
                                  >
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-600 flex items-center justify-center mr-3">
                                      <Users size={18} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-velmora-900 dark:text-white group-hover:text-velmora-900 transition-colors">{user.name}</p>
                                      <p className="text-xs text-velmora-500 dark:text-velmora-400">{user.email} • {user.role}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {searchResults.products.length === 0 && 
                           searchResults.orders.length === 0 && 
                           searchResults.users.length === 0 && (
                            <div className="py-8 text-center">
                              <p className="text-sm text-velmora-500 dark:text-velmora-400">No results found for "{searchQuery}"</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-lg transition-colors text-velmora-500 dark:text-velmora-400"
              title={theme === 'dark' ? t('common.light_mode') : t('common.dark_mode')}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Toggle */}
            <button 
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-lg transition-colors text-velmora-500 dark:text-velmora-400 flex items-center space-x-2"
            >
              <Languages className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">{language === 'ar' ? 'EN' : 'AR'}</span>
            </button>

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-lg transition-colors text-velmora-500 dark:text-velmora-400"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-velmora-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute ${language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-80 bg-white dark:bg-velmora-900 rounded-2xl shadow-2xl border border-velmora-100 dark:border-white/5 overflow-hidden z-50`}
                  >
                    <div className="p-4 border-b border-velmora-100 dark:border-white/5 flex items-center justify-between bg-velmora-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-velmora-900 dark:text-white text-sm">{t('admin.notifications')}</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}
                          className="text-[10px] text-velmora-900 dark:text-velmora-400 hover:underline font-bold uppercase tracking-wider"
                        >
                          {t('admin.markAllRead')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-velmora-50 dark:divide-white/5">
                          {notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full p-4 text-left hover:bg-velmora-50 dark:hover:bg-white/5 transition-colors flex gap-3 ${!notif.read ? 'bg-velmora-50/30 dark:bg-velmora-900/10' : ''}`}
                            >
                              <div className={`mt-1 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                notif.type === 'order' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' :
                                notif.type === 'message' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
                                'bg-velmora-100 dark:bg-white/10 text-velmora-600 dark:text-velmora-400'
                              }`}>
                                {notif.type === 'order' ? <ShoppingBag size={14} /> :
                                 notif.type === 'message' ? <MessageSquare size={14} /> :
                                 <Bell size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs ${!notif.read ? 'font-bold text-velmora-900 dark:text-white' : 'text-velmora-700 dark:text-velmora-300'}`}>
                                  {notif.title}
                                </p>
                                <p className="text-[11px] text-velmora-500 dark:text-velmora-400 mt-0.5 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                <p className="text-[9px] text-velmora-400 dark:text-velmora-500 mt-1.5 flex items-center gap-1 font-medium">
                                  <Clock size={10} />
                                  {new Date(notif.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                              </div>
                              {!notif.read && (
                                <div className="mt-2 w-1.5 h-1.5 bg-velmora-900 rounded-full shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-10 text-center">
                          <div className="w-12 h-12 bg-velmora-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-velmora-100 dark:border-white/5">
                            <Bell size={20} className="text-velmora-300 dark:text-velmora-600" />
                          </div>
                          <p className="text-xs text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.noNotifications')}</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-velmora-100 dark:border-white/5 bg-velmora-50/50 dark:bg-white/5 text-center">
                        <button 
                          onClick={() => {
                            navigate('/admin/notifications');
                            setIsNotificationsOpen(false);
                          }}
                          className="text-[10px] text-velmora-500 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white font-bold uppercase tracking-widest"
                        >
                          {t('admin.viewAllNotifications')}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className={`flex items-center space-x-3 ${language === 'ar' ? 'pr-6 border-r' : 'pl-6 border-l'} border-velmora-200 dark:border-white/10`}>
              <div className={`text-right hidden sm:block ${language === 'ar' ? 'ml-3' : ''}`}>
                <p className="text-sm font-bold text-velmora-900 dark:text-white">{user?.email?.split('@')[0]}</p>
                <p className="text-[10px] uppercase tracking-widest text-velmora-500 dark:text-velmora-400 font-bold">{t('admin.administrator')}</p>
              </div>
              <div className="w-10 h-10 bg-velmora-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-velmora-200 dark:border-white/10">
                <Users className="w-5 h-5 text-velmora-400 dark:text-velmora-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
