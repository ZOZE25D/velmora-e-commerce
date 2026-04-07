import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: {
    priceRange: [number, number];
    sizes: string[];
    colors: string[];
    onSale: boolean;
  };
  setActiveFilters: React.Dispatch<React.SetStateAction<{
    priceRange: [number, number];
    sizes: string[];
    colors: string[];
    onSale: boolean;
  }>>;
  availableSizes: string[];
  availableColors: { name: string; hex: string }[];
  resultsCount: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  activeFilters,
  setActiveFilters,
  availableSizes,
  availableColors,
  resultsCount
}) => {
  const { t } = useTranslation();

  const handleSizeToggle = (size: string) => {
    setActiveFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (color: string) => {
    setActiveFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const resetFilters = () => {
    setActiveFilters({
      priceRange: [0, 50000],
      sizes: [],
      colors: [],
      onSale: false
    });
  };

  const hasActiveFilters = activeFilters.sizes.length > 0 || activeFilters.colors.length > 0 || activeFilters.priceRange[1] < 50000 || activeFilters.onSale;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with subtle blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[100]"
          />

          {/* Sidebar - Global Brand Aesthetic */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-white dark:bg-velmora-900 z-[110] shadow-[-20px_0_50px_rgba(0,0,0,0.05)] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] dark:text-white">{t('category.filterSort')}</h2>
                {hasActiveFilters && (
                  <button 
                    onClick={resetFilters}
                    className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors border-b border-black/20 dark:border-white/20 pb-0.5"
                  >
                    {t('category.clearAll')}
                  </button>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-2 -mr-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12">
              
              {/* Price Section */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/40 dark:text-white/40 mb-8">{t('category.priceRange')}</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 font-bold mb-2 block">{t('category.minPrice')}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={activeFilters.priceRange[0]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setActiveFilters(prev => ({ ...prev, priceRange: [val, prev.priceRange[1]] }));
                        }}
                        className="w-full bg-transparent border border-black/10 dark:border-white/10 h-12 px-4 text-[11px] font-mono focus:border-black dark:focus:border-white outline-none transition-colors dark:text-white"
                        placeholder="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-black/20 dark:text-white/20 uppercase">{t('common.currency')}</span>
                    </div>
                  </div>
                  <div className="w-4 h-[1px] bg-black/10 dark:bg-white/10 mt-6" />
                  <div className="flex-1">
                    <label className="text-[9px] uppercase tracking-widest text-black/30 dark:text-white/30 font-bold mb-2 block">{t('category.maxPrice')}</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={activeFilters.priceRange[1]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setActiveFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], val] }));
                        }}
                        className="w-full bg-transparent border border-black/10 dark:border-white/10 h-12 px-4 text-[11px] font-mono focus:border-black dark:focus:border-white outline-none transition-colors dark:text-white"
                        placeholder="50000"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-black/20 dark:text-white/20 uppercase">{t('common.currency')}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Size Section */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/40 dark:text-white/40 mb-8">{t('category.selectSize')}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map(size => {
                    const isSelected = activeFilters.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`h-12 flex items-center justify-center text-[11px] font-bold transition-all border ${
                          isSelected
                            ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                            : 'bg-white dark:bg-transparent text-black dark:text-white border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Color Section */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/40 dark:text-white/40 mb-8">{t('category.colorPalette')}</h3>
                <div className="grid grid-cols-6 gap-4">
                  {availableColors.map(color => {
                    const isSelected = activeFilters.colors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        onClick={() => handleColorToggle(color.name)}
                        className="group flex flex-col items-center space-y-2"
                      >
                        <div 
                          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'border-black dark:border-white scale-110' : 'border-black/5 dark:border-white/5 group-hover:border-black/20 dark:group-hover:border-white/20'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && (
                            <Check className={`w-4 h-4 ${
                              ['#ffffff', '#fffdd0', '#fad6a5', '#fcfcfc', '#fffff0'].includes(color.hex.toLowerCase()) 
                                ? 'text-black' 
                                : 'text-white'
                            }`} />
                          )}
                        </div>
                        <span className={`text-[9px] uppercase tracking-tighter transition-opacity dark:text-white ${isSelected ? 'opacity-100 font-bold' : 'opacity-0 group-hover:opacity-100'}`}>
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Sale Toggle */}
              <section className="pt-4">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-black dark:text-white group-hover:text-red-600 transition-colors">{t('category.onSaleOnly')}</span>
                    <p className="text-[9px] text-black/40 dark:text-white/40 uppercase tracking-widest">{t('category.onSaleDesc')}</p>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={activeFilters.onSale}
                      onChange={() => setActiveFilters(prev => ({ ...prev, onSale: !prev.onSale }))}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors duration-300 ${activeFilters.onSale ? 'bg-red-600' : 'bg-black/10 dark:bg-white/10'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${activeFilters.onSale ? 'translate-x-6' : ''}`} />
                    </div>
                  </div>
                </label>
              </section>
            </div>

            {/* Footer Action */}
            <div className="p-8 border-t border-black/5 dark:border-white/5 bg-white dark:bg-velmora-900">
              <button
                onClick={onClose}
                className="w-full bg-black dark:bg-white text-white dark:text-black h-14 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-black/90 dark:hover:bg-white/90 transition-all flex items-center justify-center space-x-3 group"
              >
                <span>{t('category.showResults', { count: resultsCount })}</span>
                <div className="w-1 h-1 bg-white/30 dark:bg-black/30 rounded-full group-hover:scale-[2] transition-transform" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar;
