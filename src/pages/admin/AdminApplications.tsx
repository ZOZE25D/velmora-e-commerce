import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
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
  FileText,
  Mail,
  User,
  ExternalLink,
  Clock,
  MapPin
} from 'lucide-react';
import { FirestoreService } from '../../services/FirestoreService';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'sonner';

const AdminApplications: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useAppContext();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [filterPosition, setFilterPosition] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('applications', (data) => {
      setApplications(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredApplications = applications
    .filter(a => 
      (a.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.position?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterPosition === 'All' || a.position === filterPosition)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      console.log('Deleting application with ID:', deleteId);
      await FirestoreService.deleteDocument('applications', deleteId);
      if (selectedApplication?.id === deleteId) setSelectedApplication(null);
      setDeleteId(null);
      toast.success('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
      setDeleteId(null);
    }
  };

  const positions = ['All', ...Array.from(new Set(applications.map(a => a.position)))];

  const exportCSV = () => {
    const headers = ['Full Name', 'Email', 'Position', 'Applied At', 'Resume URL'];
    const rows = applications.map(a => [
      a.fullName,
      a.email,
      a.position,
      new Date(a.createdAt).toLocaleString(),
      a.resumeUrl
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `job_applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">
            {t('admin.applications')}
          </h1>
          <p className="text-velmora-500 dark:text-velmora-400 mt-1">
            Review and manage job applications from potential candidates.
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
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-velmora-400 uppercase tracking-wider">Total Applications</p>
              <p className="text-2xl font-display font-bold text-velmora-900 dark:text-white">{applications.length}</p>
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
              placeholder="Search by name, email or position..."
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
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-velmora-900 rounded-2xl shadow-xl border border-velmora-100 dark:border-white/5 z-20 overflow-hidden"
                  >
                    <div className="p-2 max-h-64 overflow-y-auto">
                      <p className="px-4 py-2 text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Filter by Position</p>
                      {positions.map(pos => (
                        <button 
                          key={pos}
                          onClick={() => { setFilterPosition(pos); setIsFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-colors ${filterPosition === pos ? 'bg-velmora-50 dark:bg-velmora-900/20 text-velmora-900 dark:text-velmora-400 font-bold' : 'text-velmora-600 dark:text-velmora-400 hover:bg-velmora-50 dark:hover:bg-white/5'}`}
                        >
                          {pos}
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
                <th className="px-6 py-4 text-xs font-bold text-velmora-400 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-xs font-bold text-velmora-400 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-bold text-velmora-400 uppercase tracking-wider">Applied Date</th>
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
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map((application) => (
                  <tr 
                    key={application.id} 
                    className="hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => setSelectedApplication(application)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-velmora-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-velmora-500">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-velmora-900 dark:text-white">{application.fullName}</p>
                          <p className="text-xs text-velmora-500 dark:text-velmora-400">{application.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-velmora-400" />
                        <span className="text-sm font-medium text-velmora-700 dark:text-velmora-300">{application.position}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-velmora-500 dark:text-velmora-400">
                        <Clock size={14} />
                        {new Date(application.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => setSelectedApplication(application)}
                          className="p-2 text-velmora-400 hover:text-velmora-900 transition-colors"
                        >
                          <FileText size={18} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(application.id)}
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
                    <p className="text-velmora-500 dark:text-velmora-400">No applications found.</p>
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
              <h3 className="text-xl font-display font-bold text-velmora-900 dark:text-white text-center mb-2">Confirm Deletion</h3>
              <p className="text-velmora-500 dark:text-velmora-400 text-center mb-8">
                Are you sure you want to delete this application? This action cannot be undone.
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

      {/* Application Details Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApplication(null)}
              className="absolute inset-0 bg-velmora-950/60 backdrop-blur-sm"
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
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-velmora-900 dark:text-white">Application Details</h3>
                    <p className="text-xs text-velmora-500 dark:text-velmora-400">ID: {selectedApplication.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedApplication(null)}
                  className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-full transition-colors text-velmora-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Candidate Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Candidate Name</p>
                    <p className="text-sm font-bold text-velmora-900 dark:text-white">{selectedApplication.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Email Address</p>
                    <a href={`mailto:${selectedApplication.email}`} className="text-sm font-medium text-velmora-900 dark:text-velmora-400 hover:underline">
                      {selectedApplication.email}
                    </a>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Position Applied For</p>
                    <p className="text-sm font-bold text-velmora-900 dark:text-white">{selectedApplication.position}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Applied Date</p>
                    <p className="text-sm font-medium text-velmora-700 dark:text-velmora-300">
                      {new Date(selectedApplication.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Cover Letter / Message</p>
                  <div className="p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10">
                    <p className="text-sm text-velmora-700 dark:text-velmora-300 leading-relaxed whitespace-pre-wrap">
                      {selectedApplication.message || 'No message provided.'}
                    </p>
                  </div>
                </div>

                {/* Resume */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-velmora-400 uppercase tracking-wider">Resume / Portfolio</p>
                  {selectedApplication.resumeUrl ? (
                    <a 
                      href={selectedApplication.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-velmora-50/50 dark:bg-velmora-900/10 rounded-2xl border border-velmora-100 dark:border-velmora-900/20 group transition-all hover:bg-velmora-50 dark:hover:bg-velmora-900/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-velmora-800 rounded-xl flex items-center justify-center text-velmora-900 dark:text-velmora-400 shadow-sm">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-velmora-900 dark:text-white">Resume Document</p>
                          <p className="text-xs text-velmora-500 dark:text-velmora-400">Click to view or download</p>
                        </div>
                      </div>
                      <ExternalLink size={18} className="text-velmora-900 dark:text-velmora-400 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <div className="p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10 text-center">
                      <p className="text-sm text-velmora-500 dark:text-velmora-400 italic">No resume link provided.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-velmora-100 dark:border-white/5 bg-velmora-50/50 dark:bg-white/5 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setSelectedApplication(null)}
                  className="px-6 py-2.5 bg-white dark:bg-velmora-900 border border-velmora-200 dark:border-white/10 rounded-xl text-sm font-bold text-velmora-700 dark:text-velmora-300 hover:bg-velmora-50 dark:hover:bg-white/5 transition-all"
                >
                  Close
                </button>
                <a 
                  href={`mailto:${selectedApplication.email}?subject=Regarding your application for ${selectedApplication.position}`}
                  className="flex items-center gap-2 px-8 py-2.5 bg-velmora-900 text-white rounded-xl text-sm font-bold hover:bg-velmora-800 transition-all shadow-lg shadow-velmora-900/20"
                >
                  <Mail size={18} />
                  Contact Candidate
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApplications;
