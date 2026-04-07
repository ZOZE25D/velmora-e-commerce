import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Filter, 
  Trash2, 
  Shield, 
  User, 
  MoreVertical, 
  Loader2,
  Mail,
  Calendar,
  X,
  ShieldCheck,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { FirestoreService } from '../../services/FirestoreService';
import { toast } from 'sonner';

const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useAppContext();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      const fetchedUsers = await FirestoreService.getCollection('users') as any[];
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await FirestoreService.updateDocument('users', userId, { role: newRole });
      await fetchUsers();
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    console.log('Deleting user:', userToDelete.id);
    setIsDeleting(true);
    try {
      await FirestoreService.deleteDocument('users', userToDelete.id);
      await fetchUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = (user: any) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">Users Management</h1>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm mt-1">Manage user accounts, roles and permissions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-velmora-900 p-4 rounded-2xl border border-velmora-100 dark:border-white/5 shadow-sm flex items-center space-x-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-0.5">Total Users</p>
              <p className="text-xl font-bold text-velmora-900 dark:text-white">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-velmora-900 p-4 rounded-2xl border border-velmora-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400" />
          <input 
            type="text" 
            placeholder="Search by email or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400`} />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`appearance-none ${language === 'ar' ? 'pr-12 pl-10' : 'pl-12 pr-10'} py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white transition-all outline-none cursor-pointer`}
            >
              <option value="all">{t('common.all')} {t('auth.customer')}/{t('auth.supplier')}</option>
              <option value="user">{t('auth.customer')}</option>
              <option value="admin">Admin</option>
              <option value="supplier">{t('auth.supplier')}</option>
            </select>
            <ChevronDown className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-3 h-3 text-velmora-400 pointer-events-none`} />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-velmora-900 rounded-3xl border border-velmora-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-velmora-50/50 dark:bg-white/5">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">User</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Role</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Joined Date</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-velmora-100 dark:divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-velmora-100 dark:bg-white/10 rounded-xl flex items-center justify-center border border-velmora-200 dark:border-white/10">
                        <User className="w-5 h-5 text-velmora-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-velmora-900 dark:text-white">{user.email?.split('@')[0]}</p>
                        <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest outline-none border transition-all cursor-pointer ${
                          user.role === 'admin' 
                            ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30' 
                            : 'bg-velmora-100 dark:bg-white/10 text-velmora-600 dark:text-velmora-400 border-velmora-200 dark:border-white/10'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      {user.role === 'admin' ? (
                        <ShieldCheck className="w-3 h-3 text-purple-400" />
                      ) : (
                        <ShieldAlert className="w-3 h-3 text-velmora-300" />
                      )}
                      {updatingId === user.id && <Loader2 className="w-3 h-3 animate-spin text-velmora-400" />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 text-velmora-500 dark:text-velmora-400">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => confirmDelete(user)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-velmora-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-velmora-500 dark:text-velmora-400">
                    <div className="flex flex-col items-center space-y-4">
                      <Users className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">No users found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-velmora-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-velmora-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-velmora-100 dark:border-white/5"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600">
                  <Trash2 className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-xl transition-colors text-velmora-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-velmora-900 dark:text-white mb-2">Delete User?</h3>
              <p className="text-velmora-500 dark:text-velmora-400 text-sm mb-8">
                Are you sure you want to delete <span className="font-bold text-velmora-900 dark:text-white">{userToDelete?.email}</span>? 
                This action cannot be undone and all associated data will be lost.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-velmora-100 dark:bg-white/5 hover:bg-velmora-200 dark:hover:bg-white/10 text-velmora-600 dark:text-velmora-400 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
