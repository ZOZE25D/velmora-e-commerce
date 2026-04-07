import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Package, Truck, CheckCircle2, MapPin, Calendar, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { FirestoreService } from '../services/FirestoreService';
import { useAppContext } from '../context/AppContext';

const OrderTracking: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useAppContext();
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [orderData, setOrderData] = useState<any>(null);
  const [searchedId, setSearchedId] = useState('');
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const setupListener = (docId: string) => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    
    unsubscribeRef.current = FirestoreService.subscribeToDocument('orders', docId, (data) => {
      if (data) {
        setOrderData(data);
        setStatus('success');
      } else {
        setStatus('error');
      }
    });
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputId = orderId.trim().replace('#', '');
    if (!inputId) return;

    setStatus('loading');
    setSearchedId(inputId);
    if (unsubscribeRef.current) unsubscribeRef.current();

    try {
      // 1. Try displayId (case-insensitive search) first as it's more common for users
      const q = query(
        collection(db, 'orders'), 
        where('displayId', '==', inputId.toUpperCase()),
        limit(1)
      );
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        setupListener(querySnap.docs[0].id);
        return;
      }

      // 2. Try full ID
      setupListener(inputId);
    } catch (error) {
      console.error('Tracking error:', error);
      setStatus('error');
    }
  };

  const getEstimatedDelivery = (createdAt: string) => {
    const date = new Date(createdAt);
    const start = new Date(date);
    start.setDate(date.getDate() + 3);
    const end = new Date(date);
    end.setDate(date.getDate() + 5);
    
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString(undefined, options)} - ${end.toLocaleDateString(undefined, options)}`;
  };

  const steps = [
    { label: t('orders.statuses.pending'), status: 'pending', icon: Package },
    { label: t('orders.statuses.confirmed'), status: 'confirmed', icon: CheckCircle2 },
    { label: t('orders.statuses.shipped'), status: 'shipped', icon: Truck },
    { label: t('orders.statuses.completed'), status: 'completed', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === orderData?.status);
  const isCancelled = orderData?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-velmora-50 dark:bg-velmora-950 transition-colors duration-300 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-display text-velmora-900 dark:text-white mb-6"
          >
            {t('tracking.title')}
          </motion.h1>
          <p className="text-velmora-700 dark:text-velmora-400 max-w-lg mx-auto">
            {t('tracking.desc')}
          </p>
        </header>

        <div className="bg-white dark:bg-velmora-900 rounded-3xl p-8 md:p-12 shadow-xl mb-12 border border-velmora-100 dark:border-velmora-800">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-velmora-400" size={20} />
              <input 
                type="text"
                placeholder={t('tracking.placeholder')}
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-velmora-50 dark:bg-velmora-800 border-none focus:ring-2 focus:ring-velmora-600 outline-none dark:text-white transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-velmora-200 transition-all flex items-center justify-center min-w-[160px]"
            >
              {status === 'loading' ? <Loader2 className="animate-spin" /> : t('tracking.button')}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {status === 'success' && orderData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Status Progress */}
                {isCancelled ? (
                  <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20 text-center">
                    <p className="text-red-500 font-bold uppercase tracking-widest text-sm">{t('tracking.cancelled')}</p>
                    <p className="text-red-400 text-xs mt-1">{t('tracking.cancelledDesc')}</p>
                  </div>
                ) : (
                  <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-velmora-100 dark:bg-velmora-800 -translate-y-1/2 z-0" />
                    <div 
                      className="absolute top-1/2 left-0 h-0.5 bg-velmora-900 dark:bg-white -translate-y-1/2 z-0 transition-all duration-1000" 
                      style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    />
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      
                      return (
                        <div key={step.label} className="relative z-10 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 border-2 ${
                            isActive 
                              ? 'bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 border-velmora-900 dark:border-white' 
                              : 'bg-white dark:bg-velmora-900 text-velmora-200 dark:text-velmora-700 border-velmora-100 dark:border-velmora-800'
                          }`}>
                            {isActive ? <CheckCircle2 size={18} className={isCurrent && orderData?.status === 'completed' ? 'text-green-500' : ''} /> : <Icon size={18} />}
                          </div>
                          <span className={`absolute -bottom-8 text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap ${
                            isActive ? 'text-velmora-900 dark:text-white' : 'text-velmora-300 dark:text-velmora-600'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-velmora-100 dark:border-velmora-800">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-velmora-50 dark:bg-velmora-800 flex items-center justify-center text-velmora-600">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-velmora-500 mb-1">{t('tracking.shippingAddress')}</h4>
                        <p className="text-sm dark:text-velmora-300">
                          {orderData.shippingAddress.name}<br />
                          {orderData.shippingAddress.address}, {orderData.shippingAddress.city}
                        </p>
                      </div>
                    </div>
                    {!isCancelled && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-velmora-50 dark:bg-velmora-800 flex items-center justify-center text-velmora-600">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-velmora-500 mb-1">{t('tracking.estimatedDelivery')}</h4>
                          <p className="text-sm dark:text-velmora-300">
                            {getEstimatedDelivery(orderData.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-velmora-50 dark:bg-velmora-800/50 p-6 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-velmora-500 mb-4">{t('tracking.summary')}</h4>
                    <div className="space-y-3">
                      {orderData.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="dark:text-velmora-400">{item.name} x {item.quantity}</span>
                          <span className="font-bold dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-velmora-200 dark:border-velmora-700 flex justify-between font-bold">
                        <span className="dark:text-white">{t('tracking.total')}</span>
                        <span className="text-velmora-900 dark:text-velmora-400">{formatPrice(orderData.totalPrice || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold dark:text-white mb-2">{t('tracking.notFound')}</h3>
                <p className="text-velmora-600 dark:text-velmora-400 text-sm">
                  {t('tracking.notFoundDesc', { id: searchedId })}
                </p>
              </motion.div>
            )}

            {status === 'idle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 opacity-30"
              >
                <Package size={80} className="mx-auto mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">{t('tracking.awaiting')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
