import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const AdminLogin: React.FC = () => {
  const { login, isAdmin, forgotPassword } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await login(email, password);
      // The isAdmin check happens in the context/layout
      // We'll navigate to /admin immediately, AdminLayout will handle access control
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  // If already admin, redirect to dashboard
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-velmora-50 dark:bg-velmora-950 flex items-center justify-center p-6 transition-colors duration-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
            <div className="w-10 h-10 bg-velmora-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg shadow-velmora-900/20 dark:shadow-white/10 group-hover:scale-110 transition-transform">
              <span className="text-white dark:text-velmora-900 font-display font-bold text-xl">V</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-velmora-900 dark:text-white">VELMORA</span>
          </Link>
          <div className="flex items-center justify-center space-x-2 text-velmora-400 dark:text-velmora-500 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Secure Admin Access</p>
          </div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">Sign in to Dashboard</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-velmora-900 p-10 rounded-3xl shadow-xl shadow-velmora-200/50 dark:shadow-black/20 border border-velmora-100 dark:border-white/5"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-bold">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400 dark:text-velmora-500" />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                  placeholder="admin@velmora.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Password</label>
                <button 
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setError('Please enter your email address first.');
                      return;
                    }
                    try {
                      setLoading(true);
                      setError('');
                      setSuccess('');
                      await forgotPassword(email);
                      setSuccess('Password reset email sent! Please check your inbox.');
                    } catch (err: any) {
                      setError(err.message || 'Failed to send reset email');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-[10px] font-bold uppercase tracking-widest text-velmora-900 dark:text-velmora-400 hover:underline"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400 dark:text-velmora-500" />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-velmora-900/20 dark:shadow-white/5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center mt-8 text-velmora-400 dark:text-velmora-500 text-xs">
          Protected by Velmora Security. <Link to="/" className="text-velmora-900 dark:text-white font-bold hover:underline">Back to Store</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
