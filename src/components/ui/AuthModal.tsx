import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../../firebase';
import { useAppContext } from '../../context/AppContext';
import { FirestoreService } from '../../services/FirestoreService';

const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, registerSupplier, forgotPassword } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await forgotPassword(email);
      setSuccess('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: any) => {
    if (!auth || !provider) {
      setError('Authentication service or provider is not initialized.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile already exists
      const existingProfile = await FirestoreService.getDocument('users', user.uid);
      
      if (!existingProfile) {
        // Create new profile with selected role
        await FirestoreService.setDocument('users', user.uid, {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email || '',
          role: role,
          createdAt: new Date().toISOString()
        });

        // Add notification for admin
        await FirestoreService.addNotification({
          title: role === 'supplier' ? 'New Supplier Registration' : 'New User Registration',
          message: `${user.displayName || 'User'} has registered as a ${role}`,
          type: 'user',
          link: role === 'supplier' ? '/admin/suppliers' : '/admin/users'
        });

        if (role === 'supplier') {
          await registerSupplier(user.uid, {
            name: user.displayName || 'User',
            email: user.email || '',
            storeName: `${user.displayName || 'User'}'s Store`,
            status: 'pending',
            createdAt: new Date().toISOString()
          });
        }
      }
      
      setIsAuthOpen(false);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('This sign-in method is not enabled in the Firebase Console. Please enable it in the Authentication > Sign-in method tab.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid credentials provided by the authentication provider.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in popup was closed before completion.');
      } else if (err.code === 'auth/cancelled-by-user') {
        setError('The sign-in attempt was cancelled.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const [role, setRole] = useState<'customer' | 'supplier'>('customer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!auth || !email || !password) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Create user profile in Firestore with selected role
        await FirestoreService.setDocument('users', userCredential.user.uid, {
          uid: userCredential.user.uid,
          email: email,
          name: name,
          role: role,
          createdAt: new Date().toISOString()
        });

        // Add notification for admin
        await FirestoreService.addNotification({
          title: role === 'supplier' ? 'New Supplier Registration' : 'New User Registration',
          message: `${name} has registered as a ${role}`,
          type: 'user',
          link: role === 'supplier' ? '/admin/suppliers' : '/admin/users'
        });

        if (role === 'supplier') {
          await registerSupplier(userCredential.user.uid, {
            storeName,
            phone,
            address,
            email: email,
            name: name
          });
        }
      }
      setIsAuthOpen(false);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled in the Firebase Console. Please enable it in the Authentication > Sign-in method tab.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsAuthOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-velmora-900 z-[160] shadow-2xl rounded-3xl overflow-hidden border border-black/5 dark:border-white/10"
          >
            <div className="relative p-8 md:p-12">
              <button 
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 dark:text-white" />
              </button>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-display font-bold mb-2 dark:text-white">
                  {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
                </h2>
                <p className="text-velmora-500 dark:text-velmora-400 text-sm">
                  {isLogin ? 'Enter your details to access your account' : 'Join Velmora for a premium shopping experience'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/20">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 text-xs rounded-xl border border-green-100 dark:border-green-900/20">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-velmora-50 dark:bg-white/5 border border-transparent focus:border-velmora-900 dark:focus:border-white focus:bg-white dark:focus:bg-velmora-800 rounded-xl py-4 pl-12 pr-4 text-sm transition-all outline-none dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${role === 'customer' ? 'bg-velmora-900 dark:bg-white text-white dark:text-black border-velmora-900 dark:border-white' : 'bg-velmora-50 dark:bg-white/5 text-velmora-500 dark:text-velmora-400 border-transparent'}`}
                      >
                        Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('supplier')}
                        className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${role === 'supplier' ? 'bg-velmora-900 dark:bg-white text-white dark:text-black border-velmora-900 dark:border-white' : 'bg-velmora-50 dark:bg-white/5 text-velmora-500 dark:text-velmora-400 border-transparent'}`}
                      >
                        Supplier
                      </button>
                    </div>

                    {role === 'supplier' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <input 
                          required
                          type="text" 
                          placeholder="Store Name"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-full bg-velmora-50 dark:bg-white/5 border border-transparent focus:border-velmora-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-800 rounded-xl py-4 px-4 text-sm transition-all outline-none dark:text-white"
                        />
                        <input 
                          required
                          type="tel" 
                          placeholder="Phone Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-velmora-50 dark:bg-white/5 border border-transparent focus:border-velmora-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-800 rounded-xl py-4 px-4 text-sm transition-all outline-none dark:text-white"
                        />
                        <input 
                          required
                          type="text" 
                          placeholder="Store Address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-velmora-50 dark:bg-white/5 border border-transparent focus:border-velmora-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-800 rounded-xl py-4 px-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </motion.div>
                    )}
                  </>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400" />
                  <input 
                    required
                    type="email" 
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-velmora-50 dark:bg-white/5 border border-transparent focus:border-velmora-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-800 rounded-xl py-4 pl-12 pr-4 text-sm transition-all outline-none dark:text-white"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400" />
                  <input 
                    required
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-velmora-50 dark:bg-white/5 border border-transparent focus:border-velmora-900 dark:focus:border-white focus:bg-white dark:focus:bg-zinc-800 rounded-xl py-4 pl-12 pr-4 text-sm transition-all outline-none dark:text-white"
                  />
                  {isLogin && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-velmora-400 hover:text-velmora-900 dark:hover:text-white transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-velmora-900 dark:bg-white dark:text-black text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-white/90 transition-all flex items-center justify-center group disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-velmora-100 dark:border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                  <span className="bg-white dark:bg-velmora-900 px-4 text-velmora-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleSocialLogin(googleProvider)}
                  className="flex items-center justify-center space-x-2 py-3 border border-velmora-100 dark:border-white/10 rounded-xl hover:bg-velmora-50 dark:hover:bg-white/5 transition-colors dark:text-white"
                >
                  <Chrome className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Google</span>
                </button>
                <button 
                  onClick={() => handleSocialLogin(appleProvider)}
                  className="flex items-center justify-center space-x-2 py-3 border border-velmora-100 dark:border-white/10 rounded-xl hover:bg-velmora-50 dark:hover:bg-white/5 transition-colors dark:text-white"
                >
                  <Github className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Apple</span>
                </button>
              </div>

              <p className="mt-10 text-center text-sm text-velmora-500 dark:text-velmora-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-velmora-900 dark:text-white font-bold hover:underline"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
