import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Trash2, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext, Product } from '../context/AppContext';
import { FirestoreService } from '../services/FirestoreService';

const MyFavorites: React.FC = () => {
  const { t } = useTranslation();
  const { favorites, toggleFavorite, addToCart, formatPrice } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const allProducts = await FirestoreService.getCollection('products');
        const favoriteProducts = (allProducts as Product[]).filter(p => favorites.includes(p.id?.toString() || ''));
        setProducts(favoriteProducts);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, [favorites]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-velmora-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-white dark:bg-velmora-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 dark:text-white">{t('nav.favorites')}</h1>
            <p className="text-black/60 dark:text-white/60">{favorites.length} {t('favorites items')}</p>
          </div>
          <Link 
            to="/" 
            className="text-sm font-bold uppercase tracking-widest flex items-center hover:opacity-50 transition-opacity dark:text-white"
          >
            {t('common.continueShopping')} <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-velmora-50 dark:bg-white/5 rounded-3xl border border-dashed border-velmora-200 dark:border-white/10">
            <div className="w-20 h-20 bg-white dark:bg-velmora-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Heart className="w-10 h-10 text-velmora-300" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-4 dark:text-white">{t('favorites empty')}</h2>
            <p className="text-black/60 dark:text-white/60 mb-8 max-w-md mx-auto">
              {t('favorites empty')}
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center px-8 py-4 bg-velmora-900 text-white rounded-full font-bold uppercase tracking-widest hover:bg-velmora-800 transition-all"
            >
              {t('EXPLORE')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white dark:bg-velmora-900 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {(product.image || (product.images && product.images.length > 0)) ? (
                    <img 
                      src={product.image || product.images?.[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-velmora-100 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-velmora-300" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    <button 
                      onClick={() => toggleFavorite(product.id?.toString() || '')}
                      className="p-3 bg-white/90 dark:bg-velmora-900/90 backdrop-blur-md rounded-full text-red-500 shadow-lg hover:scale-110 transition-transform"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg dark:text-white">{product.name}</h3>
                    <span className="font-display font-bold text-velmora-900 dark:text-velmora-400">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <p className="text-xs text-black/40 dark:text-white/40 uppercase tracking-widest mb-6">
                    {product.category}
                  </p>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-velmora-900 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 hover:bg-velmora-800 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('common.add_to_cart')}</span>
                    </button>
                    <button 
                      onClick={() => toggleFavorite(product.id?.toString() || '')}
                      className="p-3 border border-red-100 dark:border-red-900/30 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      title={t('common.remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavorites;
