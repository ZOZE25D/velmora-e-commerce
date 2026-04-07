import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Loader2,
  Clock
} from 'lucide-react';
import { FirestoreService } from '../../services/FirestoreService';

const AdminSuppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSuppliers = async () => {
    try {
      const fetchedSuppliers = await FirestoreService.getAllSuppliers() as any[];
      setSuppliers(fetchedSuppliers);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleUpdateStatus = async (userId: string, status: 'approved' | 'rejected' | 'pending') => {
    setUpdatingId(userId);
    try {
      await FirestoreService.updateSupplierStatus(userId, status as any);
      await fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20';
      default: return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-900/20';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">Suppliers Management</h1>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm mt-1">Review and manage supplier applications.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-velmora-900 p-4 rounded-2xl border border-velmora-100 dark:border-white/5 shadow-sm flex items-center space-x-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 mb-0.5">Total Suppliers</p>
              <p className="text-xl font-bold text-velmora-900 dark:text-white">{suppliers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-velmora-900 p-4 rounded-2xl border border-velmora-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400" />
          <input 
            type="text" 
            placeholder="Search by store name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white dark:bg-velmora-900 rounded-3xl border border-velmora-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-velmora-50/50 dark:bg-white/5">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Store / Owner</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Contact</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Address</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-velmora-100 dark:divide-white/5">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-velmora-100 dark:bg-white/10 rounded-xl flex items-center justify-center border border-velmora-200 dark:border-white/10 overflow-hidden">
                        {supplier.logoUrl ? (
                          <img 
                            src={supplier.logoUrl} 
                            alt={supplier.storeName} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Store className="w-5 h-5 text-velmora-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-velmora-900 dark:text-white">{supplier.storeName}</p>
                        <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{supplier.name || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-velmora-500 dark:text-velmora-400">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{supplier.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-velmora-500 dark:text-velmora-400">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{supplier.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-start space-x-2 text-velmora-500 dark:text-velmora-400 max-w-[200px]">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="text-xs line-clamp-2">{supplier.address}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(supplier.status)}`}>
                      {supplier.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {supplier.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {supplier.status === 'pending' && <Clock className="w-3 h-3" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest">{supplier.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {supplier.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(supplier.id, 'approved')}
                            disabled={updatingId === supplier.id}
                            className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            {updatingId === supplier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(supplier.id, 'rejected')}
                            disabled={updatingId === supplier.id}
                            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            {updatingId === supplier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                      {supplier.status !== 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(supplier.id, 'pending')}
                          disabled={updatingId === supplier.id}
                          className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 hover:text-velmora-900 dark:hover:text-white transition-colors"
                        >
                          Reset to Pending
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-velmora-500 dark:text-velmora-400">
                    <div className="flex flex-col items-center space-y-4">
                      <Store className="w-12 h-12 opacity-20" />
                      <p className="text-sm font-medium">No suppliers found.</p>
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

export default AdminSuppliers;
