import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Globe, 
  Truck, 
  CreditCard, 
  Shield, 
  Bell, 
  Save, 
  Loader2,
  CheckCircle2,
  Percent,
  Package,
  Clock,
  AlertTriangle,
  MessageSquare,
  Coins
} from 'lucide-react';
import { FirestoreService } from '../../services/FirestoreService';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

const AdminSettings: React.FC = () => {
  const { t } = useTranslation();
  const { settings: globalSettings } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const [settings, setSettings] = useState({
    siteName: 'VELMORA',
    siteEmail: 'support@velmora.com',
    currency: 'EGP',
    currencySymbol: 'EGP',
    shippingFee: '0',
    freeShippingThreshold: '1000',
    regionFees: {} as Record<string, string>,
    enableCod: true,
    enableCard: false,
    enableInstaPay: false,
    instaPayAddress: '',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently under maintenance, please check back later.',
    // Tax Settings
    enableTax: false,
    taxPercentage: '14',
    pricesIncludeTax: true,
    // Order Settings
    defaultOrderStatus: 'pending',
    autoCancelUnpaidHours: '24',
    // Inventory Settings
    minStockThreshold: '5',
    highStockThreshold: '50',
    enableLowStockAlerts: true,
    // Notification Settings
    notifyAdminNewOrder: true,
    notifyAdminNewUser: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await FirestoreService.getSettings();
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await FirestoreService.updateSettings('general', settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-velmora-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.settings')}</h1>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm mt-1">{t('admin settings ')}</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-velmora-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 transition-all flex items-center space-x-2 shadow-lg shadow-velmora-900/20 disabled:opacity-50 rtl:space-x-reverse"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{t('common.save')}</span>
        </button>
      </div>

      {showSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-4 rounded-2xl flex items-center space-x-3 text-emerald-600 rtl:space-x-reverse"
        >
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-bold">{t('common.saveSuccess')}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Website Info */}
        <section className="bg-white dark:bg-velmora-900 p-8 rounded-3xl border border-velmora-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2 rtl:space-x-reverse">
            <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400 dark:text-velmora-500">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.settingsSection.website')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.siteName')}</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.siteEmail')}</label>
              <input 
                type="email" 
                value={settings.siteEmail}
                onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
                className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.currencyCode')}</label>
              <input 
                type="text" 
                value={settings.currency}
                onChange={(e) => setSettings({...settings, currency: e.target.value})}
                className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.currencySymbol')}</label>
              <input 
                type="text" 
                value={settings.currencySymbol}
                onChange={(e) => setSettings({...settings, currencySymbol: e.target.value})}
                className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
              />
            </div>
          </div>
        </section>

        {/* Taxation Settings */}
        <section className="bg-white dark:bg-velmora-900 p-8 rounded-3xl border border-velmora-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2 rtl:space-x-reverse">
            <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400 dark:text-velmora-500">
              <Percent className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.settingsSection.taxation')}</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10">
              <div>
                <p className="text-sm font-bold text-velmora-900 dark:text-white">{t('admin.settingsFields.enableTax')}</p>
                <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.settingsFields.enableTaxDesc')}</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, enableTax: !settings.enableTax})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.enableTax ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${settings.enableTax ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {settings.enableTax && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.taxPercentage')}</label>
                  <input 
                    type="number" 
                    value={settings.taxPercentage}
                    onChange={(e) => setSettings({...settings, taxPercentage: e.target.value})}
                    className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10">
                  <div>
                    <p className="text-sm font-bold text-velmora-900 dark:text-white">{t('admin.settingsFields.pricesIncludeTax')}</p>
                    <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.settingsFields.pricesIncludeTaxDesc')}</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, pricesIncludeTax: !settings.pricesIncludeTax})}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.pricesIncludeTax ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${settings.pricesIncludeTax ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Order Settings */}
        <section className="bg-white dark:bg-velmora-900 p-8 rounded-3xl border border-velmora-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2 rtl:space-x-reverse">
            <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400 dark:text-velmora-500">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.settingsSection.orders')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.defaultStatus')}</label>
              <select 
                value={settings.defaultOrderStatus}
                onChange={(e) => setSettings({...settings, defaultOrderStatus: e.target.value})}
                className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all appearance-none dark:text-white"
              >
                <option value="pending">{t('orders.statuses.pending')}</option>
                <option value="confirmed">{t('orders.statuses.confirmed')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.autoCancel')}</label>
              <input 
                type="number" 
                value={settings.autoCancelUnpaidHours}
                onChange={(e) => setSettings({...settings, autoCancelUnpaidHours: e.target.value})}
                className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
              />
            </div>
          </div>
        </section>

        {/* Inventory Settings */}
        <section className="bg-white dark:bg-velmora-900 p-8 rounded-3xl border border-velmora-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2 rtl:space-x-reverse">
            <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400 dark:text-velmora-500">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.settingsSection.inventory')}</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.lowStock')}</label>
                <input 
                  type="number" 
                  value={settings.minStockThreshold}
                  onChange={(e) => setSettings({...settings, minStockThreshold: e.target.value})}
                  className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">High Stock Threshold</label>
                <input 
                  type="number" 
                  value={settings.highStockThreshold}
                  onChange={(e) => setSettings({...settings, highStockThreshold: e.target.value})}
                  className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10 md:col-span-2">
                <div>
                  <p className="text-sm font-bold text-velmora-900 dark:text-white">{t('admin.settingsFields.lowStockAlert')}</p>
                  <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.settingsFields.lowStockAlertDesc')}</p>
                </div>
                <button 
                  onClick={() => setSettings({...settings, enableLowStockAlerts: !settings.enableLowStockAlerts})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.enableLowStockAlerts ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${settings.enableLowStockAlerts ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="bg-white dark:bg-velmora-900 p-8 rounded-3xl border border-velmora-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2 rtl:space-x-reverse">
            <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400 dark:text-velmora-500">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.settingsSection.notifications')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10">
              <div>
                <p className="text-sm font-bold text-velmora-900 dark:text-white">{t('admin.settingsFields.newOrderAlert')}</p>
                <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.settingsFields.newOrderAlertDesc')}</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, notifyAdminNewOrder: !settings.notifyAdminNewOrder})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.notifyAdminNewOrder ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${settings.notifyAdminNewOrder ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10">
              <div>
                <p className="text-sm font-bold text-velmora-900 dark:text-white">{t('admin.settingsFields.newUserAlert')}</p>
                <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.settingsFields.newUserAlertDesc')}</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, notifyAdminNewUser: !settings.notifyAdminNewUser})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.notifyAdminNewUser ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${settings.notifyAdminNewUser ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </section>

        {/* Shipping & Delivery */}
        <section className="bg-white dark:bg-velmora-900 p-8 rounded-3xl border border-velmora-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2 rtl:space-x-reverse">
            <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400 dark:text-velmora-500">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.settingsSection.shipping')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.defaultShippingFee')} ({settings.currencySymbol})</label>
              <input 
                type="number" 
                value={settings.shippingFee}
                onChange={(e) => setSettings({...settings, shippingFee: e.target.value})}
                className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.freeShipping')}</label>
              <input 
                type="number" 
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({...settings, freeShippingThreshold: e.target.value})}
                className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-velmora-100 dark:border-white/10">
            <h3 className="text-sm font-bold text-velmora-900 dark:text-white mb-4">{t('admin.settingsFields.regionBasedFees')}</h3>
            <p className="text-xs text-velmora-500 dark:text-velmora-400 mb-6">Override default shipping fee for specific regions. Leave empty to use default.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {EGYPT_REGIONS.map(region => (
                <div key={region.id} className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t(`checkout.regions.${region.id}`)}</label>
                  <input 
                    type="number" 
                    placeholder={settings.shippingFee}
                    value={settings.regionFees?.[region.id] || ''}
                    onChange={(e) => setSettings({
                      ...settings, 
                      regionFees: {
                        ...settings.regionFees,
                        [region.id]: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="bg-white dark:bg-velmora-900 p-8 rounded-3xl border border-velmora-200 dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2 rtl:space-x-reverse">
            <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400 dark:text-velmora-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.settingsSection.payments')}</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                  <Coins className="w-5 h-5 text-velmora-400 dark:text-velmora-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-velmora-900 dark:text-white">{t('checkout.cod')}</p>
                  <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.settingsFields.codDesc')}</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings({...settings, enableCod: !settings.enableCod})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.enableCod ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${settings.enableCod ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                  <CreditCard className="w-5 h-5 text-velmora-400 dark:text-velmora-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-velmora-900 dark:text-white">{t('checkout.visa')}</p>
                  <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.settingsFields.cardDesc')}</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings({...settings, enableCard: !settings.enableCard})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.enableCard ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${settings.enableCard ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-2 bg-white dark:bg-white/10 rounded-xl shadow-sm">
                  <Coins className="w-5 h-5 text-velmora-400 dark:text-velmora-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-velmora-900 dark:text-white">{t('checkout.instapay')}</p>
                  <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.settingsFields.instaPayDesc')}</p>
                </div>
              </div>
              <button 
                onClick={() => setSettings({...settings, enableInstaPay: !settings.enableInstaPay})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.enableInstaPay ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${settings.enableInstaPay ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {settings.enableInstaPay && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 pt-2"
              >
                <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">{t('admin.settingsFields.instaPayAddress')}</label>
                <input 
                  type="text" 
                  value={settings.instaPayAddress}
                  onChange={(e) => setSettings({...settings, instaPayAddress: e.target.value})}
                  className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
                  placeholder="e.g. username@instapay"
                />
              </motion.div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 dark:bg-red-900/10 p-8 rounded-3xl border border-red-100 dark:border-red-900/20 space-y-6">
          <div className="flex items-center space-x-3 mb-2 rtl:space-x-reverse">
            <div className="p-2 bg-white dark:bg-white/10 rounded-lg text-red-600 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-red-900 dark:text-red-500">{t('admin.settingsSection.danger')}</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-900 dark:text-red-500">{t('admin.settingsFields.maintenance')}</p>
                <p className="text-xs text-red-600/70 dark:text-red-400/70 font-medium">{t('admin.settingsFields.maintenanceDesc')}</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-red-600' : 'bg-red-200 dark:bg-red-900/30'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {settings.maintenanceMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 pt-2"
              >
                <label className="text-[10px] font-bold uppercase tracking-widest text-red-900/60 dark:text-red-400/60">{t('admin.settingsFields.maintenanceMsg')}</label>
                <textarea 
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-red-100 dark:border-red-900/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 transition-all resize-none text-red-900 dark:text-red-400"
                  placeholder={t('admin.settingsFields.maintenanceMsgPlaceholder')}
                />
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminSettings;
