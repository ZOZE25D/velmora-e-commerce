import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Clock, Mail, Phone } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const MaintenancePage: React.FC = () => {
  const { settings } = useAppContext();

  return (
    <div className="min-h-screen bg-velmora-50 dark:bg-velmora-950 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-velmora-900 dark:bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
        >
          <AlertTriangle className="w-12 h-12 text-white dark:text-black" />
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-display font-bold text-velmora-900 dark:text-white uppercase tracking-tighter"
          >
            {settings.siteName || 'VELMORA'}
          </motion.h1>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="h-1 w-20 bg-velmora-900 dark:bg-white mx-auto"
          />
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-velmora-600 dark:text-velmora-400 font-medium"
          >
            {settings.maintenanceMessage || 'We are currently performing scheduled maintenance to improve your experience.'}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-black/5 dark:border-white/5"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-white dark:bg-velmora-900 rounded-2xl shadow-sm">
              <Clock className="w-5 h-5 text-velmora-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Back Soon</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-white dark:bg-velmora-900 rounded-2xl shadow-sm">
              <Mail className="w-5 h-5 text-velmora-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">{settings.siteEmail || 'support@velmora.com'}</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-white dark:bg-velmora-900 rounded-2xl shadow-sm">
              <Phone className="w-5 h-5 text-velmora-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Contact Support</span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] uppercase tracking-[0.3em] text-velmora-400 pt-12"
        >
          &copy; {new Date().getFullYear()} {settings.siteName || 'VELMORA'}. All Rights Reserved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          whileHover={{ opacity: 1 }}
          className="pt-4"
        >
          <a 
            href="/admin/login" 
            className="text-[9px] uppercase tracking-widest text-velmora-500 hover:text-velmora-900 dark:hover:text-white transition-colors"
          >
            Admin Login
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenancePage;
