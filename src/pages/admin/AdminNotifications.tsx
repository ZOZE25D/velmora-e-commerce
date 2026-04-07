import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, 
  ShoppingBag, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Loader2,
  Filter,
  Search
} from 'lucide-react';
import { FirestoreService } from '../../services/FirestoreService';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AdminNotifications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { language } = useAppContext();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const data = await FirestoreService.getCollection('notifications') as any[];
      setNotifications((data || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await FirestoreService.updateDocument('notifications', id, { read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await FirestoreService.deleteDocument('notifications', id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setDeletingId(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setDeletingId(null);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    
    try {
      await Promise.all(unread.map(n => FirestoreService.updateDocument('notifications', n.id, { read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || (filter === 'unread' ? !n.read : n.read);
    const matchesSearch = n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         n.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleNotificationClick = (notif: any) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.link) navigate(notif.link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-velmora-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.notifications')}</h1>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm mt-1">
            {t('Manage Notifications') || 'Manage all system notifications and alerts'}
          </p>
        </div>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 bg-white dark:bg-velmora-900 border border-velmora-200 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-velmora-600 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white transition-all shadow-sm"
          >
            {t('admin.markAllRead')}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-velmora-900 rounded-3xl border border-velmora-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-velmora-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 bg-velmora-50 dark:bg-white/5 p-1 rounded-xl border border-velmora-100 dark:border-white/10 rtl:space-x-reverse w-full md:w-auto">
            {(['all', 'unread', 'read'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex-1 md:flex-none ${
                  filter === f 
                    ? 'bg-velmora-900 text-white rounded-lg shadow-lg shadow-velmora-900/20' 
                    : 'text-velmora-500 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white'
                }`}
              >
                {t(`filter ${f}`) || f}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400" />
            <input 
              type="text"
              placeholder={t('Search Notifications') || 'Search notifications...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/20 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="divide-y divide-velmora-50 dark:divide-white/5">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-6 flex items-start gap-4 hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-all group ${!notif.read ? 'bg-velmora-50/20 dark:bg-velmora-900/5' : ''}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.type === 'order' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' :
                  notif.type === 'message' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
                  'bg-velmora-100 dark:bg-white/10 text-velmora-600 dark:text-velmora-400'
                }`}>
                  {notif.type === 'order' ? <ShoppingBag size={20} /> :
                   notif.type === 'message' ? <MessageSquare size={20} /> :
                   <Bell size={20} />}
                </div>
                
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleNotificationClick(notif)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm ${!notif.read ? 'font-bold text-velmora-900 dark:text-white' : 'text-velmora-700 dark:text-velmora-300'}`}>
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 bg-velmora-900 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-velmora-500 dark:text-velmora-400 leading-relaxed">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-[10px] text-velmora-400 dark:text-velmora-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(notif.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </span>
                    {notif.type && (
                      <span className="px-2 py-0.5 bg-velmora-100 dark:bg-white/10 rounded-md">
                        {notif.type}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="p-2 text-velmora-400 hover:text-emerald-600 transition-colors"
                      title={t('admin.markAsRead')}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  {deletingId === notif.id ? (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="text-[10px] font-bold text-red-600 uppercase tracking-widest"
                      >
                        {t('common.delete')}
                      </button>
                      <button 
                        onClick={() => setDeletingId(null)}
                        className="text-[10px] font-bold text-velmora-400 uppercase tracking-widest"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeletingId(notif.id)}
                      className="p-2 text-velmora-400 hover:text-red-600 transition-colors"
                      title={t('admin.delete')}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-velmora-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-velmora-100 dark:border-white/5">
                <Bell size={32} className="text-velmora-200 dark:text-velmora-700" />
              </div>
              <h3 className="text-lg font-display font-bold text-velmora-900 dark:text-white mb-2">{t('admin.noNotifications')}</h3>
              <p className="text-sm text-velmora-500 dark:text-velmora-400 max-w-xs mx-auto">
                {t('admin.noNotificationsDesc') || 'You are all caught up! No new notifications to show.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
