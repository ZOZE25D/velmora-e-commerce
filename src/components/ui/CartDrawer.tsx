import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard, Wallet, Truck, Lock, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

const CartDrawer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    cart, removeFromCart, updateQuantity, cartTotal, 
    isCartOpen, setIsCartOpen, user, setIsAuthOpen, formatPrice,
    calculateFinalPrice, isOnSale, settings
  } = useAppContext();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'VELMORA10') {
      setDiscount(cartTotal * 0.1);
    } else {
      alert('Invalid coupon');
    }
  };

  const taxRate = settings.enableTax ? parseFloat(settings.taxPercentage || '0') / 100 : 0;
  let taxAmount = 0;
  
  if (settings.enableTax) {
    if (settings.pricesIncludeTax) {
      taxAmount = cartTotal - (cartTotal / (1 + taxRate));
    } else {
      taxAmount = cartTotal * taxRate;
    }
  }

  const finalTotal = (settings.pricesIncludeTax ? cartTotal : (cartTotal + taxAmount)) - discount;

  const handleCheckout = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsCartOpen(false);
    navigate('/checkout', { state: { discount } });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-velmora-900 z-[110] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-5 h-5 dark:text-white" />
                <h2 className="text-xl font-display font-bold dark:text-white uppercase">
                   {t('cart.title')} ({cart.length})
                </h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-velmora-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-velmora-400" />
                  </div>
                  <p className="text-velmora-600 dark:text-velmora-400">{t('cart.empty')}</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="text-sm font-bold uppercase tracking-widest border-b border-black dark:border-white pb-1 dark:text-white"
                  >
                    {t('common.continueShopping')}
                  </button>
                </div>
              ) : (
                cart.map((item) => {
                  const itemOnSale = isOnSale(item.id.toString());
                  const itemFinalPrice = calculateFinalPrice(item);
                  
                  return (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex space-x-4">
                      <div className="w-24 h-32 bg-velmora-100 dark:bg-white/5 overflow-hidden rounded-xl">
                        {(item.image || (item.images && item.images.length > 0)) ? (
                          <img 
                            src={item.image || item.images?.[0]} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-velmora-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold leading-tight dark:text-white">{item.name}</h3>
                            <button 
                              onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                              className="text-velmora-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[10px] uppercase tracking-widest text-velmora-500 dark:text-velmora-400 mt-1">
                            {item.category} {item.selectedSize && `• ${item.selectedSize}`} {item.selectedColor && `• ${item.selectedColor}`}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div className="flex items-center border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors dark:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold dark:text-white">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors dark:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            {itemOnSale ? (
                              <>
                                <p className="text-sm font-bold text-red-600">{formatPrice(itemFinalPrice * item.quantity)}</p>
                                <p className="text-[10px] text-black/30 dark:text-white/30 line-through">{formatPrice(item.price * item.quantity)}</p>
                              </>
                            ) : (
                              <p className="text-sm font-bold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-black/5 dark:border-white/5 bg-velmora-50 dark:bg-velmora-950/50 space-y-4">
                {/* Coupon */}
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Coupon Code (VELMORA10)"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-white dark:bg-velmora-800 border border-black/10 dark:border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-velmora-900 transition-colors dark:text-white"
                  />
                  <button 
                    onClick={applyCoupon}
                    className="bg-velmora-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-velmora-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-velmora-600 dark:text-velmora-400">{t('cart.subtotal')}</span>
                    <span className="dark:text-white">{formatPrice(settings.pricesIncludeTax ? cartTotal - taxAmount : cartTotal)}</span>
                  </div>
                  {settings.enableTax && (
                    <div className="flex justify-between text-sm">
                      <span className="text-velmora-600 dark:text-velmora-400">
                        {t('TAX')} ({settings.taxPercentage}%)
                        {settings.pricesIncludeTax && <span className="text-[10px] ml-1 opacity-60">({t('admin.included')})</span>}
                      </span>
                      <span className="dark:text-white">{formatPrice(taxAmount)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount (10%)</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-velmora-600 dark:text-velmora-400">Shipping</span>
                    <span className="text-xs uppercase tracking-widest font-bold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-display font-bold pt-2 border-t border-black/5 dark:border-white/5">
                    <span className="dark:text-white">{t('cart.total')}</span>
                    <span className="dark:text-white">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {!user && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl flex items-start space-x-3">
                    <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
                    <p className="text-[10px] text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                      {t('checkout.loginDesc')}
                    </p>
                  </div>
                )}

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-velmora-900 text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-velmora-800 transition-all transform active:scale-[0.98] shadow-lg flex items-center justify-center"
                >
                  {!user && <Lock className="w-4 h-4 mr-2" />}
                  {user ? t('cart.checkout') : t('auth.signIn')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
