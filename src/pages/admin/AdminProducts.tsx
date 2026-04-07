import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Package, 
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle,
  Tag,
  Percent,
  DollarSign,
  XCircle,
  Clock,
  CheckCircle2,
  Calendar,
  UploadCloud,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FirestoreService } from '../../services/FirestoreService';
import { useAppContext } from '../../context/AppContext';
import { compressImage } from '../../lib/utils';
import { toast } from 'sonner';

const AdminProducts: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice, getSaleForProduct, isOnSale, calculateFinalPrice, settings, language, categories } = useAppContext();
  const [activeTab, setActiveTab] = useState<'products' | 'sales'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [saleToDelete, setSaleToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    images: [] as string[],
    description: '',
    stock: '',
    category: 'Men',
    sizes: '', // Will be converted to array
    colors: [] as { name: string, hex: string }[],
    details: '' // Will be converted to array
  });

  const [saleFormData, setSaleFormData] = useState({
    productId: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive'
  });

  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedProducts, fetchedSales] = await Promise.all([
        FirestoreService.getCollection('products'),
        FirestoreService.getCollection('sales')
      ]);
      setProducts(fetchedProducts as any[]);
      setSales(fetchedSales as any[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        image: product.image || '',
        images: product.images || [],
        description: product.description || '',
        stock: product.stock?.toString() || '0',
        category: product.category || 'Men',
        sizes: (product.sizes || []).join(', '),
        colors: product.colors || [],
        details: (product.details || []).join('\n')
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        image: '',
        images: [],
        description: '',
        stock: '',
        category: 'Men',
        sizes: 'XS, S, M, L, XL',
        colors: [],
        details: 'Premium quality fabric\nHandcrafted details\nSustainable materials'
      });
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMainImage: boolean = true) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File is too large. Please use an image under 10MB.');
        return;
      }
      
      // Instant preview
      const previewUrl = URL.createObjectURL(file);
      if (isMainImage) {
        setFormData(prev => ({ ...prev, image: previewUrl }));
      } else {
        setFormData(prev => ({ ...prev, images: [...prev.images, previewUrl] }));
      }

      setIsUploading(true);
      try {
        // Background compression
        const compressedBase64 = await compressImage(file, 1000, 1000, 0.7);
        
        if (isMainImage) {
          setFormData(prev => ({ ...prev, image: compressedBase64 }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            images: prev.images.map(img => img === previewUrl ? compressedBase64 : img) 
          }));
        }
        // Clean up the object URL
        URL.revokeObjectURL(previewUrl);
      } catch (error) {
        console.error('Error uploading/compressing image:', error);
        // If compression fails, we still have the preview but we might want to alert
      } finally {
        setIsUploading(false);
      }
    }
  };

  const addColor = () => {
    if (newColor.name) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor({ name: '', hex: '#000000' });
    }
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const addImageUrl = (url: string) => {
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        details: formData.details.split('\n').map(d => d.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
      };

      // Ensure main image is in the images array too if it's not already
      if (productData.image && !productData.images.includes(productData.image)) {
        productData.images = [productData.image, ...productData.images];
      } else if (!productData.image && productData.images.length > 0) {
        // If main image is empty but gallery has images, use the first one as main
        productData.image = productData.images[0];
      }

      if (editingProduct) {
        await FirestoreService.updateDocument('products', editingProduct.id, productData);
      } else {
        await FirestoreService.addDocument('products', {
          ...productData,
          createdAt: new Date().toISOString()
        });
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    console.log('Deleting product:', id);
    setIsSubmitting(true);
    try {
      await FirestoreService.deleteDocument('products', id);
      await fetchData();
      setProductToDelete(null);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSale = async (id: string) => {
    console.log('Deleting sale:', id);
    setIsSubmitting(true);
    try {
      await FirestoreService.deleteDocument('sales', id);
      await fetchData();
      setSaleToDelete(null);
      toast.success('Sale deleted successfully');
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Failed to delete sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenSaleModal = (sale?: any) => {
    if (sale) {
      setEditingSale(sale);
      setSaleFormData({
        productId: sale.productId,
        discountType: sale.discountType,
        discount: sale.discount.toString(),
        startDate: sale.startDate,
        endDate: sale.endDate,
        status: sale.status
      });
    } else {
      setEditingSale(null);
      setSaleFormData({
        productId: '',
        discountType: 'percentage',
        discount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      });
    }
    setIsSaleModalOpen(true);
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const saleData = {
        ...saleFormData,
        discount: parseFloat(saleFormData.discount),
        updatedAt: new Date().toISOString()
      };

      if (editingSale) {
        await FirestoreService.updateDocument('sales', editingSale.id, saleData);
      } else {
        await FirestoreService.addDocument('sales', {
          ...saleData,
          createdAt: new Date().toISOString()
        });
      }
      await fetchData();
      setIsSaleModalOpen(false);
    } catch (error) {
      console.error('Error saving sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || 
                            p.category?.toLowerCase() === categoryFilter.toLowerCase();
    
    let matchesStock = true;
    if (stockFilter !== 'all') {
      const stock = p.stock || 0;
      if (stockFilter === 'out') matchesStock = stock === 0;
      else if (stockFilter === 'low') matchesStock = stock > 0 && stock <= (settings.lowStockThreshold || 5);
      else if (stockFilter === 'in') matchesStock = stock > (settings.lowStockThreshold || 5);
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const filteredSales = sales.filter(s => {
    const product = products.find(p => p.id === s.productId);
    return product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.productId?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const minThreshold = parseInt(settings?.minStockThreshold || '5');
  const highThreshold = parseInt(settings?.highStockThreshold || '50');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">Inventory & Sales</h1>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm mt-1">Manage your products and promotional campaigns.</p>
        </div>
        <div className="flex space-x-3">
          {activeTab === 'products' ? (
            <button 
              onClick={() => handleOpenModal()}
              className="bg-velmora-900 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 transition-all flex items-center space-x-2 shadow-lg shadow-velmora-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          ) : (
            <button 
              onClick={() => handleOpenSaleModal()}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-all flex items-center space-x-2 shadow-lg shadow-red-600/20"
            >
              <Tag className="w-4 h-4" />
              <span>Launch Sale</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-velmora-100 dark:bg-velmora-900 p-1 rounded-2xl w-fit border border-velmora-200 dark:border-white/5">
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white dark:bg-velmora-800 text-velmora-900 dark:text-white shadow-sm' : 'text-velmora-400 dark:text-velmora-500 hover:text-velmora-600 dark:hover:text-velmora-300'}`}
        >
          <Package className="w-4 h-4" />
          <span>All Products</span>
        </button>
        <button 
          onClick={() => setActiveTab('sales')}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'sales' ? 'bg-white dark:bg-velmora-800 text-red-600 shadow-sm' : 'text-velmora-400 dark:text-velmora-500 hover:text-velmora-600 dark:hover:text-velmora-300'}`}
        >
          <Tag className="w-4 h-4" />
          <span>Sales & Discounts</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-velmora-900 p-4 rounded-2xl border border-velmora-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400" />
          <input 
            type="text" 
            placeholder={activeTab === 'products' ? "Search products..." : "Search sales by product..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 transition-all dark:text-white"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-velmora-400 hover:text-velmora-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Filter className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400`} />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`appearance-none ${language === 'ar' ? 'pr-12 pl-10' : 'pl-12 pr-10'} py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white transition-all outline-none cursor-pointer`}
            >
              <option value="all">{t('common.all')} {t('nav.categories')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-3 h-3 text-velmora-400 pointer-events-none`} />
          </div>

          <div className="relative">
            <Filter className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400`} />
            <select 
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className={`appearance-none ${language === 'ar' ? 'pr-12 pl-10' : 'pl-12 pr-10'} py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white transition-all outline-none cursor-pointer`}
            >
              <option value="all">{t('common.all')} {t('stock')}</option>
              <option value="in">{t('in Stock')}</option>
              <option value="low">{t('low Stock')}</option>
              <option value="out">{t('OUT OF STOCK')}</option>
            </select>
            <ChevronDown className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-3 h-3 text-velmora-400 pointer-events-none`} />
          </div>
          <div className="h-8 w-px bg-velmora-200 dark:bg-white/10 mx-2"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">
            {activeTab === 'products' ? `${filteredProducts.length} Products` : `${filteredSales.length} Active Sales`}
          </p>
        </div>
      </div>

      {activeTab === 'products' ? (
        /* Products Table */
        <div className="bg-white dark:bg-velmora-900 rounded-3xl border border-velmora-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-velmora-50/50 dark:bg-white/5">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Product</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Category</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Price</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Stock</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-velmora-100 dark:divide-white/5">
                {filteredProducts.map((product) => {
                  const sale = getSaleForProduct(product.id);
                  const activeSale = isOnSale(product.id);
                  
                  return (
                    <tr key={product.id} className="hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-velmora-100 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-velmora-200 dark:border-white/10">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-velmora-400 dark:text-velmora-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-velmora-900 dark:text-white">{product.name}</p>
                              {activeSale && (
                                <span className="bg-red-50 dark:bg-red-900/20 text-red-600 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30">
                                  Sale
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-velmora-500 dark:text-velmora-400 uppercase tracking-widest font-bold">ID: {product.id?.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400 bg-velmora-100 dark:bg-white/5 px-3 py-1 rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <p className={`text-sm font-bold ${activeSale ? 'text-red-600' : 'text-velmora-900 dark:text-white'}`}>
                            {activeSale ? formatPrice(calculateFinalPrice(product)) : formatPrice(product.price)}
                          </p>
                          {activeSale && sale && (
                            <p className="text-[10px] text-velmora-400 dark:text-velmora-500 line-through">
                              {formatPrice(product.price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className={`text-sm font-bold ${product.stock <= minThreshold ? 'text-red-600' : 'text-velmora-900 dark:text-white'}`}>
                          {product.stock} units
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            product.stock >= highThreshold ? 'bg-emerald-500' : 
                            product.stock > minThreshold ? 'bg-blue-500' : 
                            product.stock > 0 ? 'bg-amber-500' : 
                            'bg-red-500'
                          }`}></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400">
                            {product.stock >= highThreshold ? 'High Stock' : 
                             product.stock > minThreshold ? 'In Stock' : 
                             product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenModal(product)}
                            className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-lg transition-colors text-velmora-400 dark:text-velmora-500 hover:text-velmora-900 dark:hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductToDelete(product);
                            }}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-velmora-400 dark:text-velmora-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-velmora-500 dark:text-velmora-400">
                      <div className="flex flex-col items-center space-y-4">
                        <Package className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-medium">No products found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Sales Table */
        <div className="bg-white dark:bg-velmora-900 rounded-3xl border border-velmora-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-velmora-50/50 dark:bg-white/5">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Product</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Discount</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Period</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-velmora-100 dark:divide-white/5">
                {filteredSales.map((sale) => {
                  const product = products.find(p => p.id === sale.productId);
                  if (!product) return null;
                  
                  return (
                    <tr key={sale.id} className="hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-velmora-100 dark:bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-velmora-200 dark:border-white/10">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-velmora-300 dark:text-velmora-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-velmora-900 dark:text-white">{product.name}</p>
                            <p className="text-[10px] text-velmora-500 dark:text-velmora-400 font-medium">{formatPrice(product.price)} original</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-red-600">
                            {sale.discountType === 'percentage' ? `-${sale.discount}%` : `-${formatPrice(sale.discount)}`}
                          </span>
                          <span className="text-[10px] text-velmora-400 dark:text-velmora-500">
                            → {formatPrice(sale.discountType === 'percentage' ? product.price * (1 - sale.discount/100) : Math.max(0, product.price - sale.discount))}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2 text-velmora-500 dark:text-velmora-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {(() => {
                          const now = new Date();
                          const start = new Date(sale.startDate);
                          const end = new Date(sale.endDate);
                          const isExpired = end < now;
                          const isFuture = start > now;
                          
                          return (
                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${
                              isExpired ? 'bg-red-50 text-red-600 border-red-100' :
                              isFuture ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              sale.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              'bg-velmora-50 text-velmora-400 border-velmora-100 dark:bg-white/5 dark:text-velmora-500 dark:border-white/10'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                isExpired ? 'bg-red-500' :
                                isFuture ? 'bg-amber-500' :
                                sale.status === 'active' ? 'bg-emerald-500' : 
                                'bg-velmora-400 dark:bg-velmora-600'
                              }`} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                {isExpired ? 'Expired' : isFuture ? 'Scheduled' : sale.status}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenSaleModal(sale)}
                            className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-lg transition-colors text-velmora-400 dark:text-velmora-500 hover:text-velmora-900 dark:hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSaleToDelete(sale);
                            }}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-velmora-400 dark:text-velmora-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSales.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-velmora-500 dark:text-velmora-400">
                      <div className="flex flex-col items-center space-y-4">
                        <Tag className="w-12 h-12 opacity-20" />
                        <p className="text-sm font-medium">No active sales found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductToDelete(null)}
              className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-velmora-900 w-full max-w-md rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-velmora-900 dark:text-white mb-2">Delete Product?</h3>
              <p className="text-velmora-500 dark:text-velmora-400 text-sm mb-8">
                Are you sure you want to delete <span className="font-bold text-velmora-900 dark:text-white">"{productToDelete.name}"</span>? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 px-6 py-3 bg-velmora-100 dark:bg-white/5 text-velmora-500 dark:text-velmora-400 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-velmora-200 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={() => handleDelete(productToDelete.id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Sale Confirmation Modal */}
      <AnimatePresence>
        {saleToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSaleToDelete(null)}
              className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-velmora-900 w-full max-w-md rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-velmora-900 dark:text-white mb-2">Delete Sale?</h3>
              <p className="text-velmora-500 dark:text-velmora-400 text-sm mb-8">
                Are you sure you want to delete this sale? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setSaleToDelete(null)}
                  className="flex-1 px-6 py-3 bg-velmora-100 dark:bg-white/5 text-velmora-500 dark:text-velmora-400 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-velmora-200 dark:hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={() => handleDeleteSale(saleToDelete.id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-velmora-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-velmora-100 dark:border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold text-velmora-900 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-xl transition-colors text-velmora-400 dark:text-velmora-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Product Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                      placeholder="e.g. Premium Silk Scarf"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                      <option value="Sale">Sale</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Price (EGP)</label>
                    <input 
                      required
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Stock Quantity</label>
                    <input 
                      required
                      type="number" 
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Media Section */}
                <div className="space-y-4 pt-4 border-t border-velmora-100 dark:border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-white">Product Media</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Main Image (URL or Upload)</label>
                      <div className="flex gap-4">
                        <input 
                          type="url" 
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                          className="flex-1 px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                          placeholder="https://images.unsplash.com/..."
                        />
                        <div className="relative">
                          <button 
                            type="button" 
                            disabled={isUploading}
                            className="px-4 py-3 bg-velmora-100 dark:bg-white/5 text-velmora-600 dark:text-velmora-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-200 dark:hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                            <span>Upload</span>
                          </button>
                          <input 
                            disabled={isUploading}
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, true)}
                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                          />
                        </div>
                      </div>
                      {formData.image && (
                        <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-velmora-200 dark:border-white/10">
                          <img 
                            src={formData.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Additional Images</label>
                      <div className="flex gap-4">
                        <input 
                          id="additional-image-url"
                          type="url" 
                          className="flex-1 px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                          placeholder="Paste image URL here..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addImageUrl((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <div className="relative">
                          <button 
                            type="button" 
                            disabled={isUploading}
                            className="px-4 py-3 bg-velmora-100 dark:bg-white/5 text-velmora-600 dark:text-velmora-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-200 dark:hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                            <span>Upload</span>
                          </button>
                          <input 
                            disabled={isUploading}
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, false)}
                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 mt-2">
                        {formData.images.map((img, idx) => img && (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-velmora-200 dark:border-white/10">
                            <img 
                              src={img} 
                              alt="" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                            <button 
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attributes Section */}
                <div className="space-y-4 pt-4 border-t border-velmora-100 dark:border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-white">Product Attributes</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Available Sizes (comma separated)</label>
                      <input 
                        type="text" 
                        value={formData.sizes}
                        onChange={(e) => setFormData({...formData, sizes: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                        placeholder="XS, S, M, L, XL"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Colors</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Color Name"
                          value={newColor.name}
                          onChange={(e) => setNewColor({...newColor, name: e.target.value})}
                          className="flex-1 px-3 py-2 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-velmora-900/10 transition-all text-velmora-900 dark:text-white"
                        />
                        <input 
                          type="color" 
                          value={newColor.hex}
                          onChange={(e) => setNewColor({...newColor, hex: e.target.value})}
                          className="w-10 h-10 p-1 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl cursor-pointer"
                        />
                        <button 
                          type="button"
                          onClick={addColor}
                          className="px-3 py-2 bg-velmora-900 dark:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-white/20 transition-all"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.colors.map((color, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-velmora-100 dark:bg-white/5 rounded-lg border border-velmora-200 dark:border-white/10">
                            <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                            <span className="text-[10px] font-bold text-velmora-600 dark:text-velmora-400">{color.name}</span>
                            <button type="button" onClick={() => removeColor(idx)} className="text-velmora-400 dark:text-velmora-500 hover:text-red-500 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-velmora-100 dark:border-white/5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Description</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all resize-none text-velmora-900 dark:text-white"
                    placeholder="Describe the product details..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Composition & Care (one per line)</label>
                  <textarea 
                    rows={3}
                    value={formData.details}
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all resize-none text-velmora-900 dark:text-white"
                    placeholder="e.g. 100% Organic Cotton"
                  />
                </div>

                <div className="pt-4 flex flex-col space-y-4 sticky bottom-0 bg-white dark:bg-velmora-900 pb-2">
                  <div className="flex space-x-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-8 py-4 bg-velmora-100 dark:bg-white/5 text-velmora-500 dark:text-velmora-400 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-200 dark:hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-1 px-8 py-4 bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                      )}
                    </button>
                  </div>
                  {editingProduct && (
                    <button 
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setProductToDelete(editingProduct);
                      }}
                      className="w-full px-8 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Product</span>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add/Edit Sale Modal */}
      <AnimatePresence>
        {isSaleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSaleModalOpen(false)}
              className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-velmora-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-velmora-100 dark:border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold text-velmora-900 dark:text-white">
                  {editingSale ? 'Edit Sale' : 'Launch New Sale'}
                </h2>
                <button 
                  onClick={() => setIsSaleModalOpen(false)}
                  className="p-2 hover:bg-velmora-100 dark:hover:bg-white/5 rounded-xl transition-colors text-velmora-400 dark:text-velmora-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Select Product</label>
                  <select 
                    required
                    value={saleFormData.productId}
                    onChange={(e) => setSaleFormData({...saleFormData, productId: e.target.value})}
                    className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Discount Type</label>
                    <div className="flex bg-velmora-50 dark:bg-white/5 p-1 rounded-xl border border-velmora-100 dark:border-white/10">
                      <button 
                        type="button"
                        onClick={() => setSaleFormData({...saleFormData, discountType: 'percentage'})}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${saleFormData.discountType === 'percentage' ? 'bg-white dark:bg-velmora-800 shadow-sm text-velmora-900 dark:text-white' : 'text-velmora-400 dark:text-velmora-500'}`}
                      >
                        Percentage (%)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setSaleFormData({...saleFormData, discountType: 'fixed'})}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${saleFormData.discountType === 'fixed' ? 'bg-white dark:bg-velmora-800 shadow-sm text-velmora-900 dark:text-white' : 'text-velmora-400 dark:text-velmora-500'}`}
                      >
                        Fixed Amount
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Discount Value</label>
                    <div className="relative">
                      <input 
                        required
                        type="number" 
                        value={saleFormData.discount}
                        onChange={(e) => setSaleFormData({...saleFormData, discount: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                        placeholder="0"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-velmora-400 dark:text-velmora-500">
                        {saleFormData.discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Start Date</label>
                    <input 
                      required
                      type="date" 
                      value={saleFormData.startDate}
                      onChange={(e) => setSaleFormData({...saleFormData, startDate: e.target.value})}
                      className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">End Date</label>
                    <input 
                      required
                      type="date" 
                      value={saleFormData.endDate}
                      onChange={(e) => setSaleFormData({...saleFormData, endDate: e.target.value})}
                      className="w-full px-4 py-3 bg-velmora-50 dark:bg-white/5 border border-velmora-100 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:focus:border-white/20 transition-all text-velmora-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">Final Price Preview</p>
                    <p className="text-xl font-display font-bold text-red-600">
                      {(() => {
                        const product = products.find(p => p.id === saleFormData.productId);
                        if (!product || !saleFormData.discount) return '---';
                        const price = parseFloat(product.price);
                        const discount = parseFloat(saleFormData.discount);
                        if (saleFormData.discountType === 'percentage') {
                          return formatPrice(price - (price * discount / 100));
                        } else {
                          return formatPrice(Math.max(0, price - discount));
                        }
                      })()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Active</span>
                      <button 
                        type="button"
                        onClick={() => setSaleFormData({...saleFormData, status: saleFormData.status === 'active' ? 'inactive' : 'active'})}
                        className={`w-12 h-6 rounded-full transition-all relative ${saleFormData.status === 'active' ? 'bg-red-600' : 'bg-velmora-200 dark:bg-white/10'}`}
                      >
                        <motion.div 
                          animate={{ x: saleFormData.status === 'active' ? 24 : 4 }}
                          className="absolute top-1 left-0 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full shadow-sm"
                        />
                      </button>
                  </div>
                </div>

                <div className="pt-4 flex flex-col space-y-4">
                  <div className="flex space-x-4">
                    <button 
                      type="button"
                      onClick={() => setIsSaleModalOpen(false)}
                      className="flex-1 px-8 py-4 bg-velmora-100 dark:bg-white/5 text-velmora-500 dark:text-velmora-400 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-200 dark:hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-1 px-8 py-4 bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 dark:hover:bg-velmora-100 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>{editingSale ? 'Update Sale' : 'Launch Sale'}</span>
                      )}
                    </button>
                  </div>
                  {editingSale && (
                    <button 
                      type="button"
                      onClick={() => {
                        setIsSaleModalOpen(false);
                        setSaleToDelete(editingSale);
                      }}
                      className="w-full px-8 py-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Sale</span>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
