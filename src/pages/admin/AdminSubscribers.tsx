import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { FirestoreService } from '../../services/FirestoreService';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'sonner';

const AdminSubscribers: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useAppContext();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('subscribers', (data) => {
      setSubscribers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredSubscribers = subscribers
    .filter(s => s.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const toggleSelect = (email: string) => {
    if (selectedSubscribers.includes(email)) {
      setSelectedSubscribers(selectedSubscribers.filter(e => e !== email));
    } else {
      setSelectedSubscribers([...selectedSubscribers, email]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(filteredSubscribers.map(s => s.email));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      console.log('Deleting subscriber with ID:', deleteId);
      await FirestoreService.deleteDocument('subscribers', deleteId);
      
      // Clear selection if deleted
      const sub = subscribers.find(s => s.id === deleteId);
      if (sub) {
        setSelectedSubscribers(prev => prev.filter(email => email !== sub.email));
      }
      setDeleteId(null);
      toast.success('Subscriber deleted successfully');
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Failed to delete subscriber');
      setDeleteId(null);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubscribers.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one subscriber.' });
      return;
    }
    if (!emailData.subject || !emailData.body) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedSubscribers,
          subject: emailData.subject,
          body: emailData.body
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatus({ type: 'success', message: 'Emails sent successfully!' });
        setEmailData({ subject: '', body: '' });
        setTimeout(() => setIsComposeOpen(false), 2000);
      } else {
        throw new Error(result.error || 'Failed to send emails');
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Failed to send emails.' });
    } finally {
      setSending(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Email', 'Subscribed At'];
    const rows = subscribers.map(s => [
      s.email,
      new Date(s.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">
            {t('admin.subscribers')}
          </h1>
          <p className="text-velmora-500 dark:text-velmora-400 mt-1">
            Manage your newsletter audience and send updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-velmora-900 border border-velmora-200 dark:border-white/10 rounded-xl text-sm font-bold text-velmora-700 dark:text-velmora-300 hover:bg-velmora-50 dark:hover:bg-white/5 transition-all"
          >
            <Download size={18} />
            {t('admin.exportCSV')}
          </button>
          <button 
            onClick={() => setIsComposeOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-velmora-900 text-white rounded-xl text-sm font-bold hover:bg-velmora-800 transition-all shadow-lg shadow-velmora-900/20"
          >
            <Send size={18} />
            Compose Email
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-velmora-900 p-6 rounded-2xl border border-velmora-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-velmora-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-velmora-600">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-velmora-400 uppercase tracking-wider">Total Subscribers</p>
              <p className="text-2xl font-display font-bold text-velmora-900 dark:text-white">{subscribers.length}</p>
            </div>
          </div>
        </div>
        {/* Add more stats if needed */}
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-velmora-900 rounded-2xl border border-velmora-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-velmora-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-velmora-400`} size={18} />
            <input 
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/20 focus:border-velmora-900 transition-all dark:text-white`}
            />
          </div>
          <div className="flex items-center gap-3">
            {selectedSubscribers.length > 0 && (
              <span className="text-sm font-medium text-velmora-900 dark:text-velmora-400">
                {selectedSubscribers.length} selected
              </span>
            )}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2.5 border rounded-xl transition-all ${isFilterOpen ? 'bg-velmora-900 text-white border-velmora-900' : 'bg-velmora-50 dark:bg-white/5 border-velmora-100 dark:border-white/10 text-velmora-500 hover:text-velmora-900 dark:hover:text-white'}`}
              >
                <Filter size={18} />
              </button>
              
              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-velmora-900 rounded-2xl shadow-xl border border-velmora-100 dark:border-white/5 z-20 overflow-hidden"
                    >
                      <div className="p-2">
                        <button 
                          onClick={() => { setSortOrder('newest'); setIsFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-colors ${sortOrder === 'newest' ? 'bg-velmora-50 dark:bg-velmora-900/20 text-velmora-900 dark:text-velmora-400 font-bold' : 'text-velmora-600 dark:text-velmora-400 hover:bg-velmora-50 dark:hover:bg-white/5'}`}
                        >
                          Newest First
                        </button>
                        <button 
                          onClick={() => { setSortOrder('oldest'); setIsFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-colors ${sortOrder === 'oldest' ? 'bg-velmora-50 dark:bg-velmora-900/20 text-velmora-900 dark:text-velmora-400 font-bold' : 'text-velmora-600 dark:text-velmora-400 hover:bg-velmora-50 dark:hover:bg-white/5'}`}
                        >
                          Oldest First
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-velmora-50/50 dark:bg-white/5">
                <th className="px-6 py-4">
                  <input 
                    type="checkbox"
                    checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-velmora-300 text-velmora-900 focus:ring-velmora-900"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-velmora-400 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-4 text-xs font-bold text-velmora-400 uppercase tracking-wider">Subscribed Date</th>
                <th className="px-6 py-4 text-xs font-bold text-velmora-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-velmora-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-velmora-900 mx-auto" />
                  </td>
                </tr>
              ) : filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber.email)}
                        onChange={() => toggleSelect(subscriber.email)}
                        className="w-4 h-4 rounded border-velmora-300 text-velmora-900 focus:ring-velmora-900"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-velmora-100 dark:bg-white/10 rounded-lg flex items-center justify-center text-velmora-500">
                          <Mail size={14} />
                        </div>
                        <span className="text-sm font-medium text-velmora-900 dark:text-white">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-velmora-500 dark:text-velmora-400">
                        {new Date(subscriber.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setDeleteId(subscriber.id)}
                        className="p-2 text-velmora-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-velmora-500 dark:text-velmora-400">No subscribers found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
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
              <h3 className="text-xl font-display font-bold text-velmora-900 dark:text-white text-center mb-2">Confirm Deletion</h3>
              <p className="text-velmora-500 dark:text-velmora-400 text-center mb-8">
                Are you sure you want to remove this subscriber? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-6 py-3 bg-velmora-100 dark:bg-white/5 text-velmora-700 dark:text-velmora-300 rounded-xl font-bold hover:bg-velmora-200 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !sending && setIsComposeOpen(false)}
              className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-velmora-900 rounded-3xl shadow-2xl overflow-hidden border border-velmora-100 dark:border-white/5"
            >
              <div className="p-6 border-b border-velmora-100 dark:border-white/5 flex items-center justify-between bg-velmora-50/50 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-velmora-900 rounded-xl flex items-center justify-center text-white">
                    <Send size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-velmora-900 dark:text-white">Compose Email</h3>
                    <p className="text-xs text-velmora-500 dark:text-velmora-400">Sending to {selectedSubscribers.length} recipients</p>
                  </div>
                </div>
                <button 
                  onClick={() => !sending && setIsComposeOpen(false)}
                  className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-full transition-colors text-velmora-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendEmail} className="p-8 space-y-6">
                {status && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 ${
                      status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'bg-red-50 dark:bg-red-900/10 text-red-600'
                    }`}
                  >
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-medium">{status.message}</p>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-velmora-400 uppercase tracking-wider px-1">Subject</label>
                  <input 
                    type="text"
                    required
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Exclusive Offer for our Subscribers"
                    className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/20 focus:border-velmora-900 transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-velmora-400 uppercase tracking-wider px-1">Message Body</label>
                  <textarea 
                    required
                    rows={8}
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/20 focus:border-velmora-900 transition-all dark:text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    disabled={sending}
                    className="px-6 py-2.5 text-sm font-bold text-velmora-500 hover:text-velmora-900 dark:hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={sending || selectedSubscribers.length === 0}
                    className="flex items-center gap-2 px-8 py-2.5 bg-velmora-900 text-white rounded-xl text-sm font-bold hover:bg-velmora-800 transition-all shadow-lg shadow-velmora-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Emails
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubscribers;
