import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  X, 
  Edit3, 
  AlertCircle,
  Loader2,
  Check,
  Image as ImageIcon,
  RefreshCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { where } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { FirestoreService } from '../services/FirestoreService';
import { useNavigate } from 'react-router-dom';
import { cn, compressImage } from '../lib/utils';
import { useTranslation } from 'react-i18next';

const MyOrders: React.FC = () => {
  const { t } = useTranslation();
  const { user, formatPrice } = useAppContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ phone: '', address: '', city: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnImage, setReturnImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    if (user?.uid) {
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
        
        setOrders(sortedOrders);
        
        // Update selected order if it's open
        if (selectedOrder) {
          const updated = sortedOrders.find(o => o.id === selectedOrder.id);
          if (updated) setSelectedOrder(updated);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await FirestoreService.updateDocument('orders', orderId, { 
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
      setShowConfirmCancel(false);
      await fetchOrders();
      toast.success(t('orders.cancelSuccess') || 'Order cancelled successfully');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(t('orders.cancelError') || 'Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!selectedOrder || !returnReason) return;
    setActionLoading(true);
    try {
      await FirestoreService.addDocument('returns', {
        orderId: selectedOrder.id,
        userId: user?.uid,
        userName: user?.displayName || user?.email?.split('@')[0],
        userEmail: user?.email,
        items: selectedOrder.items,
        reason: returnReason,
        image: returnImage,
        supplierIds: selectedOrder.supplierIds || [],
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Add notification for admin
      await FirestoreService.addNotification({
        title: 'New Return Request',
        message: `Order #${selectedOrder.displayId || selectedOrder.id?.slice(-6).toUpperCase()} has a new return request from ${user?.displayName || user?.email?.split('@')[0]}`,
        type: 'system',
        link: '/admin/returns'
      });
      
      await FirestoreService.updateDocument('orders', selectedOrder.id, { 
        returnStatus: 'pending',
        updatedAt: new Date().toISOString()
      });
      
      setIsReturnModalOpen(false);
      setReturnReason('');
      setReturnImage(null);
      await fetchOrders();
      toast.success(t('orders.returnRequestedSuccess') || 'Return request submitted successfully');
    } catch (error) {
      console.error('Error requesting return:', error);
      toast.error(t('orders.returnRequestedError') || 'Failed to submit return request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedBase64 = await compressImage(file, 800, 800, 0.6);
      setReturnImage(compressedBase64);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to process image');
    } finally {
      setIsUploading(false);
    }
  };

  const isWithinReturnPeriod = (date: string) => {
    const orderDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setActionLoading(true);
    try {
      await FirestoreService.updateDocument('orders', selectedOrder.id, {
        shippingAddress: {
          ...selectedOrder.shippingAddress,
          ...editData
        }
      });
      setIsEditing(false);
      await fetchOrders();
      alert(t('common.saveSuccess'));
    } catch (error) {
      console.error('Error updating order:', error);
      alert(t('common.error'));
    } finally {
      setActionLoading(false);
    }
  };

  const startEditing = () => {
    setEditData({
      phone: selectedOrder.shippingAddress.phone || '',
      address: selectedOrder.shippingAddress.address || '',
      city: selectedOrder.shippingAddress.city || ''
    });
    setIsEditing(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'confirmed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-velmora-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-50 text-orange-600';
      case 'confirmed': return 'bg-blue-50 text-blue-600';
      case 'shipped': return 'bg-purple-50 text-purple-600';
      case 'completed': return 'bg-green-50 text-green-600';
      case 'cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-velmora-50 text-velmora-600';
    }
  };

  const OrderTracking = ({ status }: { status: string }) => {
    const steps = ['pending', 'confirmed', 'shipped', 'completed'];
    const currentStep = steps.indexOf(status);
    const isCancelled = status === 'cancelled';

    if (isCancelled) {
      return (
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-2xl border border-red-100">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">{t('orders.statuses.cancelled')}</span>
        </div>
      );
    }

    return (
      <div className="relative pt-8 pb-4">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-velmora-100 -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-velmora-900 -translate-y-1/2 transition-all duration-1000" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {steps.map((step, i) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${
                i <= currentStep ? 'bg-velmora-900 text-white' : 'bg-white border-2 border-velmora-100 text-velmora-200'
              }`}>
                {i < currentStep ? <Check className="w-4 h-4" /> : i === currentStep ? getStatusIcon(step) : <div className="w-2 h-2 bg-current rounded-full" />}
              </div>
              <span className={`mt-3 text-[8px] font-bold uppercase tracking-widest ${i <= currentStep ? 'text-velmora-900' : 'text-velmora-300'}`}>
                {t(`orders.statuses.${step}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-velmora-900 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-velmora-500 font-bold uppercase tracking-widest text-xs">{t('orders.loading')}</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 min-h-screen bg-velmora-50/30 dark:bg-velmora-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 dark:text-white">{t('orders.title')}</h1>
            <p className="text-velmora-500 dark:text-velmora-400 text-sm">{t('orders.subtitle')}</p>
          </div>
          <div className="p-4 bg-white dark:bg-velmora-800 rounded-2xl shadow-sm border border-velmora-100 dark:border-white/5">
            <Package className="w-6 h-6 text-velmora-900 dark:text-velmora-400" />
          </div>
        </div>

        {orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-velmora-800 p-16 rounded-[40px] text-center shadow-sm border border-velmora-100 dark:border-white/5"
          >
            <div className="w-20 h-20 bg-velmora-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-velmora-200 dark:text-white/20" />
            </div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">{t('orders.noOrders')}</h2>
            <p className="text-velmora-500 dark:text-velmora-400 mb-8 max-w-xs mx-auto">{t('orders.noOrdersDesc')}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-velmora-900 dark:bg-white dark:text-black text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-velmora-200 transition-all"
            >
              {t('common.continueShopping')}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-velmora-800 rounded-[32px] overflow-hidden shadow-sm border border-velmora-100 dark:border-white/5 hover:shadow-md transition-all group"
              >
                <div className="p-8">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('orders.orderId')}</p>
                      <h3 className="text-lg font-mono font-bold dark:text-white">#{order.displayId || order.id.slice(-8).toUpperCase()}</h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{t(`orders.statuses.${order.status}`)}</span>
                      </div>
                      <p className="text-xs text-velmora-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {order.items?.slice(0, 2).map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-4 p-4 bg-velmora-50/50 dark:bg-white/5 rounded-2xl">
                        <div className="w-16 h-20 bg-white dark:bg-velmora-700 rounded-xl overflow-hidden flex-shrink-0 border border-velmora-100 dark:border-white/10">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-velmora-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold truncate dark:text-white">{item.name}</h4>
                          <p className="text-[10px] text-velmora-500 dark:text-velmora-400 uppercase tracking-widest mt-1">
                            {item.size} / {item.color} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-white/40 text-center">
                        + {order.items.length - 2} {t('common.items')}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-velmora-50 dark:border-white/5 flex flex-wrap justify-between items-center gap-6">
                    <div className="flex items-center space-x-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 mb-1">{t('cart.total')}</p>
                        <p className="text-xl font-bold dark:text-white">{formatPrice(order.totalPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 mb-1">{t('checkout.payment')}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold uppercase tracking-widest dark:text-white">
                            {order.paymentMethod === 'cod' ? t('checkout.cod') : order.paymentMethod === 'instapay' ? t('checkout.instapay') : t('checkout.visa')}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            order.paymentStatus === 'paid' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20' 
                              : 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/20'
                          }`}>
                            {t(`checkout.paymentStatuses.${order.paymentStatus || 'pending'}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center space-x-2 text-velmora-900 dark:text-velmora-400 font-bold text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform"
                    >
                      <span>{t('orders.viewDetails')}</span>
                      <ChevronRight className={`w-4 h-4 ${document.documentElement.dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedOrder(null); setIsEditing(false); setShowConfirmCancel(false); }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-velmora-800 z-[110] rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-velmora-100 dark:border-white/5"
            >
              <div className="p-8 border-b border-velmora-50 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold dark:text-white">{t('orders.viewDetails')}</h2>
                  <p className="text-xs font-mono text-velmora-400 uppercase tracking-widest mt-1">#{selectedOrder.id.toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => { setSelectedOrder(null); setIsEditing(false); setShowConfirmCancel(false); }}
                  className="p-3 bg-velmora-50 dark:bg-white/5 hover:bg-velmora-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {/* Tracking */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-400">{t('orders.status')}</h3>
                  <OrderTracking status={selectedOrder.status} />
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-400">{t('common.items')}</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center space-x-4 p-4 bg-velmora-50/50 dark:bg-white/5 rounded-2xl">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-20 object-cover rounded-xl border border-velmora-100 dark:border-white/10" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-velmora-100 dark:bg-white/10 rounded-xl flex items-center justify-center border border-velmora-100 dark:border-white/10">
                            <ImageIcon className="w-6 h-6 text-velmora-300" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-bold dark:text-white">{item.name}</p>
                          <p className="text-[10px] text-velmora-500 dark:text-velmora-400 uppercase tracking-widest">{item.size} / {item.color} x {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-400">{t('orders.shippingAddress')}</h3>
                      {selectedOrder.status === 'pending' && !isEditing && (
                        <button onClick={startEditing} className="text-velmora-600 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <form onSubmit={handleUpdateOrder} className="space-y-3">
                        <input 
                          type="text" 
                          value={editData.address}
                          onChange={e => setEditData({...editData, address: e.target.value})}
                          className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-velmora-900 outline-none dark:text-white"
                          placeholder={t('checkout.street')}
                        />
                        <input 
                          type="text" 
                          value={editData.city}
                          onChange={e => setEditData({...editData, city: e.target.value})}
                          className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-velmora-900 outline-none dark:text-white"
                          placeholder={t('checkout.city')}
                        />
                        <input 
                          type="tel" 
                          value={editData.phone}
                          onChange={e => setEditData({...editData, phone: e.target.value})}
                          className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-velmora-900 outline-none dark:text-white"
                          placeholder={t('checkout.mobile')}
                        />
                        <div className="flex space-x-2">
                          <button 
                            type="submit"
                            disabled={actionLoading}
                            className="flex-1 bg-velmora-900 dark:bg-white dark:text-black text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                          >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('common.save')}
                          </button>
                          <button 
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="flex-1 bg-velmora-100 dark:bg-white/10 text-velmora-900 dark:text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-4 bg-velmora-50/50 dark:bg-white/5 rounded-2xl space-y-2">
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-4 h-4 text-velmora-400 mt-1" />
                          <div className="text-sm text-velmora-600 dark:text-velmora-400">
                            <p className="font-bold text-velmora-900 dark:text-white">{selectedOrder.shippingAddress.fullName || selectedOrder.shippingAddress.name}</p>
                            <p>{selectedOrder.shippingAddress.address || selectedOrder.shippingAddress.street}</p>
                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.region || selectedOrder.shippingAddress.country}</p>
                            <p className="mt-2 text-xs font-mono">{selectedOrder.shippingAddress.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-400">{t('orders.paymentSummary')}</h3>
                    <div className="p-4 bg-velmora-50/50 dark:bg-white/5 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-velmora-500 dark:text-velmora-400">{t('checkout.payment')}</span>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-velmora-400" />
                          <div className="flex flex-col items-end">
                            <span className="font-bold uppercase tracking-widest text-xs dark:text-white">
                              {selectedOrder.paymentMethod === 'cod' ? t('checkout.cod') : selectedOrder.paymentMethod === 'instapay' ? t('checkout.instapay') : t('checkout.visa')}
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${
                              selectedOrder.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-orange-500'
                            }`}>
                              {t(`checkout.paymentStatuses.${selectedOrder.paymentStatus || 'pending'}`)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-velmora-500 dark:text-velmora-400">{t('cart.subtotal')}</span>
                        <span className="font-bold dark:text-white">{formatPrice(selectedOrder.totalPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-velmora-500 dark:text-velmora-400">{t('checkout.shipping')}</span>
                        <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">{t('product.freeShipping')}</span>
                      </div>
                      <div className="pt-3 border-t border-velmora-100 dark:border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest dark:text-white">{t('cart.total')}</span>
                        <span className="text-lg font-bold dark:text-white">{formatPrice(selectedOrder.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Notice */}
                {selectedOrder.status === 'pending' && (
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
                      <p className="font-bold mb-1">{t('orders.cancellationPolicy')}</p>
                      <p>{t('orders.cancellationPolicyDesc')}</p>
                    </div>
                  </div>
                )}

                {/* Return Notice */}
                {selectedOrder.status === 'completed' && isWithinReturnPeriod(selectedOrder.createdAt) && !selectedOrder.returnStatus && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex items-start space-x-3">
                    <RefreshCcw className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                      <p className="font-bold mb-1">{t('orders.returnPolicy')}</p>
                      <p>{t('orders.returnPeriod')}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.returnStatus && (
                  <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                    selectedOrder.returnStatus === 'completed' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-600'
                      : selectedOrder.returnStatus === 'rejected'
                      ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-600'
                      : 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/20 text-orange-600'
                  }`}>
                    <RefreshCcw className={`w-5 h-5 mt-0.5 ${selectedOrder.returnStatus === 'pending' ? 'animate-spin-slow' : ''}`} />
                    <div className="text-xs leading-relaxed">
                      <p className="font-bold mb-1">
                        {selectedOrder.returnStatus === 'pending' && t('orders.returnPending')}
                        {selectedOrder.returnStatus === 'approved' && t('orders.returnApproved')}
                        {selectedOrder.returnStatus === 'rejected' && t('orders.returnRejected')}
                        {selectedOrder.returnStatus === 'completed' && t('orders.returnCompleted')}
                      </p>
                      <p>{t('Return Status') || 'Your return request for this order is currently being processed by our team.'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {selectedOrder.status === 'pending' && (
                <div className="p-8 border-t border-velmora-50 dark:border-white/5 bg-velmora-50/20 dark:bg-white/5">
                  {showConfirmCancel ? (
                    <div className="space-y-4">
                      <p className="text-center text-xs font-bold uppercase tracking-widest text-red-500">{t('orders.confirmCancelTitle')}</p>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleCancelOrder(selectedOrder.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-red-500 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center disabled:opacity-50"
                        >
                          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('orders.cancelConfirm')}
                        </button>
                        <button 
                          onClick={() => setShowConfirmCancel(false)}
                          disabled={actionLoading}
                          className="flex-1 bg-velmora-100 dark:bg-white/10 text-velmora-900 dark:text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-200 transition-all"
                        >
                          {t('orders.keepOrder')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowConfirmCancel(true)}
                      disabled={actionLoading}
                      className="w-full bg-red-50 dark:bg-red-900/10 text-red-500 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {t('orders.cancelOrder')}
                    </button>
                  )}
                </div>
              )}

              {selectedOrder.status === 'completed' && isWithinReturnPeriod(selectedOrder.createdAt) && !selectedOrder.returnStatus && (
                <div className="p-8 border-t border-velmora-50 dark:border-white/5 bg-velmora-50/20 dark:bg-white/5">
                  <button 
                    onClick={() => setIsReturnModalOpen(true)}
                    className="w-full bg-velmora-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={16} />
                    {t('orders.requestReturn')}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Return Request Modal */}
      <AnimatePresence>
        {isReturnModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReturnModalOpen(false)}
              className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-velmora-800 rounded-[40px] shadow-2xl overflow-hidden border border-velmora-100 dark:border-white/5"
            >
              <div className="p-8 border-b border-velmora-50 dark:border-white/5 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-velmora-900 dark:text-white">{t('orders.requestReturn')}</h2>
                <button 
                  onClick={() => setIsReturnModalOpen(false)}
                  className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={24} className="text-velmora-400" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('orders.returnReason')}</label>
                  <textarea 
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder={t('orders.returnReasonPlaceholder')}
                    className="w-full px-6 py-4 bg-velmora-50 dark:bg-white/5 border-none rounded-3xl text-sm focus:ring-2 focus:ring-velmora-900 dark:focus:ring-white/20 outline-none dark:text-white min-h-[120px] resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('orders.attachImage') || 'Attach Image (Optional)'}</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="h-32 border-2 border-dashed border-velmora-100 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-velmora-50 dark:hover:bg-white/5 transition-colors overflow-hidden relative">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 animate-spin text-velmora-400" />
                        ) : returnImage ? (
                          <>
                            <img src={returnImage} alt="Return" className="w-full h-full object-cover" />
                            <button 
                              onClick={(e) => { e.preventDefault(); setReturnImage(null); }}
                              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-6 h-6 text-velmora-300" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('common.uploadImage') || 'Upload Image'}</span>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                  <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed font-medium">
                    {t('orders.returnPeriod')}
                  </p>
                </div>

                <button 
                  onClick={handleRequestReturn}
                  disabled={!returnReason || actionLoading}
                  className="w-full bg-velmora-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('orders.submitReturn')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;
