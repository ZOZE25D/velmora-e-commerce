import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical, 
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronDown,
  Mail,
  User,
  Phone,
  MapPin,
  Calendar,
  X,
  Image as ImageIcon,
  RefreshCcw,
  Trash2
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { FirestoreService } from '../../services/FirestoreService';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const AdminOrders: React.FC = () => {
  const { formatPrice, language } = useAppContext();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await FirestoreService.getCollection('orders') as any[];
      setOrders(fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    if (orders.length === 0) return;
    
    setIsExporting(true);
    try {
      // Professional CSV Generation
      const headers = [
        t('admin.orderID'),
        'Display ID',
        t('admin.email'),
        t('admin.phone'),
        t('admin.date'),
        'Total Price (EGP)',
        t('admin.status'),
        'Items Count',
        t('admin.address'),
        'City',
        'Region'
      ];

      const rows = orders.map(order => [
        `"${order.id}"`,
        `"${order.displayId || order.id?.slice(-6).toUpperCase()}"`,
        `"${order.shippingAddress?.email || order.email || ''}"`,
        `"${order.shippingAddress?.phone || order.phone || ''}"`,
        `"${order.createdAt ? new Date(order.createdAt).toISOString().replace('T', ' ').split('.')[0] : ''}"`,
        order.totalPrice || 0,
        `"${order.status || 'pending'}"`,
        order.items?.length || 0,
        `"${(order.shippingAddress?.address || order.address || '').replace(/"/g, '""')}"`,
        `"${order.shippingAddress?.city || order.city || ''}"`,
        `"${order.shippingAddress?.region || order.country || ''}"`
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
      link.setAttribute('download', `velmora_orders_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      // Artificial delay for professional feel
      setTimeout(() => setIsExporting(false), 800);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const order = orders.find(o => o.id === orderId);
      const updateData: any = { status: newStatus };
      
      // If order is completed and payment is COD, mark as paid
      if (newStatus === 'completed' && order?.paymentMethod === 'cod') {
        updateData.paymentStatus = 'paid';
      }

      await FirestoreService.updateDocument('orders', orderId, updateData);
      await fetchOrders();
      toast.success(t('Order Update Success') || 'Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(t('Orders Update Error') || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      await FirestoreService.updateDocument('orders', orderId, { paymentStatus: 'paid' });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: 'paid' });
      }
      await fetchOrders();
      toast.success(t('Orders Payment Success') || 'Payment confirmed successfully');
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error(t('Orders.paymentError') || 'Failed to confirm payment');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    console.log('Deleting order:', id);
    setUpdatingId(id);
    try {
      await FirestoreService.deleteDocument('orders', id);
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(null);
      }
      setOrderToDelete(null);
      await fetchOrders();
      toast.success(t('Orders Delete Success') || 'Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(t('Orders.deleteError') || 'Failed to delete order');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const email = o.shippingAddress?.email || o.email || '';
    const phone = o.shippingAddress?.phone || o.phone || '';
    const name = o.shippingAddress?.name || '';
    
    const matchesSearch = o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.status?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'returns' ? !!o.returnStatus : o.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20';
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20';
      case 'shipped': return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-900/20';
      case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/20';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20';
      default: return 'bg-velmora-50 text-velmora-600 border-velmora-100 dark:bg-white/5 dark:text-velmora-400 dark:border-white/10';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">{t('Orders')}</h1>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm mt-1">{t('admin.trackManage')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportCSV}
            disabled={isExporting || orders.length === 0}
            className="px-6 py-3 bg-white dark:bg-velmora-900 border border-velmora-200 dark:border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{t('admin.exporting')}</span>
              </>
            ) : (
              <span>{t('admin.exportCSV')}</span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('admin.stats.pending'), count: orders.filter(o => o.status === 'pending').length, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10' },
          { label: t('admin.stats.confirmed'), count: orders.filter(o => o.status === 'confirmed').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/10' },
          { label: t('admin.stats.shipped'), count: orders.filter(o => o.status === 'shipped').length, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/10' },
          { label: t('admin.stats.completed'), count: orders.filter(o => o.status === 'completed').length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-velmora-900 p-4 rounded-2xl border border-velmora-100 dark:border-white/5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-velmora-900 dark:text-white">{stat.count}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <div className={`w-2 h-2 rounded-full ${stat.color.replace('text', 'bg')}`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-velmora-900 p-4 rounded-2xl border border-velmora-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400`} />
          <input 
            type="text" 
            placeholder={t('admin.searchPlaceholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${language === 'ar' ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white`}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-velmora-400 hover:text-velmora-600 dark:hover:text-velmora-200 transition-colors`}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400`} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`appearance-none ${language === 'ar' ? 'pr-12 pl-10' : 'pl-12 pr-10'} py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white transition-all outline-none cursor-pointer`}
            >
              <option value="all">{t('common.all')}</option>
              <option value="pending">{t('admin.stats.pending')}</option>
              <option value="confirmed">{t('admin.stats.confirmed')}</option>
              <option value="shipped">{t('admin.stats.shipped')}</option>
              <option value="completed">{t('admin.stats.completed')}</option>
              <option value="cancelled">{t('common.cancel')}</option>
              <option value="returns">{t('admin.returns')}</option>
            </select>
            <ChevronDown className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-3 h-3 text-velmora-400 pointer-events-none`} />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-velmora-900 rounded-3xl border border-velmora-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-velmora-50/50 dark:bg-white/5">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.orderID')}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.customer')}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.date')}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.total')}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.status')}</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-velmora-100 dark:divide-white/5">
              {filteredOrders.map((order) => {
                const email = order.shippingAddress?.email || order.email || '';
                const name = order.shippingAddress?.name || email.split('@')[0];
                return (
                  <tr key={order.id} className="hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-velmora-900 dark:text-white">#{order.displayId || order.id?.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] text-velmora-400 font-mono mt-0.5">{order.id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-velmora-900 dark:text-white">{order.shippingAddress?.name || order.customerName || name}</span>
                        <span className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2 text-velmora-500 dark:text-velmora-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-xs font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-velmora-900 dark:text-white">{formatPrice(order.totalPrice)}</p>
                      <p className="text-[10px] text-velmora-400 font-medium">{order.items?.length || 0} {t('admin.items')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className={`appearance-none pl-4 pr-10 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest outline-none border transition-all cursor-pointer ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">{t('admin.stats.pending')}</option>
                            <option value="confirmed">{t('admin.stats.confirmed')}</option>
                            <option value="shipped">{t('admin.stats.shipped')}</option>
                            <option value="completed">{t('admin.stats.completed')}</option>
                            <option value="cancelled">{t('common.cancel')}</option>
                          </select>
                          <ChevronDown className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50`} />
                        </div>
                        {order.returnStatus && (
                          <div className="px-3 py-1 bg-orange-50 dark:bg-orange-900/10 text-orange-600 border border-orange-100 dark:border-orange-900/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            <RefreshCcw size={10} />
                            Return {order.returnStatus}
                          </div>
                        )}
                      </div>
                      {updatingId === order.id && (
                        <div className={`absolute ${language === 'ar' ? '-left-6' : '-right-6'} top-1/2 -translate-y-1/2`}>
                          <Loader2 className="w-3 h-3 animate-spin text-velmora-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-lg transition-colors text-velmora-400 hover:text-velmora-900 dark:hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToDelete(order);
                          }}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-velmora-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-velmora-500 dark:text-velmora-400">
                    <div className="flex flex-col items-center space-y-4">
                      <ShoppingBag className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">{t('common.no_results')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-velmora-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-velmora-100 dark:border-white/5 flex justify-between items-center bg-velmora-50/50 dark:bg-white/5">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-2xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.orderDetails')}</h2>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-velmora-500 dark:text-velmora-400 font-medium">{t('admin.orderID')}: {selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-colors text-velmora-400 shadow-sm border border-velmora-100 dark:border-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Items */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-velmora-50 dark:bg-white/5 rounded-2xl p-6 border border-velmora-100 dark:border-white/5">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-400 mb-6">{t('admin.items')}</h3>
                      <div className="space-y-4">
                        {selectedOrder.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center space-x-4 bg-white dark:bg-velmora-800 p-4 rounded-xl border border-velmora-100 dark:border-white/5 shadow-sm">
                            <div className="w-16 h-16 bg-velmora-100 dark:bg-velmora-700 rounded-lg overflow-hidden flex-shrink-0 border border-velmora-100 dark:border-white/5">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-velmora-300 dark:text-velmora-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-velmora-900 dark:text-white">{item.name}</p>
                              <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-velmora-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-velmora-200 dark:border-white/10 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-velmora-500 dark:text-velmora-400">{t('admin.subtotal')}</span>
                          <span className="font-medium text-velmora-900 dark:text-white">{formatPrice(selectedOrder.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-velmora-500 dark:text-velmora-400">{t('admin.shipping')}</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">{t('admin.free')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-display font-bold pt-4 border-t border-velmora-100 dark:border-white/5">
                          <span className="text-velmora-900 dark:text-white">{t('admin.total')}</span>
                          <span className="text-velmora-900 dark:text-white">{formatPrice(selectedOrder.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Customer Info */}
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-velmora-800 rounded-2xl p-6 border border-velmora-100 dark:border-white/5 shadow-sm">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-400 mb-6">{t('admin.customerInfo')}</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 mb-0.5">{t('admin.customer')}</p>
                            <p className="text-sm font-medium text-velmora-900 dark:text-white">{selectedOrder.shippingAddress?.name || selectedOrder.customerName || selectedOrder.name || (selectedOrder.shippingAddress?.email || selectedOrder.customerEmail || selectedOrder.email || 'Customer').split('@')[0]}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 mb-0.5">{t('admin.email')}</p>
                            <p className="text-sm font-medium text-velmora-900 dark:text-white break-all">{selectedOrder.shippingAddress?.email || selectedOrder.customerEmail || selectedOrder.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 mb-0.5">{t('admin.phone')}</p>
                            <p className="text-sm font-medium text-velmora-900 dark:text-white">{selectedOrder.shippingAddress?.phone || selectedOrder.customerPhone || selectedOrder.phone || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-velmora-50 dark:bg-white/5 rounded-lg text-velmora-400">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 mb-0.5">{t('admin.address')}</p>
                            <p className="text-sm font-medium text-velmora-900 dark:text-white leading-relaxed">
                              {selectedOrder.shippingAddress?.address || selectedOrder.address || 'N/A'}<br />
                              {selectedOrder.shippingAddress?.city || selectedOrder.city || ''}{selectedOrder.shippingAddress?.city || selectedOrder.city ? ', ' : ''}{selectedOrder.shippingAddress?.region || selectedOrder.country || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-velmora-900 dark:bg-black rounded-2xl p-6 text-white shadow-xl shadow-velmora-900/20">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('Payment Method')}</h3>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          selectedOrder.paymentStatus === 'paid' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                          {t(`checkout.paymentStatuses.${selectedOrder.paymentStatus || 'pending'}`)}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-sm font-bold uppercase tracking-widest">
                          {selectedOrder.paymentMethod === 'cod' ? t('checkout.cod') : selectedOrder.paymentMethod === 'instapay' ? t('checkout.instapay') : t('checkout.visa')}
                        </p>
                        
                        {selectedOrder.paymentMethod === 'instapay' && selectedOrder.paymentScreenshot && (
                          <div className="pt-4 border-t border-white/10">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 mb-2">{t('checkout.uploadScreenshot')}</p>
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group mb-4">
                              <img 
                                src={selectedOrder.paymentScreenshot} 
                                alt="Payment Screenshot" 
                                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                onClick={() => setPreviewImage(selectedOrder.paymentScreenshot)}
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <Eye className="w-6 h-6 text-white" />
                              </div>
                            </div>

                            {selectedOrder.paymentStatus !== 'paid' && (
                              <button
                                onClick={() => handleConfirmPayment(selectedOrder.id)}
                                disabled={updatingId === selectedOrder.id}
                                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center space-x-2"
                              >
                                {updatingId === selectedOrder.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{t('checkout.confirmPayment')}</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setOrderToDelete(selectedOrder)}
                      className="w-full py-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <Trash2 size={16} />
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
            >
              <button 
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <img 
                src={previewImage} 
                alt="Payment Preview" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderToDelete(null)}
              className="absolute inset-0 bg-velmora-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-velmora-900 rounded-3xl shadow-2xl p-8 border border-velmora-100 dark:border-white/5"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-velmora-900 dark:text-white text-center mb-2">{t('admin.confirmDeleteTitle') || 'Confirm Delete'}</h3>
              <p className="text-velmora-500 dark:text-velmora-400 text-center mb-8">
                {t('admin.confirmDeleteMessage') || 'Are you sure you want to delete this order? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 px-6 py-3 bg-velmora-100 dark:bg-white/5 text-velmora-700 dark:text-velmora-300 rounded-xl font-bold hover:bg-velmora-200 dark:hover:bg-white/10 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={() => handleDeleteOrder(orderToDelete.id)}
                  disabled={updatingId === orderToDelete.id}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {updatingId === orderToDelete.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('common.delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
