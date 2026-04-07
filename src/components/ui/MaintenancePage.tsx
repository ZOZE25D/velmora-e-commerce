import React from 'react';
import { motion } from 'motion/react';
import { Hammer, Mail, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

const MaintenancePage: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useAppContext();

  return (
    <div className="min-h-screen bg-velmora-50 dark:bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-zinc-900 p-12 md:p-20 rounded-[3rem] shadow-2xl shadow-velmora-900/5 border border-velmora-100 dark:border-white/5 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-velmora-900"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-velmora-900/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-velmora-900/5 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-velmora-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-10 group">
              <Hammer className="w-10 h-10 text-velmora-900 dark:text-white group-hover:rotate-12 transition-transform duration-500" />
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold text-zinc-900 dark:text-white mb-6 tracking-tight">
              {t('maintenance.title') || 'WE ARE CURATING SOMETHING SPECIAL'}
            </h1>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-12 leading-relaxed max-w-md mx-auto">
              {settings.maintenanceMessage || t('maintenance.message') || 'Our store is currently under maintenance to bring you an even better shopping experience. We will be back shortly.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="mailto:support@velmora.com"
                className="flex items-center space-x-3 px-8 py-4 bg-velmora-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 dark:hover:bg-white/90 transition-all group"
              >
                <Mail className="w-4 h-4" />
                <span>{t('maintenance.contact')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <p className="mt-12 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
              © {new Date().getFullYear()} {settings.siteName || 'VELMORA'} PREMIUM APPAREL
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenancePage;
