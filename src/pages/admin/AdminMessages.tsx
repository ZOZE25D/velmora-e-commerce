import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  User,
  Clock,
  MoreVertical,
  Reply,
  Check
} from 'lucide-react';
import { FirestoreService } from '../../services/FirestoreService';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'sonner';

const AdminMessages: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useAppContext();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Read' | 'Unread'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('messages', (data) => {
      setMessages(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredMessages = messages
    .filter(m => 
      (m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus === 'All' || (filterStatus === 'Read' ? m.read : !m.read))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      console.log('Deleting message with ID:', deleteId);
      await FirestoreService.deleteDocument('messages', deleteId);
      if (selectedMessage?.id === deleteId) setSelectedMessage(null);
      setDeleteId(null);
      toast.success('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
      setDeleteId(null);
    }
  };

  const markAsRead = async (id: string, currentRead: boolean) => {
    if (currentRead) return;
    try {
      await FirestoreService.updateDocument('messages', id, { read: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Subject', 'Message', 'Date', 'Read'];
    const rows = messages.map(m => [
      m.name,
      m.email,
      m.subject,
      m.message.replace(/,/g, ';'),
      new Date(m.createdAt).toLocaleString(),
      m.read ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contact_messages_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">
            {t('admin.messages')}
          </h1>
          <p className="text-velmora-500 dark:text-velmora-400 mt-1">
            View and respond to inquiries from the contact form.
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
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-velmora-900 p-6 rounded-2xl border border-velmora-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-velmora-400 uppercase tracking-wider">Total Messages</p>
              <p className="text-2xl font-display font-bold text-velmora-900 dark:text-white">{messages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-velmora-900 p-6 rounded-2xl border border-velmora-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-velmora-400 uppercase tracking-wider">Unread Messages</p>
              <p className="text-2xl font-display font-bold text-velmora-900 dark:text-white">
                {messages.filter(m => !m.read).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-velmora-900 rounded-2xl border border-velmora-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-velmora-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-velmora-400`} size={18} />
            <input 
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-velmora-50 dark:bg-white/5 border border-velmora-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/20 focus:border-velmora-900 transition-all dark:text-white`}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2.5 border rounded-xl transition-all ${isFilterOpen ? 'bg-velmora-900 text-white border-velmora-900' : 'bg-velmora-50 dark:bg-white/5 border-velmora-200 dark:border-white/10 text-velmora-500 hover:text-velmora-900 dark:hover:text-white'}`}
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
                      <p className="px-4 py-2 text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Filter by Status</p>
                      {(['All', 'Read', 'Unread'] as const).map(status => (
                        <button 
                          key={status}
                          onClick={() => { setFilterStatus(status); setIsFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-colors ${filterStatus === status ? 'bg-velmora-50 dark:bg-velmora-900/20 text-velmora-900 dark:text-velmora-400 font-bold' : 'text-velmora-600 dark:text-velmora-400 hover:bg-velmora-50 dark:hover:bg-white/5'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-velmora-50/50 dark:bg-white/5">
                <th className="px-6 py-4 text-xs font-bold text-velmora-400 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-4 text-xs font-bold text-velmora-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-velmora-400 uppercase tracking-wider">Date</th>
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
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <tr 
                    key={message.id} 
                    className={`hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer ${!message.read ? 'bg-velmora-50/30 dark:bg-velmora-900/10' : ''}`}
                    onClick={() => {
                      setSelectedMessage(message);
                      markAsRead(message.id, message.read);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!message.read ? 'bg-velmora-900 text-white' : 'bg-velmora-100 dark:bg-white/10 text-velmora-500'}`}>
                          <User size={18} />
                        </div>
                        <div>
                          <p className={`text-sm ${!message.read ? 'font-bold text-velmora-900 dark:text-white' : 'text-velmora-700 dark:text-velmora-300'}`}>{message.name}</p>
                          <p className="text-xs text-velmora-500 dark:text-velmora-400">{message.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm ${!message.read ? 'font-bold text-velmora-900 dark:text-white' : 'text-velmora-700 dark:text-velmora-300'}`}>{message.subject}</span>
                        <span className="text-xs text-velmora-500 dark:text-velmora-400 truncate max-w-[200px]">{message.message}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-velmora-500 dark:text-velmora-400">
                        <Clock size={14} />
                        {new Date(message.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            setSelectedMessage(message);
                            markAsRead(message.id, message.read);
                          }}
                          className="p-2 text-velmora-400 hover:text-velmora-900 transition-colors"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(message.id)}
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
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-velmora-500 dark:text-velmora-400">No messages found.</p>
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
                Are you sure you want to delete this message? This action cannot be undone.
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

      {/* Message Details Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
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
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-velmora-900 dark:text-white">Message Details</h3>
                    <p className="text-xs text-velmora-500 dark:text-velmora-400">Received on {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-full transition-colors text-velmora-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Sender Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Sender Name</p>
                    <p className="text-sm font-bold text-velmora-900 dark:text-white">{selectedMessage.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Email Address</p>
                    <a href={`mailto:${selectedMessage.email}`} className="text-sm font-medium text-velmora-900 dark:text-velmora-400 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Subject</p>
                  <p className="text-sm font-bold text-velmora-900 dark:text-white">{selectedMessage.subject}</p>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Message Content</p>
                  <div className="p-6 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10">
                    <p className="text-sm text-velmora-700 dark:text-velmora-300 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-velmora-100 dark:border-white/5 bg-velmora-50/50 dark:bg-white/5 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="px-6 py-2.5 bg-white dark:bg-velmora-900 border border-velmora-200 dark:border-white/10 rounded-xl text-sm font-bold text-velmora-700 dark:text-velmora-300 hover:bg-velmora-50 dark:hover:bg-white/5 transition-all"
                >
                  Close
                </button>
                <a 
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex items-center gap-2 px-8 py-2.5 bg-velmora-900 text-white rounded-xl text-sm font-bold hover:bg-velmora-800 transition-all shadow-lg shadow-velmora-900/20"
                >
                  <Reply size={18} />
                  Reply via Email
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMessages;
