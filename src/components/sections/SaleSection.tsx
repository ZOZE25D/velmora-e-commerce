import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Tag, Clock } from 'lucide-react';
import { useAppContext, Product } from '../../context/AppContext';
import { FirestoreService } from '../../services/FirestoreService';
import ProductCard from '../ui/ProductCard';

const SaleSection: React.FC = () => {
  const { t } = useTranslation();
  const { isOnSale } = useAppContext();
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('products', (data) => {
      const products = data as Product[];
      const onSale = products.filter(p => isOnSale(p.id?.toString() || '')).slice(0, 4);
      setSaleProducts(onSale);
      setLoading(false);
    });
    return unsubscribe;
  }, [isOnSale]);

  if (!loading && saleProducts.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-velmora-50 dark:bg-velmora-900/10 overflow-hidden relative">
      {/* Attractive Background Accents */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-velmora-200/20 dark:bg-velmora-800/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-velmora-300/15 dark:bg-velmora-700/5 rounded-full blur-[80px] translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-velmora-600 dark:text-velmora-400"
            >
              <Tag className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-[0.4em]">{t('nav.sale')}</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-display font-bold dark:text-velmora-50 tracking-tight"
            >
              Limited Time <span className="italic font-serif font-light">Offers</span>
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              to="/category/sale"
              className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-velmora-600 transition-colors dark:text-velmora-50"
            >
              <span>{t('SHOP ALL')}</span>
              <div className="w-10 h-10 rounded-full border border-velmora-900/10 dark:border-velmora-100/10 flex items-center justify-center group-hover:border-velmora-600 group-hover:bg-velmora-600 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl" />
            ))
          ) : (
            saleProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default SaleSection;
