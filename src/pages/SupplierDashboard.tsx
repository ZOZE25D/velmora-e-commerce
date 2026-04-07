import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  LayoutGrid, 
  List, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye,
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  Clock,
  XCircle,
  Image as ImageIcon,
  Tag,
  Percent,
  Calendar,
  DollarSign,
  ToggleLeft as Toggle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Truck,
  User as UserIcon,
  MapPin,
  ChevronRight,
  ExternalLink,
  UploadCloud,
  RefreshCcw
} from 'lucide-react';
import { FirestoreService } from '../services/FirestoreService';
import { useAppContext, Sale } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { compressImage } from '../lib/utils';
import { products as initialProducts } from '../data/products';

const SupplierDashboard: React.FC = () => {
  const { 
    isSupplier, 
    user, 
    supplierStatus, 
    isOnSale, 
    getSaleForProduct, 
    calculateFinalPrice,
    formatPrice,
    settings
  } = useAppContext();
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'orders' | 'returns'>('inventory');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isReturnDetailModalOpen, setIsReturnDetailModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    images: [] as string[],
    description: '',
    stock: '',
    category: 'Women',
    sizes: 'XS, S, M, L, XL',
    colors: [] as { name: string, hex: string }[],
    details: 'Premium quality fabric\nHandcrafted details\nSustainable materials'
  });

  const [saleFormData, setSaleFormData] = useState({
    productId: '',
    discount: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive'
  });
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
        details: formData.details.split('\n').map(d => d.trim()).filter(Boolean),
        supplierId: user.uid,
        isNew: true,
        createdAt: new Date().toISOString()
      };

      if (productData.image && !productData.images.includes(productData.image)) {
        productData.images = [productData.image, ...productData.images];
      }

      await FirestoreService.addDocument('products', productData);
      setIsAddModalOpen(false);
      resetFormData();
      const fetchedProducts = await FirestoreService.getSupplierProducts(user.uid);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingProduct) return;
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

      if (productData.image && !productData.images.includes(productData.image)) {
        productData.images = [productData.image, ...productData.images];
      }

      await FirestoreService.updateDocument('products', editingProduct.id, productData);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      resetFormData();
      const fetchedProducts = await FirestoreService.getSupplierProducts(user.uid);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await FirestoreService.deleteDocument('products', productToDelete);
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      
      // Also delete associated sales
      const associatedSales = sales.filter(s => s.productId === productToDelete);
      for (const sale of associatedSales) {
        await FirestoreService.deleteDocument('sales', sale.id);
      }
      setSales(prev => prev.filter(s => s.productId !== productToDelete));
      
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const saleData = {
        ...saleFormData,
        discount: parseFloat(saleFormData.discount),
        supplierId: user.uid,
        createdAt: new Date().toISOString()
      };

      await FirestoreService.addDocument('sales', saleData);
      setIsSaleModalOpen(false);
      resetSaleFormData();
      const fetchedSales = await FirestoreService.getSupplierSales(user.uid);
      setSales(fetchedSales as Sale[]);
    } catch (error) {
      console.error('Error adding sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingSale) return;
    setIsSubmitting(true);
    try {
      const saleData = {
        ...saleFormData,
        discount: parseFloat(saleFormData.discount),
        updatedAt: new Date().toISOString()
      };

      await FirestoreService.updateDocument('sales', editingSale.id, saleData);
      setIsSaleModalOpen(false);
      setEditingSale(null);
      resetSaleFormData();
      const fetchedSales = await FirestoreService.getSupplierSales(user.uid);
      setSales(fetchedSales as Sale[]);
    } catch (error) {
      console.error('Error updating sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (!user) return;
    try {
      const order = orders.find(o => o.id === orderId);
      const updateData: any = { status };
      
      // If order is completed and payment is COD, mark as paid
      if (status === 'completed' && order?.paymentMethod === 'cod') {
        updateData.paymentStatus = 'paid';
      }

      await FirestoreService.updateDocument('orders', orderId, updateData);
      const fetchedOrders = await FirestoreService.getSupplierOrders(user.uid);
      setOrders(fetchedOrders || []);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ...updateData });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    if (!user) return;
    try {
      await FirestoreService.updateDocument('orders', orderId, { paymentStatus: 'paid' });
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: 'paid' });
      }
      const fetchedOrders = await FirestoreService.getSupplierOrders(user.uid);
      setOrders(fetchedOrders || []);
      toast.success('Payment confirmed successfully');
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    }
  };

  const handleUpdateReturnStatus = async (returnId: string, status: string) => {
    if (!user) return;
    try {
      const ret = returns.find(r => r.id === returnId);
      await FirestoreService.updateDocument('returns', returnId, { status });
      
      // Update associated order status if needed
      if (ret && ret.orderId) {
        await FirestoreService.updateDocument('orders', ret.orderId, { returnStatus: status });
      }
      
      const fetchedReturns = await FirestoreService.getSupplierReturns(user.uid);
      setReturns(fetchedReturns || []);
      if (selectedReturn && selectedReturn.id === returnId) {
        setSelectedReturn({ ...selectedReturn, status });
      }
      toast.success('Return status updated successfully');
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error('Failed to update return status');
    }
  };

  const handleDeleteSale = async (saleId: string) => {
    try {
      await FirestoreService.deleteDocument('sales', saleId);
      setSales(prev => prev.filter(s => s.id !== saleId));
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const resetSaleFormData = () => {
    setSaleFormData({
      productId: '',
      discount: '',
      discountType: 'percentage',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active'
    });
  };

  const openSaleModal = (sale?: Sale) => {
    if (sale) {
      setEditingSale(sale);
      setSaleFormData({
        productId: sale.productId,
        discount: sale.discount.toString(),
        discountType: sale.discountType,
        startDate: sale.startDate,
        endDate: sale.endDate,
        status: sale.status
      });
    } else {
      resetSaleFormData();
    }
    setIsSaleModalOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (categoryFilter === 'Sale') {
      return matchesSearch && isOnSale(product.id?.toString() || '');
    }
    const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const minThreshold = parseInt(settings?.minStockThreshold || '5');
  const highThreshold = parseInt(settings?.highStockThreshold || '50');

  const resetFormData = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      images: [],
      description: '',
      stock: '',
      category: 'Women',
      sizes: 'XS, S, M, L, XL',
      colors: [],
      details: 'Premium quality fabric\nHandcrafted details\nSustainable materials'
    });
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price?.toString() || '',
      image: product.image || '',
      images: product.images || [],
      description: product.description || '',
      stock: product.stock?.toString() || '0',
      category: product.category || 'Women',
      sizes: (product.sizes || []).join(', '),
      colors: product.colors || [],
      details: (product.details || []).join('\n')
    });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [fetchedProducts, fetchedSales, fetchedOrders, fetchedReturns] = await Promise.all([
          FirestoreService.getSupplierProducts(user.uid),
          FirestoreService.getSupplierSales(user.uid),
          FirestoreService.getSupplierOrders(user.uid),
          FirestoreService.getSupplierReturns(user.uid)
        ]);
        setProducts(fetchedProducts);
        setSales(fetchedSales as Sale[]);
        setOrders(fetchedOrders || []);
        setReturns(fetchedReturns || []);
      } catch (error) {
        console.error('Error fetching supplier data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isSupplier && user) {
      fetchData();
    }
  }, [isSupplier, user]);

  const totalSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, order) => {
      const supplierItems = order.items.filter((item: any) => item.supplierId === user?.uid);
      return acc + supplierItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    }, 0);

  if (!isSupplier) {
    return (
      <div className="pt-40 pb-24 text-center bg-velmora-50 dark:bg-velmora-950 min-h-screen">
        <h2 className="text-2xl font-display font-bold mb-4 dark:text-white">Access Denied</h2>
        <p className="dark:text-velmora-400">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (supplierStatus === 'pending') {
    return (
      <div className="pt-40 pb-24 text-center px-6 bg-velmora-50 dark:bg-velmora-950 min-h-screen">
        <div className="max-w-md mx-auto bg-white dark:bg-velmora-900 p-12 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-tight dark:text-white">Account Under Review</h2>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm leading-relaxed">
            Your supplier account is currently under review by our administration team. 
            We will notify you once your application has been processed.
          </p>
        </div>
      </div>
    );
  }

  if (supplierStatus === 'rejected') {
    return (
      <div className="pt-40 pb-24 text-center px-6 bg-velmora-50 dark:bg-velmora-950 min-h-screen">
        <div className="max-w-md mx-auto bg-white dark:bg-velmora-900 p-12 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-4 uppercase tracking-tight dark:text-white">Application Rejected</h2>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm leading-relaxed">
            We regret to inform you that your supplier application has been rejected. 
            Please contact support for more information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-velmora-50 dark:bg-velmora-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-velmora-500 dark:text-velmora-400 font-bold mb-2">Supplier Portal</p>
            <h1 className="text-4xl font-display font-bold dark:text-white">Supplier Dashboard</h1>
          </div>
          <div className="flex space-x-4 w-full md:w-auto">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none bg-velmora-900 dark:bg-velmora-100 text-white dark:text-velmora-900 px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-white transition-all flex items-center justify-center shadow-xl shadow-velmora-900/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </button>
            <button 
              onClick={() => openSaleModal()}
              className="flex-1 md:flex-none bg-white dark:bg-velmora-900 text-velmora-900 dark:text-white border border-velmora-200 dark:border-white/10 px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-50 dark:hover:bg-white/5 transition-all flex items-center justify-center"
            >
              <Tag className="w-4 h-4 mr-2" />
              Create Sale
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDeleteModalOpen(false)}
                className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white dark:bg-velmora-800 w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-display font-bold mb-2 dark:text-white">Delete Product?</h3>
                <p className="text-velmora-500 dark:text-velmora-400 text-sm mb-8">This action cannot be undone. All product data will be permanently removed.</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 bg-velmora-100 dark:bg-velmora-700 text-velmora-500 dark:text-velmora-300 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteProduct}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest text-[10px]"
                  >
                    Delete
                  </button>
                </div>
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
                onClick={() => {
                  setIsSaleModalOpen(false);
                  setEditingSale(null);
                  resetSaleFormData();
                }}
                className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-velmora-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-velmora-100 dark:border-velmora-700 flex justify-between items-center">
                  <h2 className="text-2xl font-display font-bold text-velmora-900 dark:text-white">
                    {editingSale ? 'Edit Sale' : 'Create New Sale'}
                  </h2>
                  <button 
                    onClick={() => {
                      setIsSaleModalOpen(false);
                      setEditingSale(null);
                      resetSaleFormData();
                    }}
                    className="p-2 hover:bg-velmora-100 dark:hover:bg-velmora-700 rounded-xl transition-colors text-velmora-400"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={editingSale ? handleEditSale : handleAddSale} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Select Product</label>
                    <select 
                      required
                      value={saleFormData.productId}
                      onChange={(e) => setSaleFormData({...saleFormData, productId: e.target.value})}
                      className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                    >
                      <option value="">Choose a product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Discount Type</label>
                      <div className="flex bg-velmora-50 dark:bg-velmora-900 p-1 rounded-xl border border-velmora-100 dark:border-velmora-700">
                        <button 
                          type="button"
                          onClick={() => setSaleFormData({...saleFormData, discountType: 'percentage'})}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${saleFormData.discountType === 'percentage' ? 'bg-white dark:bg-velmora-800 shadow-sm text-velmora-900 dark:text-white' : 'text-velmora-400'}`}
                        >
                          Percentage (%)
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSaleFormData({...saleFormData, discountType: 'fixed'})}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${saleFormData.discountType === 'fixed' ? 'bg-white dark:bg-velmora-800 shadow-sm text-velmora-900 dark:text-white' : 'text-velmora-400'}`}
                        >
                          Fixed Amount
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Discount Value</label>
                      <div className="relative">
                        <input 
                          required
                          type="number" 
                          value={saleFormData.discount}
                          onChange={(e) => setSaleFormData({...saleFormData, discount: e.target.value})}
                          className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                          placeholder="0"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-velmora-400">
                          {saleFormData.discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Start Date</label>
                      <input 
                        required
                        type="date" 
                        value={saleFormData.startDate}
                        onChange={(e) => setSaleFormData({...saleFormData, startDate: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">End Date</label>
                      <input 
                        required
                        type="date" 
                        value={saleFormData.endDate}
                        onChange={(e) => setSaleFormData({...saleFormData, endDate: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl border border-velmora-100 dark:border-white/10 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Final Price Preview</p>
                      <p className="text-xl font-display font-bold text-velmora-900 dark:text-white">
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
                      <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Active</span>
                      <button 
                        type="button"
                        onClick={() => setSaleFormData({...saleFormData, status: saleFormData.status === 'active' ? 'inactive' : 'active'})}
                        className={`w-12 h-6 rounded-full transition-all relative ${saleFormData.status === 'active' ? 'bg-velmora-900' : 'bg-velmora-200 dark:bg-velmora-700'}`}
                      >
                        <motion.div 
                          animate={{ x: saleFormData.status === 'active' ? 24 : 4 }}
                          className="absolute top-1 left-0 w-4 h-4 bg-white dark:bg-velmora-100 rounded-full shadow-sm"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 flex space-x-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsSaleModalOpen(false);
                        setEditingSale(null);
                        resetSaleFormData();
                      }}
                      className="flex-1 px-8 py-4 bg-velmora-100 dark:bg-velmora-700 text-velmora-500 dark:text-velmora-300 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-200 dark:hover:bg-velmora-600 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-1 px-8 py-4 bg-velmora-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>{editingSale ? 'Update Sale' : 'Launch Sale'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {(isAddModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                  resetFormData();
                }}
                className="absolute inset-0 bg-velmora-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-velmora-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8 border-b border-velmora-100 dark:border-velmora-700 flex justify-between items-center">
                  <h2 className="text-2xl font-display font-bold text-velmora-900 dark:text-white">
                    {isEditModalOpen ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button 
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      setEditingProduct(null);
                      resetFormData();
                    }}
                    className="p-2 hover:bg-velmora-100 dark:hover:bg-velmora-700 rounded-xl transition-colors text-velmora-400"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={isEditModalOpen ? handleEditProduct : handleAddProduct} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                        placeholder="e.g. Premium Silk Scarf"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Sale">Sale</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Price (EGP)</label>
                      <input 
                        required
                        type="number" 
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Stock Quantity</label>
                      <input 
                        required
                        type="number" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Media Section */}
                  <div className="space-y-4 pt-4 border-t border-velmora-100 dark:border-velmora-700">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-white">Product Media</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Main Image (URL or Upload)</label>
                        <div className="flex gap-4">
                          <input 
                            type="url" 
                            value={formData.image}
                            onChange={(e) => setFormData({...formData, image: e.target.value})}
                            className="flex-1 px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                            placeholder="https://images.unsplash.com/..."
                          />
                          <div className="relative">
                            <button 
                              type="button" 
                              disabled={isUploading}
                              className="px-4 py-3 bg-velmora-100 dark:bg-velmora-700 text-velmora-600 dark:text-velmora-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-200 dark:hover:bg-velmora-600 transition-all flex items-center gap-2 disabled:opacity-50"
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
                          <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-velmora-200 dark:border-velmora-700">
                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Additional Images</label>
                        <div className="flex gap-4">
                          <input 
                            id="additional-image-url"
                            type="url" 
                            className="flex-1 px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
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
                              className="px-4 py-3 bg-velmora-100 dark:bg-velmora-700 text-velmora-600 dark:text-velmora-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-200 dark:hover:bg-velmora-600 transition-all flex items-center gap-2 disabled:opacity-50"
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
                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-velmora-200 dark:border-velmora-700">
                              <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                  <div className="space-y-4 pt-4 border-t border-velmora-100 dark:border-velmora-700">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-white">Product Attributes</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Available Sizes (comma separated)</label>
                        <input 
                          type="text" 
                          value={formData.sizes}
                          onChange={(e) => setFormData({...formData, sizes: e.target.value})}
                          className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all"
                          placeholder="XS, S, M, L, XL"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Colors</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Color Name"
                            value={newColor.name}
                            onChange={(e) => setNewColor({...newColor, name: e.target.value})}
                            className="flex-1 px-3 py-2 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-velmora-900/10 dark:text-white transition-all"
                          />
                          <input 
                            type="color" 
                            value={newColor.hex}
                            onChange={(e) => setNewColor({...newColor, hex: e.target.value})}
                            className="w-10 h-10 p-1 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl cursor-pointer"
                          />
                          <button 
                            type="button"
                            onClick={addColor}
                            className="px-3 py-2 bg-velmora-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.colors.map((color, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-velmora-100 dark:bg-velmora-700 rounded-lg border border-velmora-200 dark:border-velmora-600">
                              <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                              <span className="text-[10px] font-bold text-velmora-600 dark:text-velmora-300">{color.name}</span>
                              <button type="button" onClick={() => removeColor(idx)} className="text-velmora-400 hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-velmora-100">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Description</label>
                      <textarea 
                        required
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all resize-none"
                        placeholder="Describe the product details..."
                      />
                    </div>
  
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-velmora-400">Composition & Care (one per line)</label>
                      <textarea 
                        rows={3}
                        value={formData.details}
                        onChange={(e) => setFormData({...formData, details: e.target.value})}
                        className="w-full px-4 py-3 bg-velmora-50 dark:bg-velmora-900 border border-velmora-100 dark:border-velmora-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-velmora-900/10 focus:border-velmora-900 dark:text-white transition-all resize-none"
                        placeholder="e.g. 100% Organic Cotton"
                      />
                    </div>
  
                    <div className="pt-4 flex space-x-4 sticky bottom-0 bg-white dark:bg-velmora-900 pb-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsAddModalOpen(false);
                          setIsEditModalOpen(false);
                          setEditingProduct(null);
                          resetFormData();
                        }}
                        className="flex-1 px-8 py-4 bg-velmora-100 dark:bg-white/5 text-velmora-500 dark:text-velmora-400 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-200 dark:hover:bg-white/10 transition-all"
                      >
                        Cancel
                      </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-1 px-8 py-4 bg-velmora-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-velmora-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>{isEditModalOpen ? 'Update Product' : 'Create Product'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex space-x-8 border-b border-velmora-200 dark:border-white/10">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'inventory' ? 'text-velmora-900 dark:text-white' : 'text-velmora-400 dark:text-velmora-500 hover:text-velmora-600 dark:hover:text-velmora-300'}`}
          >
            Inventory
            {activeTab === 'inventory' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-velmora-900 dark:bg-white" />}
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'sales' ? 'text-velmora-900 dark:text-white' : 'text-velmora-400 dark:text-velmora-500 hover:text-velmora-600 dark:hover:text-velmora-300'}`}
          >
            Sales & Discounts
            {activeTab === 'sales' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-velmora-900 dark:bg-white" />}
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'orders' ? 'text-velmora-900 dark:text-white' : 'text-velmora-400 dark:text-velmora-500 hover:text-velmora-600 dark:hover:text-velmora-300'}`}
          >
            Orders
            {activeTab === 'orders' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-velmora-900 dark:bg-white" />}
          </button>
          <button 
            onClick={() => setActiveTab('returns')}
            className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'returns' ? 'text-velmora-900 dark:text-white' : 'text-velmora-400 dark:text-velmora-500 hover:text-velmora-600 dark:hover:text-velmora-300'}`}
          >
            Returns
            {activeTab === 'returns' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-velmora-900 dark:bg-white" />}
          </button>
        </div>

        {activeTab === 'inventory' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white dark:bg-velmora-900 border border-velmora-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-velmora-900 dark:focus:ring-white/20 transition-all outline-none dark:text-white"
                />
              </div>
              <div className="flex space-x-4">
                <div className="relative">
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none pl-10 pr-10 py-4 bg-white dark:bg-velmora-900 border border-velmora-100 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-velmora-900 dark:focus:ring-white/20 transition-all outline-none cursor-pointer dark:text-white"
                  >
                    <option value="All">All Categories</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Sale">Sale</option>
                  </select>
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-velmora-400 pointer-events-none" />
                </div>
                <div className="flex bg-white dark:bg-velmora-900 border border-velmora-100 dark:border-white/5 rounded-2xl p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-velmora-50 dark:bg-white/10 text-velmora-900 dark:text-white' : 'text-velmora-400 dark:text-velmora-500 hover:text-velmora-600 dark:hover:text-velmora-300'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-velmora-50 dark:bg-white/10 text-velmora-900 dark:text-white' : 'text-velmora-400 dark:text-velmora-500 hover:text-velmora-600 dark:hover:text-velmora-300'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "space-y-4"
            }>
              {filteredProducts.map((product, i) => (
                <motion.div 
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white dark:bg-velmora-900 rounded-3xl overflow-hidden shadow-sm border border-velmora-100 dark:border-white/5 group ${viewMode === 'list' ? 'flex items-center p-4' : ''}`}
                >
                  <div className={`${viewMode === 'grid' ? 'aspect-[3/4] relative' : 'w-32 h-40 flex-shrink-0 relative'} overflow-hidden rounded-2xl`}>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-velmora-100 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-velmora-300" />
                      </div>
                    )}
                    {viewMode === 'grid' && (
                      <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-3 bg-white/90 dark:bg-velmora-800/90 backdrop-blur-md rounded-xl shadow-lg hover:bg-white dark:hover:bg-velmora-700 transition-colors dark:text-white"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setProductToDelete(product.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-3 bg-white/90 dark:bg-velmora-800/90 backdrop-blur-md rounded-xl shadow-lg hover:bg-white dark:hover:bg-velmora-700 transition-colors text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                      <span className="px-3 py-1 bg-velmora-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-lg w-fit">
                        {product.category}
                      </span>
                      {sales.find(s => s.productId === (product.id?.toString() || '')) && (
                        <span className="px-3 py-1 bg-red-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-lg w-fit flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          On Sale
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`p-6 flex-1 ${viewMode === 'list' ? 'flex items-center justify-between' : 'space-y-4'}`}>
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <h3 className="font-bold text-lg mb-1 dark:text-white">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-velmora-500 dark:text-velmora-400 text-sm font-bold">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                    
                    {viewMode === 'list' ? (
                      <div className="flex items-center space-x-12 px-8">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Stock</span>
                          <span className="text-sm font-bold dark:text-white">{product.stock || 0} Units</span>
                        </div>
                        <div className="flex flex-col items-end min-w-[100px]">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Status</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            (product.stock || 0) >= highThreshold ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 
                            (product.stock || 0) > minThreshold ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 
                            (product.stock || 0) > 0 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 
                            'bg-red-50 dark:bg-red-900/20 text-red-600'
                          }`}>
                            {(product.stock || 0) >= highThreshold ? 'High Stock' : 
                             (product.stock || 0) > minThreshold ? 'In Stock' : 
                             (product.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-3 bg-velmora-50 dark:bg-velmora-800 rounded-xl hover:bg-velmora-100 dark:hover:bg-velmora-700 transition-colors dark:text-white"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setProductToDelete(product.id);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-3 bg-velmora-50 dark:bg-velmora-800 rounded-xl hover:bg-velmora-100 dark:hover:bg-velmora-700 transition-colors text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-4 border-t border-velmora-50 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Stock</span>
                          <span className="text-sm font-bold dark:text-white">{product.stock || 0} Units</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Status</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            (product.stock || 0) >= highThreshold ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 
                            (product.stock || 0) > minThreshold ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 
                            (product.stock || 0) > 0 ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 
                            'bg-red-50 dark:bg-red-900/20 text-red-600'
                          }`}>
                            {(product.stock || 0) >= highThreshold ? 'High Stock' : 
                             (product.stock || 0) > minThreshold ? 'In Stock' : 
                             (product.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {filteredProducts.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 text-velmora-200" />
                  <p className="text-velmora-500">No products in your inventory yet.</p>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 text-velmora-900 dark:text-white font-bold hover:underline"
                  >
                    Add your first product
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'sales' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-velmora-900 p-8 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5">
                <div className="w-12 h-12 bg-velmora-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6 text-velmora-900 dark:text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-1">Total Sales</p>
                <h3 className="text-3xl font-display font-bold dark:text-white">{formatPrice(totalSales)}</h3>
              </div>
              <div className="bg-white dark:bg-velmora-900 p-8 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5">
                <div className="w-12 h-12 bg-velmora-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingBag className="w-6 h-6 text-velmora-900 dark:text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-1">Active Discounts</p>
                <h3 className="text-3xl font-display font-bold dark:text-white">{sales.length} Items</h3>
              </div>
              <div className="bg-white dark:bg-velmora-900 p-8 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5">
                <div className="w-12 h-12 bg-velmora-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-velmora-900 dark:text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-1">Pending Orders</p>
                <h3 className="text-3xl font-display font-bold dark:text-white">{orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-velmora-900 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5 overflow-hidden">
              <div className="p-8 border-b border-velmora-50 dark:border-white/5 flex justify-between items-center">
                <h3 className="text-xl font-display font-bold dark:text-white">Active Discounts & Sales</h3>
                <button 
                  onClick={() => openSaleModal()}
                  className="text-xs font-bold uppercase tracking-widest text-velmora-900 dark:text-white hover:underline flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Discount
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-velmora-50/50 dark:bg-white/5">
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Product</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Discount</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Period</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-velmora-50 dark:divide-white/5">
                    {sales.map((sale) => {
                      const product = products.find(p => p.id === sale.productId);
                      if (!product) return null;
                      
                      const now = new Date();
                      const start = new Date(sale.startDate);
                      const end = new Date(sale.endDate);
                      const isExpired = end < now;
                      const isFuture = start > now;

                      return (
                        <tr key={sale.id} className="hover:bg-velmora-50/30 dark:hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-velmora-100 dark:bg-white/10">
                                {product.image ? (
                                  <img src={product.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-4 h-4 text-velmora-300" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-sm dark:text-white">{product.name}</p>
                                <p className="text-xs text-velmora-400 dark:text-velmora-500">{formatPrice(product.price)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-red-500">
                                {sale.discountType === 'percentage' ? `-${sale.discount}%` : `-${formatPrice(sale.discount)}`}
                              </span>
                              <span className="text-[10px] text-velmora-400 dark:text-velmora-500 line-through">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2 text-xs text-velmora-600 dark:text-velmora-400">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              isExpired ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                              isFuture ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                              sale.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-velmora-100 dark:bg-white/10 text-velmora-400 dark:text-velmora-500'
                            }`}>
                              {isExpired ? 'Expired' : isFuture ? 'Scheduled' : sale.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openSaleModal(sale)}
                                className="p-2 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-lg text-velmora-400 dark:text-velmora-500 hover:text-velmora-900 dark:hover:text-white transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteSale(sale.id)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-velmora-400 dark:text-velmora-500 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {sales.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <Tag className="w-12 h-12 mx-auto mb-4 text-velmora-100" />
                          <p className="text-velmora-400 text-sm">No active discounts or sales campaigns.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-velmora-900 p-8 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5">
                <div className="w-12 h-12 bg-velmora-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <ShoppingBag className="w-6 h-6 text-velmora-900 dark:text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-1">Total Orders</p>
                <h3 className="text-3xl font-display font-bold dark:text-white">{orders.length}</h3>
              </div>
              <div className="bg-white dark:bg-velmora-900 p-8 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-1">Completed</p>
                <h3 className="text-3xl font-display font-bold dark:text-white">{orders.filter(o => o.status === 'completed').length}</h3>
              </div>
              <div className="bg-white dark:bg-velmora-900 p-8 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-1">In Transit</p>
                <h3 className="text-3xl font-display font-bold dark:text-white">{orders.filter(o => o.status === 'shipped').length}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-velmora-900 rounded-3xl shadow-sm border border-velmora-100 dark:border-white/5 overflow-hidden">
              <div className="p-8 border-b border-velmora-50 dark:border-white/5">
                <h3 className="text-xl font-display font-bold dark:text-white">Order Management</h3>
                <p className="text-xs text-velmora-400 dark:text-velmora-500 mt-1">Manage and track orders containing your products.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-velmora-50/50 dark:bg-white/5">
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Order ID</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Customer</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Your Items</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Total Value</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400">Status</th>
                      <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-velmora-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-velmora-50 dark:divide-white/5">
                    {orders.map((order) => {
                      const supplierItems = order.items.filter((item: any) => item.supplierId === user?.uid);
                      const supplierTotal = supplierItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

                      return (
                        <tr key={order.id} className="hover:bg-velmora-50/30 dark:hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm dark:text-white">#{order.displayId || order.id.substring(0, 8)}</span>
                              <span className="text-[10px] text-velmora-400 dark:text-velmora-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-velmora-100 dark:bg-white/10 rounded-full flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-velmora-600 dark:text-velmora-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold dark:text-white">{order.shippingAddress.name}</span>
                                <span className="text-[10px] text-velmora-400 dark:text-velmora-500 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {order.shippingAddress.city}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex -space-x-2">
                              {supplierItems.slice(0, 3).map((item: any, idx: number) => (
                                <div key={idx} className="w-8 h-8 rounded-lg border-2 border-white dark:border-velmora-900 overflow-hidden bg-velmora-100 dark:bg-white/10">
                                  <img src={item.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              ))}
                              {supplierItems.length > 3 && (
                                <div className="w-8 h-8 rounded-lg border-2 border-white dark:border-velmora-900 bg-velmora-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-velmora-600 dark:text-velmora-400">
                                  +{supplierItems.length - 3}
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] text-velmora-400 dark:text-velmora-500 mt-1">{supplierItems.length} {supplierItems.length === 1 ? 'item' : 'items'}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-bold dark:text-white">{formatPrice(supplierTotal)}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              order.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                              order.status === 'shipped' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                              order.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                              order.status === 'confirmed' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                              'bg-velmora-100 dark:bg-white/10 text-velmora-400 dark:text-velmora-500'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsOrderModalOpen(true);
                                }}
                                className="p-2 bg-velmora-50 dark:bg-white/5 text-velmora-900 dark:text-white rounded-lg hover:bg-velmora-100 dark:hover:bg-white/10 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <select 
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="text-[10px] font-bold uppercase tracking-widest bg-velmora-50 dark:bg-white/5 text-velmora-900 dark:text-white border border-velmora-100 dark:border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-velmora-900/10"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-velmora-100" />
                          <p className="text-velmora-400 text-sm">No orders found for your products.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-velmora-900 rounded-3xl border border-velmora-100 dark:border-white/5 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-velmora-50/50 dark:bg-white/5">
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Return ID</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Order ID</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Customer</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Date</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Status</th>
                      <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-velmora-100 dark:divide-white/5">
                    {returns.map((ret) => (
                      <tr key={ret.id} className="hover:bg-velmora-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-velmora-900 dark:text-white">#{ret.id.substring(0, 8).toUpperCase()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-velmora-900 dark:text-white">#{ret.orderId.substring(0, 8).toUpperCase()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-velmora-900 dark:text-white">{ret.userName}</p>
                          <p className="text-[10px] text-velmora-500 dark:text-velmora-400">{ret.userEmail}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs text-velmora-500 dark:text-velmora-400">{new Date(ret.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            ret.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30' :
                            ret.status === 'approved' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-900/30' :
                            ret.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-900/30' :
                            'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-100 dark:border-orange-900/30'
                          }`}>
                            {ret.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSelectedReturn(ret);
                                setIsReturnDetailModalOpen(true);
                              }}
                              className="p-2 bg-velmora-50 dark:bg-white/5 text-velmora-900 dark:text-white rounded-lg hover:bg-velmora-100 dark:hover:bg-white/10 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <select 
                              value={ret.status}
                              onChange={(e) => handleUpdateReturnStatus(ret.id, e.target.value)}
                              className="text-[10px] font-bold uppercase tracking-widest bg-velmora-50 dark:bg-white/5 text-velmora-900 dark:text-white border border-velmora-100 dark:border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-velmora-900/10"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {returns.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <RefreshCcw className="w-12 h-12 mx-auto mb-4 text-velmora-100" />
                          <p className="text-velmora-400 text-sm">No return requests found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        <AnimatePresence>
          {isOrderModalOpen && selectedOrder && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-velmora-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8 border-b border-velmora-50 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-velmora-900 z-10">
                  <div>
                    <h3 className="text-xl font-display font-bold uppercase tracking-tight dark:text-white">Order Details</h3>
                    <p className="text-xs text-velmora-400 dark:text-velmora-500 mt-1">#{selectedOrder.displayId || selectedOrder.id.substring(0, 8)} • {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => setIsOrderModalOpen(false)}
                    className="p-2 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 border-b border-velmora-50 dark:border-white/5 pb-2">Shipping Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <UserIcon className="w-4 h-4 text-velmora-300 dark:text-velmora-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold dark:text-white">{selectedOrder.shippingAddress.name}</p>
                            <p className="text-xs text-velmora-500 dark:text-velmora-400">{selectedOrder.shippingAddress.email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <p className="text-sm dark:text-velmora-300">{selectedOrder.shippingAddress.phone}</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-velmora-300 dark:text-velmora-600 mt-0.5" />
                          <div className="text-sm dark:text-velmora-300">
                            <p>{selectedOrder.shippingAddress.address}</p>
                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-velmora-50 dark:border-white/5 pb-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500">Order Summary</h4>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          selectedOrder.paymentStatus === 'paid' 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30' 
                            : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-100 dark:border-orange-900/30'
                        }`}>
                          {t(`checkout.paymentStatuses.${selectedOrder.paymentStatus || 'pending'}`)}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-velmora-500 dark:text-velmora-400">Payment Method</span>
                          <span className="font-bold uppercase tracking-widest text-[10px] dark:text-white">
                            {selectedOrder.paymentMethod === 'cod' ? t('checkout.cod') : selectedOrder.paymentMethod === 'instapay' ? t('checkout.instapay') : t('checkout.visa')}
                          </span>
                        </div>
                        {selectedOrder.paymentMethod === 'instapay' && selectedOrder.paymentScreenshot && (
                          <div className="pt-4 border-t border-velmora-50 dark:border-white/5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-2">Payment Screenshot</p>
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-velmora-100 dark:border-white/10 group mb-4">
                              <img 
                                src={selectedOrder.paymentScreenshot} 
                                alt="Payment Screenshot" 
                                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                onClick={() => setPreviewImage(selectedOrder.paymentScreenshot)}
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <Eye className="w-6 h-6 text-white" />
                              </div>
                            </div>

                            {selectedOrder.paymentStatus !== 'paid' && (
                              <button
                                onClick={() => handleConfirmPayment(selectedOrder.id)}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Confirm Payment</span>
                              </button>
                            )}
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-velmora-500 dark:text-velmora-400">Global Status</span>
                          <span className={`font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full ${
                            selectedOrder.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                            selectedOrder.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                          }`}>{selectedOrder.status}</span>
                        </div>
                        <div className="pt-3 border-t border-velmora-50 dark:border-white/5 flex justify-between">
                          <span className="text-sm font-bold dark:text-white">Your Total</span>
                          <span className="text-lg font-display font-bold text-velmora-900 dark:text-white">
                            {formatPrice(selectedOrder.items
                              .filter((item: any) => item.supplierId === user?.uid)
                              .reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 border-b border-velmora-50 dark:border-white/5 pb-2">Your Items</h4>
                    <div className="space-y-4">
                      {selectedOrder.items
                        .filter((item: any) => item.supplierId === user?.uid)
                        .map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-velmora-50/50 dark:bg-white/5 rounded-2xl">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-velmora-800 border border-velmora-100 dark:border-white/10">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="text-sm font-bold dark:text-white">{item.name}</p>
                                <p className="text-[10px] text-velmora-500 dark:text-velmora-400 uppercase tracking-widest">
                                  {item.selectedSize && `Size: ${item.selectedSize}`}
                                  {item.selectedColor && ` • Color: ${item.selectedColor}`}
                                </p>
                                <p className="text-xs font-medium mt-1 dark:text-velmora-300">{item.quantity} x {formatPrice(item.price)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-4">
                    <button 
                      onClick={() => setIsOrderModalOpen(false)}
                      className="px-8 py-4 bg-velmora-50 dark:bg-white/5 text-velmora-900 dark:text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-100 dark:hover:bg-white/10 transition-all"
                    >
                      Close
                    </button>
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => {
                        handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                        setSelectedOrder({...selectedOrder, status: e.target.value});
                      }}
                      className="px-8 py-4 bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-white/90 transition-all outline-none"
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="confirmed">Mark as Confirmed</option>
                      <option value="shipped">Mark as Shipped</option>
                      <option value="completed">Mark as Completed</option>
                      <option value="cancelled">Mark as Cancelled</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Return Details Modal */}
        <AnimatePresence>
          {isReturnDetailModalOpen && selectedReturn && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-velmora-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8 border-b border-velmora-50 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-velmora-900 z-10">
                  <div>
                    <h3 className="text-xl font-display font-bold uppercase tracking-tight dark:text-white">Return Request Details</h3>
                    <p className="text-xs text-velmora-400 dark:text-velmora-500 mt-1">#{selectedReturn.id.substring(0, 8).toUpperCase()} • {new Date(selectedReturn.createdAt).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => setIsReturnDetailModalOpen(false)}
                    className="p-2 hover:bg-velmora-50 dark:hover:bg-white/5 rounded-full transition-colors dark:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 border-b border-velmora-50 dark:border-white/5 pb-2">Customer Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <UserIcon className="w-4 h-4 text-velmora-300 dark:text-velmora-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold dark:text-white">{selectedReturn.userName}</p>
                            <p className="text-xs text-velmora-500 dark:text-velmora-400">{selectedReturn.userEmail}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 border-b border-velmora-50 dark:border-white/5 pb-2">Return Status</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          selectedReturn.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30' :
                          selectedReturn.status === 'approved' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-900/30' :
                          selectedReturn.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-900/30' :
                          'bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-100 dark:border-orange-900/30'
                        }`}>
                          {selectedReturn.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Return Reason */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 border-b border-velmora-50 dark:border-white/5 pb-2">Reason for Return</h4>
                    <div className="p-4 bg-velmora-50 dark:bg-white/5 rounded-2xl space-y-4">
                      <p className="text-sm text-velmora-600 dark:text-velmora-300 leading-relaxed italic">"{selectedReturn.reason}"</p>
                      {selectedReturn.image && (
                        <div className="mt-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-2">Attached Image</p>
                          <div className="relative group w-full max-w-xs aspect-square rounded-2xl overflow-hidden border border-velmora-100 dark:border-white/10 bg-white dark:bg-velmora-800">
                            <img 
                              src={selectedReturn.image} 
                              alt="Return evidence" 
                              className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-110"
                              onClick={() => setPreviewImage(selectedReturn.image)}
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <Eye size={20} className="text-white" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 border-b border-velmora-50 dark:border-white/5 pb-2">Returned Items</h4>
                    <div className="space-y-3">
                      {selectedReturn.items
                        .filter((item: any) => item.supplierId === user?.uid)
                        .map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-velmora-50/50 dark:bg-white/5 rounded-2xl">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-velmora-800 border border-velmora-100 dark:border-white/10">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                <p className="text-sm font-bold dark:text-white">{item.name}</p>
                                <p className="text-[10px] text-velmora-500 dark:text-velmora-400 uppercase tracking-widest">
                                  {item.selectedSize && `Size: ${item.selectedSize}`}
                                  {item.selectedColor && ` • Color: ${item.selectedColor}`}
                                </p>
                                <p className="text-xs font-medium mt-1 dark:text-velmora-300">{item.quantity} x {formatPrice(item.price)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-4">
                    <button 
                      onClick={() => setIsReturnDetailModalOpen(false)}
                      className="px-8 py-4 bg-velmora-50 dark:bg-white/5 text-velmora-900 dark:text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-100 dark:hover:bg-white/10 transition-all"
                    >
                      Close
                    </button>
                    <select 
                      value={selectedReturn.status}
                      onChange={(e) => {
                        handleUpdateReturnStatus(selectedReturn.id, e.target.value);
                        setSelectedReturn({...selectedReturn, status: e.target.value});
                      }}
                      className="px-8 py-4 bg-velmora-900 dark:bg-white text-white dark:text-velmora-900 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-velmora-800 dark:hover:bg-white/90 transition-all outline-none"
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="approved">Approve Request</option>
                      <option value="rejected">Reject Request</option>
                      <option value="completed">Mark as Completed</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {previewImage && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewImage(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-5xl w-full h-full flex items-center justify-center"
              >
                <button 
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
                <img 
                  src={previewImage} 
                  alt="Payment Preview" 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupplierDashboard;
