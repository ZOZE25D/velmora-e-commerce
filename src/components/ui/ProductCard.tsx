import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Heart, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export interface Product {
  id: number | string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  isNew?: boolean;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = 'grid' }) => {
  const { t } = useTranslation();
  const { addToCart, toggleFavorite, isFavorite, formatPrice, calculateFinalPrice, isOnSale, getSaleForProduct, settings } = useAppContext();
  const productId = product?.id?.toString() || '';
  const favorited = isFavorite(productId);
  const onSale = isOnSale(productId);
  const finalPrice = calculateFinalPrice(product);
  const activeSale = getSaleForProduct(productId);

  const stock = product.stock ?? 0;
  const minThreshold = parseInt(settings?.minStockThreshold || '5');
  const isLowStock = stock > 0 && stock <= minThreshold;
  const isOutStock = stock <= 0;

  const mainImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : null);
  const secondaryImage = product.images && product.images.length > 1 ? product.images[1] : null;

  if (viewMode === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="group relative flex flex-col sm:flex-row gap-8 bg-velmora-50 dark:bg-stone-900/50 p-6 rounded-2xl border border-velmora-100 dark:border-white/5 hover:border-velmora-200 dark:hover:border-white/10 transition-all duration-500"
      >
        <div className="relative w-full sm:w-64 aspect-[3/4] sm:aspect-square overflow-hidden bg-velmora-100 dark:bg-velmora-800/50 rounded-xl flex-shrink-0">
          <Link to={`/product/${product.id}`} className="block h-full w-full">
            <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 pointer-events-none">
              {product.isNew && !isOutStock && (
                <span className="bg-velmora-50/95 dark:bg-velmora-900/95 text-velmora-900 dark:text-velmora-50 text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 backdrop-blur-md shadow-sm">
                  {t('product.new')}
                </span>
              )}
              {onSale && activeSale && !isOutStock && (
                <span className="bg-red-600 text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 shadow-sm">
                  {activeSale.discountType === 'percentage' ? `-${activeSale.discount}%` : `-${activeSale.discount} EGP`}
                </span>
              )}
            </div>
            
            <div className="relative h-full w-full overflow-hidden">
              {mainImage ? (
                <img 
                  src={mainImage} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-[1.5s] ease-[0.22,1,0.36,1] group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-velmora-100 dark:bg-stone-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-velmora-300 dark:text-stone-700" />
                </div>
              )}
            </div>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-between py-2">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-velmora-900 dark:text-velmora-50 text-xl font-display font-bold uppercase tracking-tight mb-2">
                  {product.name}
                </h3>
                <p className="text-velmora-500 dark:text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                  {product.category}
                </p>
              </div>
              <div className="text-right">
                {onSale ? (
                  <div className="flex flex-col items-end">
                    <span className="text-red-600 text-xl font-bold">
                      {formatPrice(finalPrice)}
                    </span>
                    <span className="text-velmora-400 text-sm line-through opacity-60">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-velmora-900 dark:text-velmora-50 text-xl font-bold">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
              {isOutStock ? (
                <span className="text-velmora-400 text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 bg-velmora-100 dark:bg-stone-800 rounded-full">
                  {t('OUT OF STOCK')}
                </span>
              ) : isLowStock ? (
                <span className="text-amber-600 text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 bg-amber-50 dark:bg-amber-900/10 rounded-full">
                  {t('product.low_stock')}
                </span>
              ) : (
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 bg-emerald-50 dark:bg-emerald-900/10 rounded-full">
                  {t('product.in_stock')}
                </span>
              )}
              <span className="text-velmora-400 text-[10px] font-bold uppercase tracking-[0.1em]">
                {stock} {t('product.units')} {t('product.available')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => addToCart(product)}
              disabled={isOutStock}
              className={cn(
                "flex-1 h-14 flex items-center justify-center gap-3 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all duration-300",
                isOutStock
                  ? "bg-velmora-100 dark:bg-stone-800 text-velmora-400 cursor-not-allowed"
                  : "bg-velmora-900 dark:bg-velmora-50 text-velmora-50 dark:text-velmora-900 hover:bg-velmora-800 dark:hover:bg-velmora-100 shadow-lg shadow-velmora-900/10 dark:shadow-white/5"
              )}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('product.addToCart')}</span>
            </button>
            <button 
              onClick={() => toggleFavorite(productId)}
              className={cn(
                "w-14 h-14 flex items-center justify-center rounded-xl border transition-all duration-300",
                favorited 
                  ? "bg-red-500 text-white border-red-500" 
                  : "bg-velmora-50 dark:bg-stone-900 text-velmora-900 dark:text-velmora-50 border-velmora-200 dark:border-white/10 hover:border-velmora-900 dark:hover:border-white"
              )}
            >
              <Heart className={cn("w-5 h-5", favorited && "fill-current")} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-velmora-100 dark:bg-velmora-900 rounded-[2px] cursor-pointer">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          {/* Badges Container */}
          <div className="absolute top-4 left-4 z-30 flex flex-col gap-2 pointer-events-none">
            {product.isNew && !isOutStock && (
              <span className="bg-velmora-50/95 dark:bg-velmora-900/95 text-velmora-900 dark:text-velmora-50 text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 backdrop-blur-md shadow-sm">
                {t('product.new')}
              </span>
            )}
            {onSale && activeSale && !isOutStock && (
              <span className="bg-red-600 text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 shadow-sm">
                {activeSale.discountType === 'percentage' ? `-${activeSale.discount}%` : `-${activeSale.discount} EGP`}
              </span>
            )}
          </div>
          
          {/* Image Layer */}
          <div className="relative h-full w-full overflow-hidden">
            {mainImage ? (
              <>
                <img 
                  src={mainImage} 
                  alt={product.name}
                  className={cn(
                    "w-full h-full object-cover transition-all duration-[1.5s] ease-[0.22,1,0.36,1]",
                    secondaryImage ? "group-hover:opacity-0 group-hover:scale-110" : "group-hover:scale-110"
                  )}
                  referrerPolicy="no-referrer"
                />
                {secondaryImage && (
                  <img 
                    src={secondaryImage} 
                    alt={`${product.name} alternate`}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 scale-110 group-hover:scale-100 transition-all duration-[1.5s] ease-[0.22,1,0.36,1]"
                    referrerPolicy="no-referrer"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full bg-velmora-100 dark:bg-stone-800 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-velmora-300 dark:text-stone-700" />
              </div>
            )}
          </div>

          {/* Sophisticated Frosted Label Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]">
            <div className="bg-velmora-50/80 dark:bg-velmora-900/80 backdrop-blur-md p-5 shadow-xl shadow-black/5 border border-white/20 dark:border-white/5 rounded-sm">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-velmora-900 dark:text-velmora-50 text-[13px] font-bold uppercase tracking-[0.15em] leading-tight mb-1">
                    {product.name}
                  </h3>
                  <p className="text-velmora-500 dark:text-stone-400 text-[10px] uppercase tracking-[0.1em] font-medium">
                    {product.category}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {onSale ? (
                    <div className="flex flex-col items-end">
                      <span className="text-red-600 text-[11px] font-bold">
                        {formatPrice(finalPrice)}
                      </span>
                      <span className="text-velmora-400 text-[9px] line-through opacity-60">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-velmora-900 dark:text-velmora-50 text-[12px] font-bold">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Divider & Stock - Matching Screenshot */}
              <div className="pt-3 border-t border-velmora-100 dark:border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isOutStock ? (
                    <span className="text-velmora-400 text-[10px] font-medium uppercase tracking-[0.1em]">
                      {t('OUT OF STOCK')}
                    </span>
                  ) : isLowStock ? (
                    <span className="text-amber-600 text-[10px] font-bold uppercase tracking-[0.1em]">
                      {t('product.low_stock')}
                    </span>
                  ) : (
                    <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-[0.1em]">
                      {t('product.in_stock')}
                    </span>
                  )}
                </div>
                <span className="text-emerald-600 text-[10px] font-medium uppercase tracking-[0.05em]">
                  {stock} {t('product.units')}
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Floating Action Buttons */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 ease-[0.22,1,0.36,1]">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(productId);
            }}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl border border-white/20 transition-all duration-300",
              favorited 
                ? "bg-red-500 text-white border-red-500" 
                : "bg-white/10 text-white hover:bg-white hover:text-black"
            )}
          >
            <Heart className={cn("w-4 h-4", favorited && "fill-current")} />
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            disabled={isOutStock}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl border border-white/20 transition-all duration-300",
              isOutStock
                ? "bg-white/5 text-white/20 cursor-not-allowed"
                : "bg-white/10 text-white hover:bg-white hover:text-black"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
