import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Edit3, 
  Check,
  Loader2,
  Shield,
  Heart,
  Home,
  X,
  Bell,
  Lock,
  HelpCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';
import { where } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { FirestoreService } from '../services/FirestoreService';
import { auth } from '../firebase';
import { updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [supplierFormData, setSupplierFormData] = useState({
    storeName: '',
    phone: '',
    address: ''
  });
  const { user, profile, isAdmin, isSupplier, favorites, formatPrice, registerSupplier, supplierStatus } = useAppContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: 'Egypt'
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [subView, setSubView] = useState<'main' | 'password' | 'notifications' | 'delete'>('main');
  const [emailPrefs, setEmailPrefs] = useState({
    promotions: true,
    orderUpdates: true,
    newsletter: false
  });
  const [notifSettings, setNotifSettings] = useState({
    push: true,
    sms: false,
    email: true
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setProfileData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || 'Egypt'
      });
      
      if (profile.emailPrefs) setEmailPrefs(profile.emailPrefs);
      if (profile.notifSettings) setNotifSettings(profile.notifSettings);
    }
  }, [profile]);

  const handleModalSave = async () => {
    if (!user) return;
    setLoading(true);
    setModalError('');
    setModalSuccess('');

    try {
      if (activeModal === 'email') {
        await FirestoreService.updateDocument('users', user.uid, { emailPrefs });
        setModalSuccess('Email preferences updated successfully');
        setTimeout(() => setActiveModal(null), 1500);
      } else if (activeModal === 'supplier') {
        await registerSupplier(user.uid, {
          ...supplierFormData,
          email: user.email,
          name: profile?.name || user.displayName || 'User'
        });
        setModalSuccess('Supplier application submitted successfully!');
        setTimeout(() => setActiveModal(null), 2000);
      } else if (activeModal === 'account') {
        if (subView === 'notifications') {
          await FirestoreService.updateDocument('users', user.uid, { notifSettings });
          setModalSuccess('Notification settings updated successfully');
          setTimeout(() => setSubView('main'), 1500);
        } else if (subView === 'password') {
          if (passwordData.new !== passwordData.confirm) {
            throw new Error('Passwords do not match');
          }
          if (passwordData.new.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }

          // Re-authenticate user before updating password
          const credential = EmailAuthProvider.credential(user.email!, passwordData.current);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, passwordData.new);
          
          setModalSuccess('Password updated successfully');
          setPasswordData({ current: '', new: '', confirm: '' });
          setTimeout(() => setSubView('main'), 1500);
        } else if (subView === 'delete') {
          // Re-authenticate user before deleting
          const credential = EmailAuthProvider.credential(user.email!, passwordData.current);
          await reauthenticateWithCredential(user, credential);
          await FirestoreService.deleteDocument('users', user.uid);
          await deleteUser(user);
          navigate('/');
        } else {
          setActiveModal(null);
        }
      }
    } catch (error: any) {
      console.error('Modal save error:', error);
      setModalError(error.message || 'An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setActiveModal(null);
    setSubView('main');
    setModalError('');
    setModalSuccess('');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  useEffect(() => {
    if (user) {
      // Fetch recent orders
      const fetchOrders = async () => {
        try {
          // Use a filtered query to fetch only the user's orders
          // This is required by Firestore security rules for non-admin users
          const userOrders = await FirestoreService.getCollection('orders', [
            where('userId', '==', user.uid)
          ]);
          
          // Sort by date descending
          const sortedOrders = userOrders.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          setOrders(sortedOrders.slice(0, 3));
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await FirestoreService.updateDocument('users', user.uid, profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="pt-40 pb-24 text-center px-6 bg-velmora-50 dark:bg-velmora-950 min-h-screen">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 bg-velmora-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <User className="w-10 h-10 text-velmora-300" />
          </div>
          <h2 className="text-2xl font-display font-bold dark:text-white">{t('sign In Prompt')}</h2>
          <p className="text-velmora-500 dark:text-velmora-400">{t('sign In')}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all"
          >
            {t('GO HOME')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-velmora-50 dark:bg-velmora-950 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Profile Header */}
        <div className="bg-white dark:bg-velmora-900 p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-velmora-100 dark:border-white/5 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-10">
          <div className="relative">
            <div className="w-32 h-32 bg-velmora-900 rounded-full flex items-center justify-center text-white text-4xl font-display font-bold shadow-2xl shadow-velmora-900/20">
              {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            {(isAdmin || isSupplier) && (
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-velmora-800 p-2 rounded-full shadow-lg border border-velmora-100 dark:border-white/10">
                <Shield className="w-5 h-5 text-velmora-900 dark:text-velmora-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-display font-bold mb-1 dark:text-white">{profile?.name || t('profile.member')}</h1>
              <p className="text-velmora-500 dark:text-velmora-400 font-medium">{user.email}</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {isAdmin && (
                <span className="px-4 py-1.5 bg-velmora-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {t('profile.admin')}
                </span>
              )}
              {isSupplier && (
                <span className="px-4 py-1.5 bg-velmora-100 dark:bg-white/10 text-velmora-900 dark:text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {t('profile.supplier')}
                </span>
              )}
              <span className="px-4 py-1.5 bg-velmora-50 dark:bg-white/5 text-velmora-600 dark:text-velmora-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                {t('profile.memberSince')} {new Date(user.metadata?.creationTime || '').getFullYear()}
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-3 w-full md:w-auto">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-8 py-3 bg-white dark:bg-velmora-800 border border-velmora-200 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-50 dark:hover:bg-white/5 transition-all flex items-center justify-center dark:text-white"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? t('common.cancel') : t('edit PROFILE')}
            </button>
            <button 
              onClick={handleLogout}
              className="px-8 py-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('LOGOUT')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Profile Info Form */}
            <motion.div 
              layout
              className="bg-white dark:bg-velmora-900 p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-velmora-100 dark:border-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-bold flex items-center dark:text-white">
                  <User className="w-5 h-5 mr-3 text-velmora-900 dark:text-velmora-400" />
                  {t('profile.personalInfo')}
                </h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">{t('FULL NAME')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-300" />
                      <input 
                        disabled={!isEditing}
                        type="text" 
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-velmora-900 transition-all outline-none disabled:opacity-60 dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">{t('checkout.mobile')}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-300" />
                      <input 
                        disabled={!isEditing}
                        type="tel" 
                        placeholder="+20 123 456 7890"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full pl-12 pr-6 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-velmora-900 transition-all outline-none disabled:opacity-60 dark:text-white" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">{t('checkout.street')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-300" />
                    <input 
                      disabled={!isEditing}
                      type="text" 
                      placeholder="Street name, building number"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full pl-12 pr-6 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-velmora-900 transition-all outline-none disabled:opacity-60 dark:text-white" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">{t('checkout.city')}</label>
                    <input 
                      disabled={!isEditing}
                      type="text" 
                      value={profileData.city}
                      onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                      className="w-full px-6 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-velmora-900 transition-all outline-none disabled:opacity-60 dark:text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">Country</label>
                    <input 
                      disabled={!isEditing}
                      type="text" 
                      value={profileData.country}
                      onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                      className="w-full px-6 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-velmora-900 transition-all outline-none disabled:opacity-60 dark:text-white" 
                    />
                  </div>
                </div>

                {isEditing && (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-velmora-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 transition-all flex items-center justify-center shadow-xl shadow-velmora-900/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        {t('common.save')}
                      </>
                    )}
                  </motion.button>
                )}
              </form>
            </motion.div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-velmora-900 p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-velmora-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-bold flex items-center dark:text-white">
                  <ShoppingBag className="w-5 h-5 mr-3 text-velmora-900 dark:text-velmora-400" />
                  {t('profile.recentOrders')}
                </h2>
                <Link to="/orders" className="text-xs font-bold uppercase tracking-widest text-velmora-600 hover:text-velmora-900 dark:text-velmora-400 dark:hover:text-white transition-colors flex items-center">
                  {t('common.viewAll')} <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {ordersLoading ? (
                  <div className="py-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-velmora-200" />
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="p-6 bg-velmora-50 dark:bg-white/5 rounded-3xl border border-velmora-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white dark:bg-velmora-800 rounded-2xl flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-velmora-300" />
                        </div>
                        <div>
                          <p className="text-sm font-bold dark:text-white">Order #{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-[10px] text-velmora-500 dark:text-velmora-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-bold dark:text-white">{formatPrice(order.totalPrice)}</p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${
                            order.status === 'completed' ? 'text-green-600' : 
                            order.status === 'cancelled' ? 'text-red-600' : 'text-orange-600'
                          }`}>{order.status}</p>
                        </div>
                        <Link to="/orders" className="p-2 bg-white dark:bg-velmora-800 rounded-xl hover:bg-velmora-100 dark:hover:bg-white/10 transition-colors dark:text-white">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center space-y-4">
                    <ShoppingBag className="w-12 h-12 text-velmora-100 dark:text-white/10 mx-auto" />
                    <p className="text-velmora-500 dark:text-velmora-400 text-sm">{t('orders.noOrders')}</p>
                    <Link to="/" className="inline-block text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-white border-b-2 border-velmora-900 dark:border-white pb-1">{t('continue Shopping')}</Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Quick Stats */}
            <div className="bg-velmora-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-velmora-900/20 space-y-8">
              <h3 className="text-xs font-bold uppercase tracking-widest opacity-60">{t('profile.summary')}</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('profile.totalOrders')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{favorites.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('nav.favorites')}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2 dark:text-white/80">{t('profile.summary')}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold dark:text-white">Silver Member</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full dark:bg-white/10">82% to Gold</span>
                </div>
                <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden dark:bg-white/5">
                  <div className="h-full bg-white w-[82%] dark:bg-velmora-400" />
                </div>
              </div>
            </div>

            {/* Settings & Help */}
            <div className="bg-white dark:bg-velmora-900 p-8 rounded-[2.5rem] shadow-sm border border-velmora-100 dark:border-white/5 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest border-b border-velmora-50 dark:border-white/5 pb-4 dark:text-white">
                {t('profile.settingsSupport')}
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Mail, label: t('profile.emailPreferences'), id: 'email' },
                  { icon: Shield, label: t('profile.privacySecurity'), href: '/privacy-policy' },
                  { icon: Settings, label: t('profile.accountSettings'), id: 'account' },
                  { icon: HelpCircle, label: t('profile.helpCenter'), href: '/faq' },
                ].map((item, i) => (
                  item.href ? (
                    <Link 
                      key={i}
                      to={item.href}
                      className="flex items-center justify-between p-4 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center">
                        <item.icon className="w-4 h-4 mr-4 text-velmora-400 group-hover:text-velmora-900 dark:group-hover:text-white transition-colors" />
                        <span className="text-sm font-medium dark:text-white">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-velmora-200 group-hover:text-velmora-900 dark:group-hover:text-white transition-all" />
                    </Link>
                  ) : (
                    <button 
                      key={i}
                      onClick={() => setActiveModal(item.id || null)}
                      className="w-full flex items-center justify-between p-4 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center">
                        <item.icon className="w-4 h-4 mr-4 text-velmora-400 group-hover:text-velmora-900 dark:group-hover:text-white transition-colors" />
                        <span className="text-sm font-medium dark:text-white">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-velmora-200 group-hover:text-velmora-900 dark:group-hover:text-white transition-all" />
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Professional Tools */}
            <div className="bg-velmora-50 dark:bg-velmora-900/50 p-8 rounded-[2.5rem] border border-velmora-100 dark:border-white/5 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-100">Professional Tools</h3>
              <div className="space-y-3">
                {isAdmin && (
                  <Link 
                    to="/admin"
                    className="block w-full bg-white dark:bg-velmora-800 p-4 rounded-2xl border border-velmora-200 dark:border-white/10 text-center text-xs font-bold uppercase tracking-widest hover:bg-velmora-900 hover:text-white hover:border-velmora-900 dark:hover:bg-white dark:hover:text-velmora-900 transition-all dark:text-white"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {isSupplier ? (
                  <Link 
                    to="/supplier"
                    className="block w-full bg-white dark:bg-velmora-800 p-4 rounded-2xl border border-velmora-200 dark:border-white/10 text-center text-xs font-bold uppercase tracking-widest hover:bg-velmora-900 hover:text-white hover:border-velmora-900 dark:hover:bg-white dark:hover:text-velmora-900 transition-all dark:text-white"
                  >
                    Supplier Portal
                  </Link>
                ) : (
                  <button 
                    onClick={() => setActiveModal('supplier')}
                    className="w-full bg-velmora-900 dark:bg-velmora-100 dark:text-velmora-900 text-white p-4 rounded-2xl text-center text-xs font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-white transition-all shadow-lg shadow-velmora-900/20"
                  >
                    Become a Supplier
                  </button>
                )}
                
                {supplierStatus === 'pending' && !isSupplier && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest rounded-2xl border border-orange-100 dark:border-orange-900/20 text-center">
                    Application Pending Approval
                  </div>
                )}
                {supplierStatus === 'rejected' && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-2xl border border-red-100 dark:border-red-900/20 text-center">
                    Application Rejected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-velmora-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-velmora-50 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center">
                {activeModal === 'account' && subView !== 'main' && (
                  <button 
                    onClick={() => {
                      setSubView('main');
                      setModalError('');
                      setModalSuccess('');
                    }}
                    className="p-2 mr-2 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <h3 className="text-xl font-display font-bold dark:text-white">
                  {activeModal === 'email' ? t('profile.emailPreferences') : 
                   subView === 'password' ? t('profile.changePassword') :
                   subView === 'notifications' ? t('profile.notificationSettings') :
                    subView === 'delete' ? t('profile.deleteAccount') :
                    activeModal === 'supplier' ? 'Become a Supplier' :
                    t('profile.accountSettings')}
                </h3>
              </div>
              <button 
                onClick={resetModal}
                className="p-2 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {modalError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/20 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                  {modalError}
                </div>
              )}
              
              {modalSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-xs rounded-xl border border-green-100 dark:border-green-900/20 flex items-center">
                  <Check className="w-4 h-4 mr-2 shrink-0" />
                  {modalSuccess}
                </div>
              )}

              {activeModal === 'supplier' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">Store Name</label>
                    <input 
                      type="text"
                      placeholder="Your Store Name"
                      value={supplierFormData.storeName}
                      onChange={(e) => setSupplierFormData({...supplierFormData, storeName: e.target.value})}
                      className="w-full px-6 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">Business Phone</label>
                    <input 
                      type="tel"
                      placeholder="+20 123 456 7890"
                      value={supplierFormData.phone}
                      onChange={(e) => setSupplierFormData({...supplierFormData, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">Business Address</label>
                    <textarea 
                      placeholder="Full business address"
                      value={supplierFormData.address}
                      onChange={(e) => setSupplierFormData({...supplierFormData, address: e.target.value})}
                      className="w-full px-6 py-4 bg-velmora-50 dark:bg-velmora-800 border-none rounded-2xl outline-none dark:text-white min-h-[100px] resize-none"
                    />
                  </div>
                  <p className="text-[10px] text-velmora-500 text-center italic">
                    By submitting, you agree to our supplier terms and conditions. Your application will be reviewed by our team.
                  </p>
                </div>
              ) : activeModal === 'email' ? (
                <div className="space-y-4">
                  {[
                    { id: 'promotions', label: 'Promotions & Offers', desc: 'Get notified about sales and exclusive deals.' },
                    { id: 'orderUpdates', label: 'Order Updates', desc: 'Receive status updates for your purchases.' },
                    { id: 'newsletter', label: 'Newsletter', desc: 'Weekly inspiration and style guides.' }
                  ].map((pref) => (
                    <div key={pref.id} className="flex items-start justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl">
                      <div className="space-y-1">
                        <p className="text-sm font-bold dark:text-white">{pref.label}</p>
                        <p className="text-xs text-velmora-500 dark:text-velmora-400">{pref.desc}</p>
                      </div>
                      <button 
                        onClick={() => setEmailPrefs(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof emailPrefs] }))}
                        className={`w-12 h-6 rounded-full transition-all relative ${emailPrefs[pref.id as keyof typeof emailPrefs] ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-velmora-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${emailPrefs[pref.id as keyof typeof emailPrefs] ? (document.documentElement.dir === 'rtl' ? 'left-1' : 'right-1') : (document.documentElement.dir === 'rtl' ? 'right-1' : 'left-1')}`} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {subView === 'main' && (
                    <div className="space-y-4">
                      <button 
                        onClick={() => setSubView('password')}
                        className="w-full flex items-center justify-between p-4 bg-velmora-50 dark:bg-zinc-800 rounded-2xl hover:bg-velmora-100 dark:hover:bg-zinc-700 transition-all group"
                      >
                        <div className="flex items-center">
                          <Lock className="w-4 h-4 mr-4 text-velmora-400 group-hover:text-velmora-900 dark:group-hover:text-white" />
                          <span className="text-sm font-medium dark:text-white">{t('profile.changePassword')}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-velmora-200 ${document.documentElement.dir === 'rtl' ? 'rotate-180' : ''}`} />
                      </button>
                      <button 
                        onClick={() => setSubView('notifications')}
                        className="w-full flex items-center justify-between p-4 bg-velmora-50 dark:bg-zinc-800 rounded-2xl hover:bg-velmora-100 dark:hover:bg-zinc-700 transition-all group"
                      >
                        <div className="flex items-center">
                          <Bell className="w-4 h-4 mr-4 text-velmora-400 group-hover:text-velmora-900 dark:group-hover:text-white" />
                          <span className="text-sm font-medium dark:text-white">{t('profile.notificationSettings')}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-velmora-200 ${document.documentElement.dir === 'rtl' ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <div className="pt-6 border-t border-velmora-50 dark:border-white/5">
                        <button 
                          onClick={() => setSubView('delete')}
                          className="w-full p-4 text-red-500 text-sm font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                        >
                          {t('profile.deleteAccount')}
                        </button>
                      </div>
                    </div>
                  )}

                  {subView === 'password' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">{t('profile.currentPassword')}</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-300" />
                          <input 
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                            className="w-full pl-12 pr-12 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl outline-none dark:text-white"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-velmora-400"
                          >
                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">{t('profile.newPassword')}</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-300" />
                          <input 
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                            className="w-full pl-12 pr-12 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl outline-none dark:text-white"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-velmora-400"
                          >
                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">{t('profile.confirmNewPassword')}</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-300" />
                          <input 
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                            className="w-full pl-12 pr-12 py-4 bg-velmora-50 dark:bg-zinc-800 border-none rounded-2xl outline-none dark:text-white"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-velmora-400"
                          >
                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {subView === 'notifications' && (
                    <div className="space-y-4">
                      {[
                        { id: 'push', label: t('profile.pushNotifications'), desc: 'Receive alerts directly on your device.' },
                        { id: 'sms', label: t('profile.smsAlerts'), desc: 'Get important updates via text message.' },
                        { id: 'email', label: t('profile.emailNotifications'), desc: 'Stay updated through your inbox.' }
                      ].map((pref) => (
                        <div key={pref.id} className="flex items-start justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl">
                          <div className="space-y-1">
                            <p className="text-sm font-bold dark:text-white">{pref.label}</p>
                            <p className="text-xs text-velmora-500 dark:text-velmora-400">{pref.desc}</p>
                          </div>
                          <button 
                            onClick={() => setNotifSettings(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof notifSettings] }))}
                            className={`w-12 h-6 rounded-full transition-all relative ${notifSettings[pref.id as keyof typeof notifSettings] ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-velmora-700'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifSettings[pref.id as keyof typeof notifSettings] ? (document.documentElement.dir === 'rtl' ? 'left-1' : 'right-1') : (document.documentElement.dir === 'rtl' ? 'right-1' : 'left-1')}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {subView === 'delete' && (
                    <div className="space-y-6 text-center">
                      <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-bold dark:text-white">{t('profile.deleteConfirmTitle')}</h4>
                        <p className="text-sm text-velmora-500 dark:text-velmora-400">
                          {t('profile.deleteConfirmDesc')}
                        </p>
                      </div>
                      <div className="space-y-4 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">{t('profile.confirmWithPassword')}</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-300" />
                          <input 
                            type="password"
                            placeholder={t('profile.enterPassword')}
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                            className="w-full pl-12 pr-6 py-4 bg-velmora-50 dark:bg-velmora-800 border-none rounded-2xl outline-none dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {subView !== 'main' && (
                <button 
                  onClick={handleModalSave}
                  disabled={loading}
                  className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg flex items-center justify-center ${
                    subView === 'delete' 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                      : 'bg-velmora-900 hover:bg-velmora-800 text-white shadow-velmora-900/20'
                  }`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    subView === 'delete' ? t('profile.deleteConfirmButton') : t('common.save')
                  )}
                </button>
              )}
              
              {activeModal === 'email' && (
                <button 
                  onClick={handleModalSave}
                  disabled={loading}
                  className="w-full bg-velmora-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 transition-all shadow-lg shadow-velmora-900/20 flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('common.save')}
                </button>
              )}

              {activeModal === 'supplier' && (
                <button 
                  onClick={handleModalSave}
                  disabled={loading || !supplierFormData.storeName || !supplierFormData.phone || !supplierFormData.address}
                  className="w-full bg-velmora-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 transition-all shadow-lg shadow-velmora-900/20 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
