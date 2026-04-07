import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { FirestoreService } from '../../services/FirestoreService';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';

const AdminPayments: React.FC = () => {
  const { formatPrice } = useAppContext();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await FirestoreService.getCollection('orders') as any[];
      setOrders(fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching orders for payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStatement = async () => {
    if (orders.length === 0) return;
    
    setIsDownloading(true);
    try {
      // Professional CSV Generation for Payments
      const headers = [
        'Transaction ID',
        'Customer Email',
        'Date',
        'Amount (EGP)',
        'Payment Method',
        'Status',
        'Order Reference'
      ];

      const rows = orders.map(order => [
        `"TRX-${order.id?.slice(-8).toUpperCase()}"`,
        `"${order.email || ''}"`,
        `"${order.createdAt ? new Date(order.createdAt).toISOString().replace('T', ' ').split('.')[0] : ''}"`,
        order.totalPrice || 0,
        `"${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'instapay' ? 'InstaPay' : 'Visa/Card'}"`,
        `"${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}"`,
        `"${order.id}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `velmora_statement_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      // Artificial delay for professional feel
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const pendingRevenue = orders.filter(o => o.paymentStatus !== 'paid').reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const completedRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((acc, o) => acc + (o.totalPrice || 0), 0);

  const filteredOrders = orders.filter(o => {
    const trxId = `TRX-${o.id?.slice(-8).toUpperCase()}`;
    const paymentMethodText = o.paymentMethod === 'cod' ? 'Cash on Delivery' : o.paymentMethod === 'instapay' ? 'InstaPay' : 'Visa/Card';
    return o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           trxId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           o.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           o.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           paymentMethodText.toLowerCase().includes(searchTerm.toLowerCase()) ||
           o.totalPrice?.toString().includes(searchTerm);
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.payments') || 'Payment History'}</h1>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm mt-1">Monitor transactions and revenue performance.</p>
        </div>
        <button 
          onClick={handleDownloadStatement}
          disabled={isDownloading || orders.length === 0}
          className="bg-velmora-900 dark:bg-white dark:text-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 dark:hover:bg-velmora-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-lg shadow-velmora-900/20"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('common.loading')}...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>{t('admin.exportCSV') || 'Download Statement'}</span>
            </>
          )}
        </button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('TOTAL REVENUE') || 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
          { label: t('COMPLETED PAYMENTS') || 'Completed Payments', value: formatPrice(completedRevenue), icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: t('PENDING PAYMENTS') || 'Pending Payments', value: formatPrice(pendingRevenue), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-velmora-900 p-6 rounded-3xl border border-velmora-100 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-velmora-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-velmora-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-velmora-900 rounded-3xl border border-velmora-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-velmora-100 dark:border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.recentTransactions') || 'Recent Transactions'}</h2>
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400" />
            <input 
              type="text" 
              placeholder={t('common.search') + "..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-2.5 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-velmora-50/50 dark:bg-white/5">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('Transaction ID') || 'Transaction ID'}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.customer')}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.date')}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('Amount') || 'Amount'}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.paymentMethod')}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-velmora-100 dark:divide-white/5">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-velmora-900 dark:text-white">#TRX-{order.id?.slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-velmora-900 dark:text-white">{order.shippingAddress?.name || order.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-velmora-500 font-medium">{order.shippingAddress?.email || order.email}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-medium text-velmora-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-velmora-900 dark:text-white">{formatPrice(order.totalPrice)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-velmora-400" />
                      <span className="text-xs font-medium text-velmora-600 dark:text-velmora-400">
                        {order.paymentMethod === 'cod' ? t('checkout.cod') : order.paymentMethod === 'instapay' ? t('checkout.instapay') : t('checkout.visa')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20' 
                        : 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/20'
                    }`}>
                      {t(`checkout.paymentStatuses.${order.paymentStatus || 'pending'}`)}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-velmora-500">
                    <div className="flex flex-col items-center space-y-4">
                      <CreditCard className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">No transactions found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
