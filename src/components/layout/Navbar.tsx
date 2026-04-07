import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Search, User, ArrowRight, LogOut, Heart, Globe, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { useAppContext } from '../../context/AppContext';
import { auth } from '../../firebase';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { 
    setIsCartOpen, setIsSearchOpen, setIsAuthOpen, 
    cart, user, profile, isAdmin, isSupplier, logout,
    language, setLanguage, theme, toggleTheme, favorites, settings
  } = useAppContext();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: t('nav.newArrivals'), href: '/category/new-arrivals' },
    { name: t('nav.women'), href: '/category/women' },
    { name: t('nav.men'), href: '/category/men' },
    { name: t('nav.shoes'), href: '/category/shoes' },
    { name: t('nav.accessories'), href: '/category/accessories' },
    { name: t('nav.sale'), href: '/category/sale', className: 'text-red-500 font-semibold' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4',
        (isScrolled || location.pathname !== '/' || isMobileMenuOpen) ? 'bg-velmora-50 dark:bg-velmora-900 shadow-sm py-3' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2.5 bg-velmora-100 dark:bg-velmora-800/50 hover:bg-velmora-200 dark:hover:bg-velmora-800 rounded-xl transition-all duration-300 shadow-sm border border-velmora-200 dark:border-velmora-800 group"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5 text-velmora-900 dark:text-velmora-300 group-hover:scale-110 transition-transform" />
        </button>

        {/* Logo */}
        <div className="flex-1 lg:flex-none text-center lg:text-left">
          <Link to="/" className="text-3xl font-display tracking-tighter font-bold text-velmora-900 dark:text-velmora-50">
            {settings.siteName || 'VELMORA'}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-sm uppercase tracking-widest hover:opacity-50 transition-opacity text-velmora-900 dark:text-velmora-50",
                link.className
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 text-velmora-900 dark:text-velmora-50">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors hidden md:block"
            title={theme === 'light' ? t('common.dark_mode') : t('common.light_mode')}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors hidden md:flex items-center space-x-1"
            title={language === 'en' ? 'العربية' : 'English'}
          >
            <Globe className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">{language === 'en' ? 'AR' : 'EN'}</span>
          </button>

          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
          
          <Link 
            to="/favorites"
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors relative hidden sm:block"
          >
            <Heart className="w-5 h-5" />
            {favorites.length > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-velmora-50 dark:border-stone-900" />
            )}
          </Link>

          <div className="relative group">
            <button 
              onClick={() => user ? null : setIsAuthOpen(true)}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex items-center"
            >
              <User className="w-5 h-5" />
              {profile && <span className="ml-2 text-[10px] font-bold uppercase tracking-widest hidden lg:block">{profile.name?.split(' ')[0]}</span>}
            </button>
            
            {user && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-velmora-50 dark:bg-stone-900 shadow-xl rounded-xl border border-black/5 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                <Link to="/profile" className="block px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-velmora-100 dark:hover:bg-white/5">{t('profile.title')}</Link>
                <Link to="/orders" className="block px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-velmora-100 dark:hover:bg-white/5">{t('profile.orders')}</Link>
                {isAdmin && <Link to="/admin" className="block px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-velmora-100 dark:hover:bg-white/5 text-velmora-500 font-bold">{t('nav.adminDashboard')}</Link>}
                {isSupplier && <Link to="/supplier" className="block px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-velmora-100 dark:hover:bg-white/5 text-velmora-500 font-bold">{t('nav.supplierPortal')}</Link>}
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 flex items-center"
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  {t('LOGOUT')}
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-velmora-900 dark:bg-velmora-400 text-white dark:text-stone-900 text-[8px] font-bold flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-velmora-50 dark:bg-stone-900 z-[70] p-8 flex flex-col shadow-2xl border-r border-velmora-100 dark:border-white/5"
              >
              <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-display font-bold text-velmora-900 dark:text-velmora-50">
                  {settings.siteName || 'VELMORA'}
                </span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 bg-velmora-100 dark:bg-white/5 hover:bg-velmora-200 dark:hover:bg-white/10 rounded-xl transition-all duration-300 border border-velmora-100 dark:border-white/10 group"
                >
                  <X className="w-5 h-5 text-velmora-900 dark:text-velmora-400 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.3
                    }
                  }
                }}
                className="flex flex-col space-y-2"
              >
                {navLinks.map((link) => (
                  <motion.div
                    key={link.name}
                    variants={{
                      hidden: { x: -20, opacity: 0 },
                      visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
                    }}
                  >
                    <Link
                      to={link.href}
                      className={cn(
                        "text-sm uppercase tracking-[0.2em] font-bold py-4 px-5 hover:bg-velmora-100 dark:hover:bg-white/5 hover:text-velmora-700 dark:hover:text-velmora-400 transition-all duration-300 rounded-2xl flex justify-between items-center group relative overflow-hidden text-velmora-900 dark:text-velmora-50",
                        link.className
                      )}
                    >
                      <span className="relative z-10">{link.name}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 relative z-10" />
                      <div className="absolute inset-0 bg-velmora-100 dark:bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              
              <div className="mt-8 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={toggleTheme}
                    className="flex flex-col items-center justify-center space-y-2 p-4 bg-velmora-100 dark:bg-white/5 hover:bg-velmora-200 dark:hover:bg-white/10 rounded-2xl border border-velmora-100 dark:border-white/10 transition-all"
                  >
                    {theme === 'light' ? <Moon className="w-5 h-5 text-velmora-900" /> : <Sun className="w-5 h-5 text-velmora-400" />}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-50">{theme === 'light' ? t('common.dark_mode') : t('common.light_mode')}</span>
                  </button>
                  <button 
                    onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                    className="flex flex-col items-center justify-center space-y-2 p-4 bg-velmora-100 dark:bg-white/5 hover:bg-velmora-200 dark:hover:bg-white/10 rounded-2xl border border-velmora-100 dark:border-white/10 transition-all"
                  >
                    <Globe className="w-5 h-5 text-velmora-900 dark:text-velmora-400" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-50">{language === 'en' ? 'العربية' : 'English'}</span>
                  </button>
                  <Link 
                    to="/favorites"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center space-y-2 p-4 bg-velmora-100 dark:bg-white/5 hover:bg-velmora-200 dark:hover:bg-white/10 rounded-2xl border border-velmora-100 dark:border-white/10 transition-all sm:hidden"
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-50">{t('nav.favorites') || 'Favorites'}</span>
                  </Link>
                  <button 
                    onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex flex-col items-center justify-center space-y-2 p-4 bg-velmora-100 dark:bg-white/5 hover:bg-velmora-200 dark:hover:bg-white/10 rounded-2xl border border-velmora-100 dark:border-white/10 transition-all relative"
                  >
                    <ShoppingBag className="w-5 h-5 text-velmora-900 dark:text-velmora-400" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-50">{t('nav.cart') || 'Cart'}</span>
                    {cart.length > 0 && (
                      <span className="absolute top-3 right-3 w-4 h-4 bg-velmora-900 dark:bg-velmora-400 text-white dark:text-stone-900 text-[8px] font-bold flex items-center justify-center rounded-full">
                        {cart.length}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}
                    className="flex flex-col items-center justify-center space-y-2 p-4 bg-velmora-100 dark:bg-white/5 hover:bg-velmora-200 dark:hover:bg-white/10 rounded-2xl border border-velmora-100 dark:border-white/10 transition-all md:hidden"
                  >
                    <Search className="w-5 h-5 text-velmora-900 dark:text-velmora-400" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-50">{t('nav.search')}</span>
                  </button>
                </div>

                {user ? (
                  <div className="p-4 bg-velmora-100 dark:bg-white/5 rounded-2xl border border-velmora-200 dark:border-white/10">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-velmora-900 text-white rounded-full flex items-center justify-center font-bold">
                        {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-velmora-900 dark:text-velmora-50">{profile?.name || user.email?.split('@')[0]}</p>
                        <p className="text-[10px] text-velmora-500 uppercase tracking-widest">{t('profile.member') || 'Member'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 bg-velmora-50 dark:bg-stone-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-velmora-900 dark:text-velmora-50">{t('profile.title')}</Link>
                      <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="py-2 px-3 bg-velmora-50 dark:bg-stone-800 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center text-velmora-900 dark:text-velmora-50">{t('profile.orders')}</Link>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full mt-3 py-2 px-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center"
                    >
                      <LogOut className="w-3 h-3 mr-2" />
                      {t('LOGOUT')}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center space-x-4 p-5 bg-velmora-900 text-white rounded-2xl hover:bg-velmora-800 transition-all shadow-lg shadow-velmora-900/20"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">{t('nav.login')}</span>
                  </button>
                )}
              </div>

              <div className="mt-auto pt-8 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center space-x-4 text-sm text-velmora-900/60 dark:text-velmora-50/40">
                  <Link to="/our-story">{t('nav.about')}</Link>
                  <Link to="/contact">{t('nav.contact')}</Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
