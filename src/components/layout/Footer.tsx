import React, { useState } from 'react';
import { Instagram, Twitter, Facebook, Youtube, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { FirestoreService } from '../../services/FirestoreService';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setStatus('error');
      setMessage('Invalid email');
      return;
    }

    setStatus('loading');
    
    const trimmedEmail = email.trim().toLowerCase();
    
    try {
      const subscriberRef = doc(db, 'subscribers', trimmedEmail);
      await setDoc(subscriberRef, {
        email: trimmedEmail,
        createdAt: new Date().toISOString()
      });

      // Add notification 
      await FirestoreService.addNotification({
        title: 'New Subscriber',
        message: `${trimmedEmail} has just subscribed to the newsletter.`,
        type: 'message',
        link: '/admin/subscribers'
      });

      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Footer subscription error:', error);
      setStatus('error');
      setMessage('Error. Try again.');
    }
  };

  return (
    <footer className="bg-velmora-900 text-velmora-50 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-display font-bold mb-6 tracking-tighter">VELMORA</h2>
            <p className="text-velmora-100/60 text-sm mb-8 leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="relative">
              <form onSubmit={handleSubscribe} className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  disabled={status === 'loading' || status === 'success'}
                  placeholder={status === 'success' ? t('home.subscribed') : t('footer.newsletterPlaceholder')} 
                  className={`w-full bg-transparent border-b py-3 focus:outline-none transition-colors text-sm pr-10 ${
                    status === 'error' ? 'border-red-500' : 'border-velmora-100/20 focus:border-velmora-100'
                  } ${status === 'success' ? 'text-green-400 border-green-400' : ''}`}
                />
                <button 
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:translate-x-1 transition-transform disabled:opacity-50 disabled:hover:translate-x-0"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </button>
              </form>
              <AnimatePresence>
                {status === 'error' && (
                  <motion.p 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-6 left-0 text-[10px] text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle size={10} /> {message === 'Invalid email' ? t('home.invalidEmail') : t('home.error')}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold mb-8 text-white/40">{t('nav.shop')}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/category/new-arrivals" className="hover:text-velmora-300 transition-colors">{t('nav.newArrivals')}</Link></li>
              <li><Link to="/category/women" className="hover:text-velmora-300 transition-colors">{t('nav.women')}</Link></li>
              <li><Link to="/category/men" className="hover:text-velmora-300 transition-colors">{t('nav.men')}</Link></li>
              <li><Link to="/category/accessories" className="hover:text-velmora-300 transition-colors">{t('nav.accessories')}</Link></li>
              <li><Link to="/category/sale" className="hover:text-velmora-300 transition-colors">{t('nav.sale')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold mb-8 text-white/40">{t('footer.company')}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/our-story" className="hover:text-velmora-300 transition-colors">{t('story.title')}</Link></li>
              <li><Link to="/sustainability" className="hover:text-velmora-300 transition-colors">{t('footer.sustainability')}</Link></li>
              <li><Link to="/careers" className="hover:text-velmora-300 transition-colors">{t('footer.careers')}</Link></li>
              <li><Link to="/press" className="hover:text-velmora-300 transition-colors">{t('footer.press')}</Link></li>
              <li><Link to="/contact" className="hover:text-velmora-300 transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-semibold mb-8 text-white/40">{t('footer.support')}</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/shipping" className="hover:text-velmora-300 transition-colors">{t('footer.shipping')}</Link></li>
              <li><Link to="/returns" className="hover:text-velmora-300 transition-colors">{t('footer.returns')}</Link></li>
              <li><Link to="/size-guide" className="hover:text-velmora-300 transition-colors">{t('footer.sizeGuide')}</Link></li>
              <li><Link to="/faq" className="hover:text-velmora-300 transition-colors">{t('footer.faq')}</Link></li>
              <li><Link to="/tracking" className="hover:text-velmora-300 transition-colors">{t('footer.tracking')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="flex space-x-6">
            <a href="#" className="text-white/60 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-white/60 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-white/60 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="text-white/60 hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
          </div>
          <p className="text-[12px] uppercase tracking-[0.2em] text-white/40">
            {t('footer.rights')}
          </p>
          <div className="flex space-x-6 text-[11px] uppercase tracking-widest text-white/40">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
