import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, TrendingUp, Clock, Image as ImageIcon } from 'lucide-react';
import { useAppContext, Product } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { FirestoreService } from '../../services/FirestoreService';

const SearchOverlay: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, formatPrice } = useAppContext();
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches] = useState(['Coats', 'Silk Dress', 'Winter Collection']);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await FirestoreService.getCollection('products', []);
      if (data) {
        setAllProducts(data as Product[]);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, allProducts]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-white dark:bg-velmora-950 z-[200] overflow-y-auto transition-colors duration-300"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-16">
              <span className="text-xl font-display font-bold tracking-tighter dark:text-white">VELMORA</span>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all"
              >
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            {/* Search Input */}
            <div className="max-w-4xl mx-auto mb-20">
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-black/20 dark:text-white/20 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search our collection..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-black/10 dark:border-white/10 py-8 pl-12 pr-4 text-4xl font-display focus:outline-none focus:border-black dark:focus:border-white transition-all placeholder:text-black/10 dark:placeholder:text-white/10 dark:text-white"
                />
              </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
              {/* Left: Suggestions & Recent */}
              <div className="md:col-span-1 space-y-16">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 dark:text-white/30 mb-8 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-2" />
                    Trending
                  </h3>
                  <div className="flex flex-col space-y-4">
                    {['New Arrivals', 'Best Sellers', 'Sale', 'Accessories'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="text-left text-[11px] font-bold uppercase tracking-[0.1em] text-black dark:text-white hover:text-black/50 dark:hover:text-white/50 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 dark:text-white/30 mb-8 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-2" />
                    Recent
                  </h3>
                  <div className="space-y-4">
                    {recentSearches.map(search => (
                      <button 
                        key={search}
                        onClick={() => setQuery(search)}
                        className="block text-left text-[11px] font-bold uppercase tracking-[0.1em] text-black dark:text-white hover:text-black/50 dark:hover:text-white/50 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Results */}
              <div className="md:col-span-3">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/30 dark:text-white/30 mb-10">
                  {query ? `Results for "${query}" (${results.length})` : 'Popular Products'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {(query ? results : allProducts.slice(0, 6)).map((product) => (
                    <Link 
                      key={product.id} 
                      to={`/product/${product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="group"
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-velmora-50 dark:bg-velmora-900 mb-4">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-velmora-300" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.1em] text-black dark:text-white group-hover:text-black/50 dark:group-hover:text-white/50 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-[10px] font-mono text-black/40 dark:text-white/40">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                  
                  {query && results.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/20 dark:text-white/20">No products found matching your search.</p>
                    </div>
                  )}
                </div>

                {results.length > 0 && (
                  <Link 
                    to="/category/all"
                    onClick={() => setIsSearchOpen(false)}
                    className="mt-16 w-full py-5 border border-black/10 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all flex items-center justify-center group"
                  >
                    View All Results
                    <ArrowRight className="ml-3 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
