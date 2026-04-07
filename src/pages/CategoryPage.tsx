import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext, Product } from '../context/AppContext';
import FilterSidebar from '../components/ui/FilterSidebar';
import ProductCard from '../components/ui/ProductCard';
import { FirestoreService } from '../services/FirestoreService';
import { cn } from '../lib/utils';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { addToCart, isOnSale } = useAppContext();
  const { t } = useTranslation();
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [0, 50000] as [number, number],
    sizes: [] as string[],
    colors: [] as string[],
    onSale: false
  });

  // Fetch products from Firestore
  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('products', (data) => {
      setAllProducts(data as Product[]);
    });
    return unsubscribe;
  }, []);

  // Get all products for this category
  const categoryProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (category === 'all' || category === 'lookbook' || category === 'new-arrivals' || !category) return true;
      if (category === 'sale') return isOnSale(p.id?.toString() || '');
      return p.category.toLowerCase() === category?.toLowerCase();
    });
  }, [allProducts, category, isOnSale]);

  // Extract available sizes and colors for filters
  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    categoryProducts.forEach(p => p.sizes.forEach(s => sizes.add(s)));
    return Array.from(sizes).sort();
  }, [categoryProducts]);

  const availableColors = useMemo(() => {
    const colorsMap = new Map<string, string>();
    categoryProducts.forEach(p => {
      p.colors?.forEach(c => colorsMap.set(c.name, c.hex));
    });
    return Array.from(colorsMap.entries()).map(([name, hex]) => ({ name, hex }));
  }, [categoryProducts]);

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    // Apply Price Filter
    result = result.filter(p => p.price >= activeFilters.priceRange[0] && p.price <= activeFilters.priceRange[1]);

    // Apply Size Filter
    if (activeFilters.sizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => activeFilters.sizes.includes(s)));
    }

    // Apply Color Filter
    if (activeFilters.colors.length > 0) {
      result = result.filter(p => p.colors?.some(c => activeFilters.colors.includes(c.name)));
    }

    // Apply Sale Filter
    if (activeFilters.onSale) {
      result = result.filter(p => isOnSale(p.id?.toString() || ''));
    }

    // Apply Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.reverse();
        break;
      default:
        break;
    }

    return result;
  }, [categoryProducts, activeFilters, sortBy, isOnSale]);

  const hasActiveFilters = activeFilters.sizes.length > 0 || activeFilters.colors.length > 0 || activeFilters.priceRange[1] < 50000 || activeFilters.onSale;

  const categoryTitle = category ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : t('category.collection');

  const categoryHeroImages: Record<string, string> = {
    'men': 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=2070',
    'women': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2070',
    'accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=2070',
    'sale': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2070',
    'new-arrivals': 'https://images.unsplash.com/photo-1445205170230-053b830c6050?auto=format&fit=crop&q=80&w=2070',
    'lookbook': 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2070',
    'all': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e12?auto=format&fit=crop&q=80&w=2070'
  };

  const heroImage = categoryHeroImages[category?.toLowerCase() || 'all'] || categoryHeroImages['all'];

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen">
      <FilterSidebar 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
        availableSizes={availableSizes}
        availableColors={availableColors}
        resultsCount={filteredProducts.length}
      />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img 
            src={heroImage} 
            alt={categoryTitle}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </motion.div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-6 max-w-3xl"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/60">
              {t('category.collection')}
            </span>
            <h1 className="text-6xl md:text-8xl font-display font-bold text-white leading-none tracking-tighter uppercase">
              {categoryTitle}
            </h1>
            <p className="text-white/70 text-lg font-light max-w-xl mx-auto leading-relaxed">
              {t('category.categoryDesc', { category: categoryTitle.toLowerCase() })}
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent opacity-40" />
        </motion.div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20">
        {/* Controls Bar */}
        <div className="sticky top-24 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-100 dark:border-white/5 rounded-2xl px-8 py-4 mb-16 flex flex-wrap items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center space-x-12">
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="group flex items-center space-x-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{t('category.filter')}</span>
              {hasActiveFilters && (
                <span className="flex items-center justify-center w-4 h-4 bg-zinc-900 dark:bg-white text-white dark:text-black text-[8px] rounded-full">
                  {activeFilters.sizes.length + activeFilters.colors.length + (activeFilters.priceRange[1] < 50000 ? 1 : 0)}
                </span>
              )}
            </button>
            
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-[9px] text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.2em] font-bold">{t('category.sort')}</span>
              <div className="relative group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] outline-none cursor-pointer text-zinc-900 dark:text-white appearance-none pr-6"
                >
                  <option value="featured" className="dark:bg-zinc-900">{t('category.featured')}</option>
                  <option value="price-low" className="dark:bg-zinc-900">{t('category.priceLow')}</option>
                  <option value="price-high" className="dark:bg-zinc-900">{t('category.priceHigh')}</option>
                  <option value="newest" className="dark:bg-zinc-900">{t('category.newest')}</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <div className="hidden sm:flex items-center space-x-4 border-r border-zinc-100 dark:border-white/5 pr-8">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 transition-colors", viewMode === 'grid' ? "text-zinc-900 dark:text-white" : "text-zinc-300 dark:text-zinc-700")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("p-2 transition-colors", viewMode === 'list' ? "text-zinc-900 dark:text-white" : "text-zinc-300 dark:text-zinc-700")}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
              {t('category.itemsCount', { count: filteredProducts.length })}
            </span>
          </div>
        </div>

        {/* Product Grid */}
        <motion.div 
          layout
          className={cn(
            "grid gap-x-8 gap-y-20",
            viewMode === 'grid' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <ProductCard product={product} viewMode={viewMode} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-40 text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900 mb-8">
                  <Filter className="w-8 h-8 text-zinc-200 dark:text-zinc-800" />
                </div>
                <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] text-[11px]">{t('category.noProducts')}</p>
                <button 
                  onClick={() => setActiveFilters({ priceRange: [0, 50000], sizes: [], colors: [], onSale: false })}
                  className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-white border-b border-zinc-900 dark:border-white pb-1"
                >
                  {t('category.clearFilters')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryPage;
