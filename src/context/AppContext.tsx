import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { where } from 'firebase/firestore';
import { auth } from '../firebase';
import { FirestoreService } from '../services/FirestoreService';
import i18n from '../i18n';

// Types
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'customer' | 'supplier' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt?: string;
}

export interface Product {
  id: number | string;
  name: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  isNew?: boolean;
  stock?: number;
  supplierId?: string;
}

export interface Sale {
  id: string;
  productId: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  supplierId: string;
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface AppContextType {
  // Auth
  user: User | null;
  profile: UserProfile | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  isSupplier: boolean;
  supplierStatus: 'pending' | 'approved' | 'rejected' | null;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  registerSupplier: (userId: string, supplierData: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string | number, size?: string, color?: string) => void;
  updateQuantity: (productId: string | number, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // Favorites
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // UI States
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;

  // Language & Theme
  language: string;
  setLanguage: (lang: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Settings
  settings: any;
  categories: { id: string; name: string }[];
  formatPrice: (amount: number) => string;

  // Sales
  sales: Sale[];
  getSaleForProduct: (productId: string) => Sale | null;
  calculateFinalPrice: (product: Product | string, price?: number) => number;
  isOnSale: (productId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [settings, setSettings] = useState<any>({
    siteName: 'VELMORA',
    currencySymbol: 'EGP',
    maintenanceMode: false,
    maintenanceMessage: 'We are currently under maintenance, please check back later.'
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('velmora_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [supplierStatus, setSupplierStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([
    { id: 'women', name: 'Women' },
    { id: 'men', name: 'Men' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'accessories', name: 'Accessories' }
  ]);

  const [language, setLanguageState] = useState(i18n.language || 'en');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('velmora_theme') as 'light' | 'dark') || 'light'
  );

  // Auth Listener
  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;
    let favoritesUnsubscribe: (() => void) | null = null;
    let supplierUnsubscribe: (() => void) | null = null;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Set a safety timeout for auth ready state in case Firestore is unreachable
        const authTimeout = setTimeout(() => {
          if (!isAuthReady) {
            console.warn("Firestore profile loading timed out, setting auth as ready (offline mode)");
            setIsAuthReady(true);
          }
        }, 10000); // 10 seconds safety timeout

        profileUnsubscribe = FirestoreService.subscribeToDocument('users', user.uid, (data) => {
          clearTimeout(authTimeout);
          if (data) {
            setProfile(data as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || 'User',
              email: user.email || '',
              role: 'customer',
              createdAt: new Date().toISOString()
            };
            FirestoreService.setDocument('users', user.uid, newProfile).catch(err => {
              console.error("Error setting profile:", err);
            });
          }
          // Set ready after profile is at least attempted
          setIsAuthReady(true);
        });

        // Always subscribe to supplier status if logged in
        if (supplierUnsubscribe) supplierUnsubscribe();
        supplierUnsubscribe = FirestoreService.subscribeToDocument('suppliers', user.uid, (supplier) => {
          if (supplier) {
            setSupplierStatus(supplier.status);
            // Self-healing: if approved but role is not supplier (and NOT admin), update it
            if (supplier.status === 'approved') {
              FirestoreService.getDocument('users', user.uid).then((profileData: any) => {
                if (profileData && profileData.role !== 'supplier' && profileData.role !== 'admin') {
                  FirestoreService.updateDocument('users', user.uid, { role: 'supplier' }).catch(err => {
                    console.error("Error updating role:", err);
                  });
                }
              }).catch(err => {
                console.error("Error getting profile for self-healing:", err);
              });
            }
          } else {
            setSupplierStatus(null);
          }
        });

        favoritesUnsubscribe = FirestoreService.subscribeToDocument('favorites', user.uid, (data) => {
          if (data && data.productIds) {
            setFavorites(data.productIds);
          } else {
            setFavorites([]);
          }
        });
      } else {
        setProfile(null);
        setSupplierStatus(null);
        setFavorites([]);
        if (profileUnsubscribe) profileUnsubscribe();
        if (favoritesUnsubscribe) favoritesUnsubscribe();
        if (supplierUnsubscribe) supplierUnsubscribe();
        profileUnsubscribe = null;
        favoritesUnsubscribe = null;
        supplierUnsubscribe = null;
        setIsAuthReady(true);
      }
    });

    // Fetch Settings
    const settingsUnsubscribe = FirestoreService.subscribeToDocument('settings', 'general', (data) => {
      if (data) {
        setSettings(data);
      }
    });

    // Fetch Sales
    const salesUnsubscribe = FirestoreService.subscribeToCollection('sales', (data) => {
      setSales(data as Sale[]);
    }, [where('status', '==', 'active')]);

    // Fetch Categories
    const categoriesUnsubscribe = FirestoreService.subscribeToCollection('categories', (data) => {
      if (data && data.length > 0) {
        setCategories(data as { id: string; name: string }[]);
      }
    });
    
    return () => {
      unsubscribe();
      settingsUnsubscribe();
      salesUnsubscribe();
      categoriesUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
      if (favoritesUnsubscribe) favoritesUnsubscribe();
      if (supplierUnsubscribe) supplierUnsubscribe();
    };
  }, []);

  // Persist Cart
  useEffect(() => {
    localStorage.setItem('velmora_cart', JSON.stringify(cart));
  }, [cart]);

  // Theme & Language
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('velmora_theme', theme);
  }, [theme]);

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  // Update document title when site name changes
  useEffect(() => {
    if (settings.siteName) {
      document.title = settings.siteName;
    }
  }, [settings.siteName]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme to:', newTheme);
    setTheme(newTheme);
  };

  const addToCart = (product: Product, size?: string, color?: string) => {
    const stock = product.stock ?? 0;
    if (stock <= 0) {
      alert(i18n.t('common.outOfStockAlert') || 'This product is currently out of stock.');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size && item.selectedColor === color);
      if (existing) {
        // Check if adding one more exceeds stock
        if (existing.quantity + 1 > stock) {
          alert(i18n.t('common.outOfStockAlert') || 'This product is currently out of stock.');
          return prev;
        }
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === size && item.selectedColor === color) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string | number, size?: string, color?: string) => {
    setCart(prev => prev.filter(item => 
      !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: string | number, quantity: number, size?: string, color?: string) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize === size && item.selectedColor === color) {
        const stock = item.stock ?? 0;
        if (quantity > stock) {
          alert(i18n.t('common.outOfStockAlert') || 'This product is currently out of stock.');
          return item;
        }
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    await FirestoreService.setDocument('favorites', user.uid, { productIds: newFavorites });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const getSaleForProduct = (productId: string) => {
    const now = new Date();
    return sales.find(sale => 
      sale.productId === productId && 
      sale.status === 'active' &&
      new Date(sale.startDate) <= now &&
      new Date(sale.endDate) >= now
    ) || null;
  };

  const calculateFinalPrice = (product: Product | string, price?: number) => {
    let productId: string;
    let basePrice: number;

    if (typeof product === 'string') {
      productId = product;
      basePrice = price || 0;
    } else {
      productId = product.id?.toString() || '';
      basePrice = product.price || 0;
    }

    const sale = getSaleForProduct(productId);
    if (!sale) return basePrice;

    if (sale.discountType === 'percentage') {
      return basePrice - (basePrice * sale.discount / 100);
    } else {
      return Math.max(0, basePrice - sale.discount);
    }
  };

  const isOnSale = (productId: string) => !!getSaleForProduct(productId);

  const cartTotal = cart.reduce((total, item) => total + (calculateFinalPrice(item) * item.quantity), 0);

  const formatPrice = (amount: number | string | undefined | null) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (num === undefined || num === null || isNaN(num as number)) {
      return `0 ${settings.currencySymbol || 'EGP'}`;
    }
    return `${(num as number).toLocaleString()} ${settings.currencySymbol || 'EGP'}`;
  };

  const logout = async () => {
    await auth.signOut();
  };

  const login = async (email: string, password: string) => {
    if (!auth || !email || !password) {
      throw new Error('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is admin (hardcoded or via profile)
      // We don't want to block login for admins even if supplier check fails
      const isAdminEmail = [
        'ziadr276@gmail.com', 
        'zoza82132@gmail.com', 
        'bahaaah123@gmail.com',
        'BAHAAAH123@GMAIL.COM'
      ].includes(user.email || '');

      if (!isAdminEmail) {
        try {
          const supplier = await FirestoreService.getSupplier(user.uid);
          if (supplier && supplier.status === 'rejected') {
            await auth.signOut();
            throw new Error('تم رفض طلب الانضمام الخاص بك كمورد.');
          }
        } catch (supplierErr) {
          console.warn("Supplier check failed, proceeding:", supplierErr);
        }
      }
    } catch (authErr: any) {
      console.error("Login error:", authErr);
      if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password') {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مرة أخرى.');
      }
      if (authErr.code === 'auth/network-request-failed') {
        throw new Error('خطأ في الاتصال بالشبكة. يرجى التأكد من اتصالك بالإنترنت وحاول مرة أخرى.');
      }
      throw new Error(authErr.message || 'حدث خطأ أثناء تسجيل الدخول.');
    }
  };

  const registerSupplier = async (userId: string, supplierData: any) => {
    await FirestoreService.createSupplier(userId, supplierData);
    setSupplierStatus('pending');
    
    // Add notification for admin
    await FirestoreService.addNotification({
      title: 'New Supplier Registration',
      message: `${supplierData.name} has registered as a supplier for ${supplierData.storeName}`,
      type: 'user',
      link: '/admin/suppliers'
    });
  };

  const forgotPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const isAdmin = profile?.role === 'admin' || 
                  user?.email === 'ziadr276@gmail.com' || 
                  user?.email === 'zoza82132@gmail.com' ||
                  user?.email === 'BAHAAAH123@GMAIL.COM';
  const isSupplier = profile?.role === 'supplier';

  return (
    <AppContext.Provider value={{
      user, profile, isAuthReady, isAdmin, isSupplier, supplierStatus, logout, login, registerSupplier, forgotPassword,
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal,
      favorites, toggleFavorite, isFavorite,
      isCartOpen, setIsCartOpen,
      isSearchOpen, setIsSearchOpen,
      isAuthOpen, setIsAuthOpen,
      language, setLanguage,
      theme, toggleTheme,
      settings, categories, formatPrice,
      sales, getSaleForProduct, calculateFinalPrice, isOnSale
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
