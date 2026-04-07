import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { doc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { db } from '../firebase';
import Hero from '../components/sections/Hero';
import Trending from '../components/sections/Trending';
import Categories from '../components/sections/Categories';
import SaleSection from '../components/sections/SaleSection';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setStatus('error');
      setMessage(t('home.invalidEmail'));
      return;
    }

    setStatus('loading');
    
    try {
      // Save to Firestore
      const subscriberRef = doc(db, 'subscribers', email.toLowerCase());
      await setDoc(subscriberRef, {
        email: email.toLowerCase(),
        createdAt: new Date().toISOString()
      });

      setStatus('success');
      setMessage(t('home.welcome'));
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      setStatus('error');
      setMessage(t('home.error'));
    }
  };

  return (
    <>
      <Hero />
      
      {/* Marquee Banner - Modern Brutalist */}
      <section className="py-10 bg-velmora-900 text-velmora-50 overflow-hidden whitespace-nowrap border-y border-white/5">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex space-x-24 items-center"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.6em] opacity-80">
                {t('home.freeShipping')}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-velmora-500" />
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section - Modern Grid */}
      <section className="py-24 px-6 bg-velmora-100/20 dark:bg-velmora-900/40 border-b border-velmora-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { title: 'Free Shipping', desc: 'On all orders over 2000 EGP', icon: '🚚' },
              { title: 'Secure Payment', desc: '100% secure payment processing', icon: '🔒' },
              { title: 'Easy Returns', desc: '30-day hassle-free return policy', icon: '🔄' },
              { title: '24/7 Support', desc: 'Dedicated support for our clients', icon: '💬' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="text-3xl mb-6 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-3 dark:text-velmora-50">
                  {feature.title}
                </h3>
                <p className="text-xs text-velmora-600/60 dark:text-velmora-100/40 font-light leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Trending />
      
      <SaleSection />
      
      <Categories />

      {/* Brand Story Section - Modern Editorial */}
      <section className="py-40 px-6 bg-velmora-50 dark:bg-velmora-900/30 transition-colors duration-500 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] bg-velmora-200/40 dark:bg-velmora-800/20 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-velmora-300/30 dark:bg-velmora-700/10 rounded-full blur-[120px]" />
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden group bg-velmora-100 dark:bg-velmora-800"
            >
              <img 
                src="../../public/images/Our Philosophy.jfif" 
                alt="Craftsmanship" 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-700" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-velmora-600 dark:text-velmora-400 block">
                  {t('home.philosophy')}
                </span>
                <h2 className="text-5xl md:text-7xl font-display font-bold leading-[0.9] tracking-tighter dark:text-white">
                  {t('home.philosophyQuote')}
                </h2>
              </div>
              
              <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-light max-w-lg">
                {t('home.philosophyDesc')}
              </p>

              <div className="pt-6">
                <Link 
                  to="/our-story"
                  className="group inline-flex items-center space-x-6"
                >
                  <div className="w-16 h-16 rounded-full border border-zinc-200 dark:border-white/10 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-500">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.3em] dark:text-white group-hover:translate-x-2 transition-transform duration-500">
                    {t('story.title')}
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter - Immersive Full Width */}
      <section className="relative py-40 px-6 overflow-hidden bg-velmora-900">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-velmora-600 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-velmora-800 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 block mb-8">
              Join the inner circle
            </span>
            <h2 className="text-5xl md:text-8xl font-display font-bold mb-8 text-white tracking-tighter leading-none">
              {t('home.newsletterTitle')}
            </h2>
            <p className="text-white/60 mb-16 max-w-lg mx-auto text-lg font-light leading-relaxed">
              {t('home.newsletterDesc')}
            </p>
            
            <div className="max-w-xl mx-auto relative">
              <form 
                className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 ${status === 'success' ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100'}`} 
                onSubmit={handleSubscribe}
              >
                <div className="flex-1 relative">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder={t('contact.email')} 
                    disabled={status === 'loading'}
                    className={`w-full px-8 py-6 rounded-2xl bg-white/5 border backdrop-blur-md outline-none transition-all text-white placeholder:text-white/30 ${
                      status === 'error' ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'
                    }`}
                  />
                  {status === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-8 left-6 text-red-400 text-xs font-medium flex items-center gap-2"
                    >
                      <AlertCircle size={14} />
                      {message}
                    </motion.div>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-white text-black px-12 py-6 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-zinc-200 transition-all flex items-center justify-center min-w-[180px] group shadow-xl shadow-white/5"
                >
                  {status === 'loading' ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    t('home.subscribe')
                  )}
                </button>
              </form>

              <AnimatePresence>
                {status === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-white"
                  >
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center mb-6 text-white">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-3 tracking-tight">{t('home.subscribed')}</h3>
                    <p className="text-white/60 font-light">{message}</p>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="mt-8 text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-white transition-colors"
                    >
                      {t('home.addAnother')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Home;
