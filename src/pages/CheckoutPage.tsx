import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, CheckCircle2, Loader2, Copy, Check, Phone, Lock, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { FirestoreService } from '../services/FirestoreService';

const EGYPT_REGIONS = [
  { id: 'cairo', name: 'Cairo' },
  { id: 'giza', name: 'Giza' },
  { id: 'alexandria', name: 'Alexandria' },
  { id: 'dakahlia', name: 'Dakahlia' },
  { id: 'red_sea', name: 'Red Sea' },
  { id: 'beheira', name: 'Beheira' },
  { id: 'fayoum', name: 'Fayoum' },
  { id: 'gharbia', name: 'Gharbia' },
  { id: 'ismailia', name: 'Ismailia' },
  { id: 'monufia', name: 'Monufia' },
  { id: 'minya', name: 'Minya' },
  { id: 'qalyubia', name: 'Qalyubia' },
  { id: 'new_valley', name: 'New Valley' },
  { id: 'suez', name: 'Suez' },
  { id: 'aswan', name: 'Aswan' },
  { id: 'assiut', name: 'Assiut' },
  { id: 'beni_suef', name: 'Beni Suef' },
  { id: 'port_said', name: 'Port Said' },
  { id: 'damietta', name: 'Damietta' },
  { id: 'sharkia', name: 'Sharkia' },
  { id: 'south_sinai', name: 'South Sinai' },
  { id: 'kafr_el_sheikh', name: 'Kafr El Sheikh' },
  { id: 'matrouh', name: 'Matrouh' },
  { id: 'luxor', name: 'Luxor' },
  { id: 'qena', name: 'Qena' },
  { id: 'north_sinai', name: 'North Sinai' },
  { id: 'sohag', name: 'Sohag' },
];

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, cart, cartTotal, clearCart, setIsAuthOpen, formatPrice, calculateFinalPrice, settings } = useAppContext();
  const { product, selectedSize, selectedColor, discount = 0 } = location.state || {};
  
  const checkoutItems = product 
    ? [{ ...product, price: calculateFinalPrice(product), quantity: 1, selectedSize, selectedColor }] 
    : cart;

  const subtotal = product ? calculateFinalPrice(product) : cartTotal;
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'instapay' | 'cod'>('visa');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.name || '',
    phone: profile?.phone || '',
    region: profile?.country === 'Egypt' ? 'cairo' : '',
    city: profile?.city || '',
    street: profile?.address || '',
    email: user?.email || ''
  });

  // Dynamic shipping calculation
  const getShippingFee = () => {
    const threshold = parseFloat(settings.freeShippingThreshold) || 0;
    if (threshold > 0 && subtotal >= threshold) return 0;
    
    const regionFee = settings.regionFees?.[formData.region];
    if (regionFee !== undefined && regionFee !== '' && regionFee !== null) {
      return parseFloat(regionFee) || 0;
    }
    
    return parseFloat(settings.shippingFee) || 0;
  };

  const shippingFee = getShippingFee();
  
  const taxRate = settings.enableTax ? parseFloat(settings.taxPercentage || '0') / 100 : 0;
  let taxAmount = 0;
  let subtotalBeforeTax = subtotal;

  if (settings.enableTax) {
    if (settings.pricesIncludeTax) {
      taxAmount = subtotal - (subtotal / (1 + taxRate));
      subtotalBeforeTax = subtotal - taxAmount;
    } else {
      taxAmount = subtotal * taxRate;
    }
  }

  const total = (settings.pricesIncludeTax ? subtotal : (subtotal + taxAmount)) - discount + shippingFee;

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.name || prev.fullName,
        phone: profile.phone || prev.phone,
        street: profile.address || prev.street,
        city: profile.city || prev.city,
        email: user?.email || prev.email
      }));
    }
  }, [profile, user]);

  if (!user) {
    return (
      <div className="pt-40 pb-24 px-6 bg-white dark:bg-zinc-950 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-velmora-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-8">
          <Lock className="w-10 h-10 text-velmora-900 dark:text-velmora-400" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4 dark:text-white">{t('checkout.loginRequired')}</h2>
        <p className="text-black/60 dark:text-white/60 mb-8 max-w-md mx-auto">
          {t('checkout.loginDesc')}
        </p>
        <button 
          onClick={() => setIsAuthOpen(true)}
          className="bg-velmora-900 text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-velmora-800 transition-all shadow-xl shadow-velmora-900/20"
        >
          {t('auth.signIn')}
        </button>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="pt-40 pb-24 text-center dark:bg-zinc-950 min-h-screen">
        <h2 className="text-2xl font-display font-bold mb-4 dark:text-white">{t('cart.empty')}</h2>
        <button onClick={() => navigate('/')} className="text-velmora-900 dark:text-velmora-400 underline font-bold uppercase tracking-widest text-xs">
          {t('common.continueShopping')}
        </button>
      </div>
    );
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Max 2MB.');
        return;
      }
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompletePurchase = async () => {
    if (paymentMethod === 'instapay' && !paymentScreenshot) {
      alert(t('checkout.screenshotRequired'));
      return;
    }
    setIsProcessing(true);
    try {
      // 1. Verify stock for all items
      const stockChecks = await Promise.all(checkoutItems.map(async (item) => {
        const latestProduct = await FirestoreService.getDocument('products', item.id) as any;
        if (!latestProduct) return { id: item.id, name: item.name, available: false, stock: 0 };
        return { 
          id: item.id, 
          name: item.name, 
          available: (latestProduct.stock || 0) >= (item.quantity || 1),
          stock: latestProduct.stock || 0
        };
      }));

      const outOfStockItems = stockChecks.filter(check => !check.available);
      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map(i => i.name).join(', ');
        alert(`${t('common.outOfStockAlert') || 'Some items are out of stock:'} ${itemNames}`);
        setIsProcessing(false);
        return;
      }

      const displayId = 'VL' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const supplierIds = Array.from(new Set(checkoutItems.map(item => item.supplierId).filter(Boolean)));
      
      const orderData = {
        userId: user.uid,
        displayId: displayId,
        supplierIds: supplierIds,
        items: checkoutItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity || 1,
          size: item.selectedSize || null,
          color: item.selectedColor || null,
          supplierId: item.supplierId || null
        })),
        totalPrice: total,
        paymentMethod: paymentMethod,
        paymentScreenshot: paymentScreenshot,
        paymentStatus: 'pending',
        status: 'pending',
        shippingAddress: {
          name: formData.fullName,
          address: formData.street,
          city: formData.city,
          region: formData.region,
          phone: formData.phone,
          email: formData.email
        },
        createdAt: new Date().toISOString()
      };

      const id = await FirestoreService.addDocument('orders', orderData);
      setOrderId(id || 'VL-' + Math.floor(Math.random() * 90000));
      
      // Decrement stock for each item
      await Promise.all(checkoutItems.map(item => 
        FirestoreService.decrementProductStock(item.id, item.quantity || 1)
      ));

      // Add notification for admin
      await FirestoreService.addNotification({
        title: 'New Order Received',
        message: `Order #${displayId} placed by ${formData.fullName} for ${formatPrice(total)}`,
        type: 'order',
        link: '/admin/orders'
      });

      clearCart();
      setStep(3);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 bg-velmora-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-velmora-500 hover:text-velmora-900 dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">{t('common.back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-8">
            {step < 3 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5"
              >
                <div className="flex items-center space-x-4 mb-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-velmora-900 text-white' : 'bg-velmora-100 dark:bg-white/5 text-velmora-400'}`}>1</div>
                  <div className="h-px w-12 bg-velmora-100 dark:bg-white/5"></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-velmora-900 text-white' : 'bg-velmora-100 dark:bg-white/5 text-velmora-400'}`}>2</div>
                </div>

                {step === 1 ? (
                  <form onSubmit={handleNext} className="space-y-6">
                    <h2 className="text-2xl font-display font-bold mb-6 dark:text-white">{t('checkout.shipping')}</h2>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500">{t('profile.fullName')}</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full bg-velmora-50 dark:bg-white/5 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-velmora-900 transition-all outline-none dark:text-white" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500">{t('profile.phone')}</label>
                        <input 
                          required 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-velmora-50 dark:bg-white/5 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-velmora-900 transition-all outline-none dark:text-white" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500">{t('profile.email')}</label>
                        <input 
                          required 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-velmora-50 dark:bg-white/5 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-velmora-900 transition-all outline-none dark:text-white" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500">{t('checkout.region')}</label>
                        <select 
                          required
                          value={formData.region}
                          onChange={(e) => setFormData({...formData, region: e.target.value})}
                          className="w-full bg-velmora-50 dark:bg-white/5 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-velmora-900 transition-all outline-none dark:text-white appearance-none"
                        >
                          <option value="">{t('checkout.selectRegion')}</option>
                          {EGYPT_REGIONS.map(region => (
                            <option key={region.id} value={region.id}>{t(`checkout.regions.${region.id}`)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500">{t('profile.city')}</label>
                        <input 
                          required 
                          type="text" 
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full bg-velmora-50 dark:bg-white/5 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-velmora-900 transition-all outline-none dark:text-white" 
                          placeholder={t('checkout.enterCity')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500">{t('checkout.street')}</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.street}
                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                        className="w-full bg-velmora-50 dark:bg-white/5 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-velmora-900 transition-all outline-none dark:text-white" 
                        placeholder={t('checkout.streetAddressPlaceholder')}
                      />
                    </div>

                    <button type="submit" className="w-full bg-velmora-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 transition-all mt-8">
                      {t('checkout.continueToPayment')}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-display font-bold mb-6 dark:text-white">{t('checkout.payment')}</h2>
                    <div className="space-y-4">
                      <label 
                        className={`flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'visa' ? 'border-velmora-900 bg-velmora-50 dark:bg-white/5' : 'border-velmora-100 dark:border-white/10 hover:bg-velmora-50 dark:hover:bg-white/5'}`}
                        onClick={() => setPaymentMethod('visa')}
                      >
                        <input type="radio" name="payment" checked={paymentMethod === 'visa'} readOnly className="w-5 h-5 accent-velmora-900" />
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold dark:text-white">{t('checkout.visa')}</span>
                            <div className="flex space-x-2">
                              <CreditCard className="w-5 h-5 text-velmora-400" />
                            </div>
                          </div>
                        </div>
                      </label>
                      {settings.enableInstaPay && (
                        <label 
                          className={`flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'instapay' ? 'border-velmora-900 bg-velmora-50 dark:bg-white/5' : 'border-velmora-100 dark:border-white/10 hover:bg-velmora-50 dark:hover:bg-white/5'}`}
                          onClick={() => setPaymentMethod('instapay')}
                        >
                          <input type="radio" name="payment" checked={paymentMethod === 'instapay'} readOnly className="w-5 h-5 accent-velmora-900" />
                          <div className="ml-4">
                            <span className="font-bold dark:text-white">{t('checkout.instapay')}</span>
                          </div>
                        </label>
                      )}
                      <label 
                        className={`flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-velmora-900 bg-velmora-50 dark:bg-white/5' : 'border-velmora-100 dark:border-white/10 hover:bg-velmora-50 dark:hover:bg-white/5'}`}
                        onClick={() => setPaymentMethod('cod')}
                      >
                        <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly className="w-5 h-5 accent-velmora-900" />
                        <div className="ml-4">
                          <span className="font-bold dark:text-white">{t('checkout.cod')}</span>
                        </div>
                      </label>
                    </div>

                    {paymentMethod === 'visa' && (
                      <div className="space-y-4 pt-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500">{t('checkout.cardNumber')}</label>
                          <div className="relative">
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-velmora-50 dark:bg-white/5 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-velmora-900 transition-all outline-none dark:text-white" />
                            <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-velmora-300" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500">{t('checkout.expiryDate')}</label>
                            <input type="text" placeholder="MM/YY" className="w-full bg-velmora-50 dark:bg-white/5 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-velmora-900 transition-all outline-none dark:text-white" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-500">{t('checkout.cvv')}</label>
                            <input type="text" placeholder="123" className="w-full bg-velmora-50 dark:bg-white/5 border-none rounded-xl py-4 px-6 focus:ring-2 focus:ring-velmora-900 transition-all outline-none dark:text-white" />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'instapay' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 pt-6"
                      >
                        <div className="bg-velmora-900 text-white p-8 rounded-3xl space-y-6 shadow-xl shadow-velmora-900/20">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{t('checkout.instapayAddress')}</p>
                              <h3 className="text-2xl font-bold tracking-tight">{settings.instaPayAddress || 'velmora@instapay'}</h3>
                            </div>
                            <div className="p-3 bg-white/10 rounded-2xl">
                              <Phone className="w-5 h-5" />
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(settings.instaPayAddress || 'velmora@instapay');
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="flex-1 bg-white text-velmora-900 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-50 transition-all flex items-center justify-center"
                            >
                              {copied ? (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  {t('checkout.copied')}
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-2" />
                                  {t('checkout.copyAddress')}
                                </>
                              )}
                            </button>
                          </div>

                          <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-3">{t('checkout.howToPay')}</p>
                            <ul className="space-y-3">
                              <li className="flex items-start space-x-3 text-xs opacity-80">
                                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold mt-0.5">1</div>
                                <span>{t('checkout.openInstapay')}</span>
                              </li>
                              <li className="flex items-start space-x-3 text-xs opacity-80">
                                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold mt-0.5">2</div>
                                <span>{t('checkout.transferExactly')} <span className="font-bold">{formatPrice(total)}</span> {t('checkout.transferToAddress')}</span>
                              </li>
                              <li className="flex items-start space-x-3 text-xs opacity-80">
                                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold mt-0.5">3</div>
                                <span>{t('checkout.clickComplete')}</span>
                              </li>
                            </ul>
                          </div>

                          <div className="pt-6 border-t border-white/10 space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('checkout.uploadScreenshot')}</p>
                            <div className="relative group">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className={`w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all ${paymentScreenshot ? 'border-green-400 bg-green-400/10' : 'border-white/20 group-hover:border-white/40 bg-white/5'}`}>
                                {isUploading ? (
                                  <Loader2 className="w-6 h-6 animate-spin" />
                                ) : paymentScreenshot ? (
                                  <>
                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('common.success')}</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="w-6 h-6 opacity-40" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('checkout.uploadScreenshot')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {paymentScreenshot && (
                              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                                <img src={paymentScreenshot} alt="Screenshot" className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => setPaymentScreenshot(null)}
                                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-all"
                                >
                                  <ArrowLeft className="w-3 h-3 rotate-45" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <button 
                      onClick={handleCompletePurchase}
                      disabled={isProcessing}
                      className="w-full bg-velmora-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 transition-all mt-8 shadow-xl shadow-velmora-900/20 flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {t('checkout.processing')}
                        </>
                      ) : (
                        t('checkout.complete')
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-zinc-900 p-12 md:p-20 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5 text-center space-y-8"
              >
                <div className="w-24 h-24 bg-green-50 dark:bg-green-900/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-display font-bold dark:text-white">{t('checkout.success')}</h2>
                  <p className="text-velmora-500 dark:text-velmora-400">{t('checkout.orderPlaced', { id: orderId })}</p>
                </div>
                <div className="bg-velmora-50 dark:bg-white/5 p-6 rounded-2xl text-left space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest dark:text-white">{t('checkout.summary')}</p>
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm dark:text-white/80">
                      <span>{item.name} x {item.quantity || 1}</span>
                      <span className="font-bold">{formatPrice(item.price * (item.quantity || 1))}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-velmora-100 dark:border-white/10 flex justify-between font-bold dark:text-white">
                    <span>{t('checkout.totalPaid')}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => navigate('/orders')}
                    className="w-full bg-white dark:bg-zinc-800 border-2 border-velmora-900 dark:border-white text-velmora-900 dark:text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-50 dark:hover:bg-zinc-700 transition-all"
                  >
                    {t('profile.orders')}
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full bg-velmora-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-velmora-800 transition-all"
                  >
                    {t('common.continueShopping')}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest border-b border-velmora-50 dark:border-white/5 pb-4 dark:text-white">{t('checkout.summary')}</h3>
              
              <div className="space-y-6">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex space-x-4">
                    <div className="w-16 h-20 bg-velmora-50 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-velmora-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-[13px] font-bold leading-tight dark:text-white">{item.name}</h4>
                      <p className="text-[9px] text-velmora-500 dark:text-velmora-400 uppercase tracking-widest mt-1">
                        {item.selectedColor || 'N/A'} / {item.selectedSize || 'N/A'} x {item.quantity || 1}
                      </p>
                      <p className="text-xs font-bold mt-1 dark:text-white">{formatPrice(item.price * (item.quantity || 1))}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-velmora-50 dark:border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-velmora-500 dark:text-velmora-400">{t('cart.subtotal')}</span>
                  <span className="font-bold dark:text-white">{formatPrice(subtotalBeforeTax)}</span>
                </div>
                {settings.enableTax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-velmora-500 dark:text-velmora-400">
                      {t('TAX')} ({settings.taxPercentage}%)
                      {settings.pricesIncludeTax && <span className="text-[10px] ml-1 opacity-60">({t('admin.included')})</span>}
                    </span>
                    <span className="font-bold dark:text-white">{formatPrice(taxAmount)}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('checkout.discount')}</span>
                    <span className="font-bold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-velmora-500 dark:text-velmora-400">{t('footer.shipping')}</span>
                  <span className="font-bold dark:text-white">{formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-velmora-50 dark:border-white/5">
                  <span className="dark:text-white">{t('cart.total')}</span>
                  <span className="dark:text-white">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-velmora-500 dark:text-velmora-400">
                <Truck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('checkout.expressDelivery')}</span>
              </div>
              <div className="flex items-center space-x-3 text-velmora-500 dark:text-velmora-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('checkout.secureSsl')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

