import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Heart, Star, ShieldCheck } from 'lucide-react';

const OurStory: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-velmora-50 dark:bg-velmora-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920"
            alt="Our Story Hero"
            className="w-full h-full object-cover opacity-60 dark:opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-velmora-50 dark:to-velmora-900" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display text-velmora-900 dark:text-white mb-6"
          >
            {t('story.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl font-sans italic text-velmora-700 dark:text-velmora-400"
          >
            {t('story.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-12 text-lg leading-relaxed text-velmora-800 dark:text-velmora-300 font-sans">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('story.p1')}
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800"
                alt="Craftsmanship"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <p className="italic border-l-4 border-velmora-500 pl-6 py-2">
                {t('story.p2')}
              </p>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t('story.p3')}
          </motion.p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-white dark:bg-velmora-900 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display text-velmora-900 dark:text-white mb-4">
              {t('story.mission')}
            </h2>
            <p className="max-w-2xl mx-auto text-velmora-700 dark:text-velmora-400">
              {t('story.missionText')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-velmora-100 dark:bg-velmora-800 rounded-full flex items-center justify-center mx-auto text-velmora-600 dark:text-velmora-400">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-velmora-900 dark:text-white">{t('story.v1')}</h3>
              <p className="text-velmora-700 dark:text-velmora-400">{t('story.v1Text')}</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-velmora-100 dark:bg-velmora-800 rounded-full flex items-center justify-center mx-auto text-velmora-600 dark:text-velmora-400">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-velmora-900 dark:text-white">{t('story.v2')}</h3>
              <p className="text-velmora-700 dark:text-velmora-400">{t('story.v2Text')}</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-velmora-100 dark:bg-velmora-800 rounded-full flex items-center justify-center mx-auto text-velmora-600 dark:text-velmora-400">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold text-velmora-900 dark:text-white">{t('story.v3')}</h3>
              <p className="text-velmora-700 dark:text-velmora-400">{t('story.v3Text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto px-4"
        >
          <h2 className="text-3xl font-display text-velmora-900 dark:text-white mb-8">
            {t('nav.shop')}
          </h2>
          <a
            href="/"
            className="inline-block bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 px-10 py-4 rounded-full font-bold hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all transform hover:scale-105"
          >
            {t('common.continueShopping')}
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default OurStory;
