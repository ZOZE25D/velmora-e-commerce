import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductCard from '../ui/ProductCard';
import { FirestoreService } from '../../services/FirestoreService';
import { Product } from '../../context/AppContext';

const Trending: React.FC = () => {
  const { t } = useTranslation();
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const data = await FirestoreService.getCollection('products', []);
      if (data) {
        setTrendingProducts(data.slice(0, 4) as Product[]);
      }
    };
    fetchTrending();
  }, []);

  return (
    <section className="py-32 px-6 bg-velmora-50 dark:bg-velmora-900/20 transition-colors duration-500 overflow-hidden relative">
      {/* Enhanced Attractive Background Accents */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-velmora-200/30 dark:bg-velmora-800/15 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-velmora-300/20 dark:bg-velmora-700/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(212,196,174,0.15),transparent_60%)] pointer-events-none" />
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="relative mb-24">
          {/* Background Large Text */}
          <div className="absolute -top-20 -left-10 text-[15vw] font-display font-bold text-velmora-900/5 dark:text-white/5 whitespace-nowrap pointer-events-none select-none">
            TRENDING NOW
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-2xl space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 h-[1px] bg-velmora-500" />
                <span className="text-[10px] uppercase tracking-[0.5em] text-velmora-500 font-bold">
                  {t('home.curatedSelection')}
                </span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-6xl md:text-8xl font-display font-bold leading-[0.9] tracking-tighter text-velmora-900 dark:text-velmora-50"
              >
                {t('home.trendingNow')}
              </motion.h2>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link 
                to="/category/new-arrivals" 
                className="group flex items-center space-x-6 text-xs font-bold uppercase tracking-[0.3em] hover:opacity-70 transition-all text-velmora-900 dark:text-velmora-50"
              >
                <span>{t('home.exploreCollection')}</span>
                <div className="w-16 h-16 rounded-full border border-velmora-200 dark:border-white/10 flex items-center justify-center group-hover:bg-velmora-900 dark:group-hover:bg-velmora-50 group-hover:text-velmora-50 dark:group-hover:text-velmora-900 transition-all duration-500">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20"
        >
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Trending;
