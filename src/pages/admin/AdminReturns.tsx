import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RefreshCcw, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  MessageSquare,
  Package,
  User,
  Calendar,
  ExternalLink,
  Trash2,
  X,
  Loader2
} from 'lucide-react';
import { FirestoreService } from '../../services/FirestoreService';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const AdminReturns: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = useAppContext();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('returns', (data) => {
      setReturns(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredReturns = returns.filter(r => {
    const matchesSearch = 
      r.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      const ret = returns.find(r => r.id === id);
      if (!ret) throw new Error('Return request not found');

      // Update the return document
      await FirestoreService.updateDocument('returns', id, { 
        status, 
        adminComment,
        updatedAt: new Date().toISOString()
      });
      
      // Update the order's returnStatus and paymentStatus if necessary
      const orderUpdates: any = { returnStatus: status };
      if (status === 'completed') {
        orderUpdates.paymentStatus = 'refunded';
      }

      try {
        await FirestoreService.updateDocument('orders', ret.orderId, orderUpdates);
      } catch (orderError) {
        console.error('Error updating associated order:', orderError);
        // We don't throw here to allow the return status update to be considered "done" in the UI
      }

      setSelectedReturn(null);
      setAdminComment('');
      toast.success(t('returns Management updateSuccess') || 'Return status updated successfully');
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error(t('admin.returnsManagement.updateError') || 'Failed to update return status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    console.log('Deleting return request:', deleteId);
    setActionLoading(true);
    try {
      const ret = returns.find(r => r.id === deleteId);
      
      // Delete the return document
      await FirestoreService.deleteDocument('returns', deleteId);
      
      // If we found the return, clear the returnStatus on the associated order
      if (ret && ret.orderId) {
        try {
          await FirestoreService.updateDocument('orders', ret.orderId, { 
            returnStatus: null 
          });
        } catch (orderError) {
          console.error('Error clearing return status on order:', orderError);
        }
      }

      if (selectedReturn?.id === deleteId) setSelectedReturn(null);
      setDeleteId(null);
      toast.success(t('admin.returnsManagement.deleteSuccess') || 'Return request deleted successfully');
    } catch (error) {
      console.error('Error deleting return:', error);
      toast.error(t('admin.returnsManagement.deleteError') || 'Failed to delete return request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20';
      case 'approved': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-900/20';
      case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/20';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20';
      default: return 'bg-velmora-50 text-velmora-600 border-velmora-100 dark:bg-white/5 dark:text-velmora-400 dark:border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} />;
      case 'approved': return <CheckCircle2 size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'rejected': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-velmora-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.returnsManagement.title')}</h1>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm mt-1">{t('admin.returnsManagement.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-velmora-400" size={18} />
            <input 
              type="text"
              placeholder={t('admin.returnsManagement.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white dark:bg-velmora-900 border border-velmora-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900 dark:focus:ring-white/20 transition-all dark:text-white"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-velmora-400 hover:text-velmora-600 dark:hover:text-velmora-200 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 rounded-xl border transition-all ${isFilterOpen ? 'bg-velmora-900 text-white border-velmora-900' : 'bg-white dark:bg-velmora-900 text-velmora-600 dark:text-velmora-400 border-velmora-200 dark:border-white/10'}`}
            >
              <Filter size={20} />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-velmora-900 rounded-2xl shadow-xl border border-velmora-100 dark:border-white/10 p-2 z-50"
                >
                  {['All', 'pending', 'approved', 'rejected', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-xl text-sm capitalize transition-colors ${filterStatus === status ? 'bg-velmora-100 dark:bg-white/5 text-velmora-900 dark:text-white font-bold' : 'text-velmora-500 hover:bg-velmora-50 dark:hover:bg-white/5'}`}
                    >
                      {status}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-velmora-900 rounded-[32px] border border-velmora-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-velmora-50 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.returnsManagement.orderId')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.returnsManagement.customer')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.returnsManagement.date')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.returnsManagement.status')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400 text-right">{t('admin.returnsManagement.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-velmora-50 dark:divide-white/5">
              {filteredReturns.length > 0 ? (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="group hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono font-bold text-velmora-900 dark:text-white">#{ret.orderId?.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-velmora-100 dark:bg-white/5 rounded-full flex items-center justify-center text-velmora-500">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-velmora-900 dark:text-white">{ret.userName}</p>
                          <p className="text-xs text-velmora-500">{ret.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-velmora-500">
                        {new Date(ret.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(ret.status)}`}>
                        {getStatusIcon(ret.status)}
                        {ret.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedReturn(ret)}
                          className="p-2 text-velmora-400 hover:text-velmora-900 dark:hover:text-white transition-colors"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(ret.id);
                          }}
                          className="p-2 text-velmora-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-velmora-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RefreshCcw className="text-velmora-300" size={24} />
                    </div>
                    <p className="text-velmora-500 dark:text-velmora-400">{t('admin.returnsManagement.noReturns')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Details Modal */}
      <AnimatePresence>
        {selectedReturn && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReturn(null)}
              className="absolute inset-0 bg-velmora-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-velmora-900 rounded-[40px] shadow-2xl overflow-hidden border border-velmora-100 dark:border-white/5 flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-velmora-50 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.returnsManagement.detailsTitle')}</h2>
                  <p className="text-xs font-mono text-velmora-400 uppercase tracking-widest mt-1">#{selectedReturn.id.toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => setSelectedReturn(null)}
                  className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <XCircle size={24} className="text-velmora-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.returnsManagement.customerInfo')}</h3>
                    <div className="p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-velmora-900 dark:text-white">
                        <User size={14} className="text-velmora-400" />
                        {selectedReturn.userName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-velmora-500">
                        <MessageSquare size={14} className="text-velmora-400" />
                        {selectedReturn.userEmail}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.returnsManagement.orderDetails')}</h3>
                    <div className="p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-velmora-900 dark:text-white">
                        <Package size={14} className="text-velmora-400" />
                        Order #{selectedReturn.orderId?.slice(-8).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-velmora-500">
                        <Calendar size={14} className="text-velmora-400" />
                        {new Date(selectedReturn.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.returnsManagement.itemsToReturn')}</h3>
                  <div className="space-y-3">
                    {selectedReturn.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white dark:bg-velmora-800 rounded-lg flex items-center justify-center border border-velmora-100 dark:border-white/10">
                            <Package size={20} className="text-velmora-300" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-velmora-900 dark:text-white">{item.name}</p>
                            <p className="text-[10px] text-velmora-500 uppercase tracking-widest">{item.size} / {item.color} x {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-velmora-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.returnsManagement.reason')}</h3>
                  <div className="p-6 bg-orange-50/50 dark:bg-orange-900/10 rounded-3xl border border-orange-100 dark:border-orange-900/20 space-y-4">
                    <p className="text-sm text-orange-900 dark:text-orange-200 leading-relaxed italic">
                      "{selectedReturn.reason}"
                    </p>
                    {selectedReturn.image && (
                      <div className="mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-2">{t('admin.returnsManagement.attachedImage') || 'Attached Image'}</p>
                        <div className="relative group w-full max-w-xs aspect-square rounded-2xl overflow-hidden border border-orange-100 dark:border-orange-900/20 bg-white dark:bg-velmora-800">
                          <img 
                            src={selectedReturn.image} 
                            alt="Return evidence" 
                            className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                            onClick={() => window.open(selectedReturn.image, '_blank')}
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <ExternalLink size={20} className="text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{t('admin.returnsManagement.adminComment')}</h3>
                  <textarea 
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder={t('admin.returnsManagement.commentPlaceholder')}
                    className="w-full px-6 py-4 bg-velmora-50 dark:bg-white/5 border-none rounded-3xl text-sm focus:ring-2 focus:ring-velmora-900 dark:focus:ring-white/20 outline-none dark:text-white min-h-[100px] resize-none"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-velmora-50 dark:border-white/5 bg-velmora-50/50 dark:bg-white/5">
                <div className="flex flex-wrap gap-3">
                  {selectedReturn.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(selectedReturn.id, 'approved')}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-4 bg-velmora-900 dark:bg-white text-white dark:text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-velmora-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <CheckCircle2 size={16} />}
                        {t('admin.returnsManagement.approve')}
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedReturn.id, 'rejected')}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <XCircle size={16} />}
                        {t('admin.returnsManagement.reject')}
                      </button>
                    </>
                  )}
                  {selectedReturn.status === 'approved' && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedReturn.id, 'completed')}
                      disabled={actionLoading}
                      className="w-full px-6 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading ? <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" /> : <CheckCircle2 size={16} />}
                      {t('admin.returnsManagement.markRefunded')}
                    </button>
                  )}
                  {selectedReturn.status === 'completed' && (
                    <div className="w-full p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">{t('admin.returnsManagement.completedMsg')}</p>
                    </div>
                  )}
                  {selectedReturn.status === 'rejected' && (
                    <div className="w-full p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-center">
                      <p className="text-xs font-bold uppercase tracking-widest text-red-600">{t('admin.returnsManagement.rejectedMsg')}</p>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setDeleteId(selectedReturn.id)}
                    disabled={actionLoading}
                    className="w-full px-6 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    <Trash2 size={16} />
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
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
              <h3 className="text-xl font-display font-bold text-velmora-900 dark:text-white text-center mb-2">{t('admin.returnsManagement.confirmDeleteTitle') || 'Confirm Delete'}</h3>
              <p className="text-velmora-500 dark:text-velmora-400 text-center mb-8">
                {t('admin.returnsManagement.confirmDeleteMessage') || 'Are you sure you want to delete this return request? This action cannot be undone.'}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-6 py-3 bg-velmora-100 dark:bg-white/5 text-velmora-700 dark:text-velmora-300 rounded-xl font-bold hover:bg-velmora-200 dark:hover:bg-white/10 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('common.delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReturns;
