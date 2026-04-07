import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot,
  FirestoreError,
  increment
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const FirestoreService = {
  // Generic Get Doc
  async getDocument(path: string, id: string) {
    try {
      const docRef = doc(db, path, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${path}/${id}`);
    }
  },

  // Generic Get Collection
  async getCollection(path: string, queryConstraints: any[] = []) {
    try {
      const colRef = collection(db, path);
      const q = query(colRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Generic Add Doc
  async addDocument(path: string, data: any) {
    try {
      const colRef = collection(db, path);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Generic Set Doc
  async setDocument(path: string, id: string, data: any) {
    try {
      const docRef = doc(db, path, id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${path}/${id}`);
    }
  },

  // Generic Update Doc
  async updateDocument(path: string, id: string, data: any) {
    try {
      const docRef = doc(db, path, id);
      const { id: _, ...updateData } = data;
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
    }
  },

  // Generic Delete Doc
  async deleteDocument(path: string, id: string) {
    try {
      const docRef = doc(db, path, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
    }
  },

  // Real-time listener
  subscribeToCollection(path: string, callback: (data: any[]) => void, queryConstraints: any[] = []) {
    const colRef = collection(db, path);
    const q = query(colRef, ...queryConstraints);
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  // Real-time listener for a single document
  subscribeToDocument(path: string, id: string, callback: (data: any) => void) {
    const docRef = doc(db, path, id);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `${path}/${id}`);
    });
  },

  // Settings
  async getSettings(id: string = 'general') {
    try {
      const docRef = doc(db, 'settings', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting settings:', error);
      throw error;
    }
  },

  async updateSettings(id: string = 'general', data: any) {
    try {
      const docRef = doc(db, 'settings', id);
      await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  },

  // Notifications
  async addNotification(notification: {
    title: string;
    message: string;
    type: 'order' | 'message' | 'user' | 'system';
    link?: string;
  }) {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  },

  async getNotifications(limitCount: number = 10) {
    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  async markNotificationAsRead(id: string) {
    try {
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Supplier specific
  async createSupplier(userId: string, supplierData: any) {
    try {
      const docRef = doc(db, 'suppliers', userId);
      await setDoc(docRef, {
        ...supplierData,
        userId,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      return userId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `suppliers/${userId}`);
    }
  },

  async getSupplier(userId: string) {
    return this.getDocument('suppliers', userId);
  },

  async updateSupplierStatus(userId: string, status: 'approved' | 'rejected') {
    return this.updateDocument('suppliers', userId, { status });
  },

  async getAllSuppliers() {
    return this.getCollection('suppliers', [orderBy('createdAt', 'desc')]);
  },

  async getSupplierProducts(supplierId: string) {
    return this.getCollection('products', [where('supplierId', '==', supplierId)]);
  },

  // Sales
  async getSales(activeOnly: boolean = true) {
    const constraints: any[] = [];
    if (activeOnly) {
      constraints.push(where('status', '==', 'active'));
    }
    const sales = await this.getCollection('sales', constraints);
    return sales.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getSaleByProductId(productId: string) {
    const sales = await this.getCollection('sales', [where('productId', '==', productId)]);
    const activeSales = sales.filter((s: any) => s.status === 'active');
    return activeSales.length > 0 ? activeSales[0] : null;
  },

  async getSupplierSales(supplierId: string) {
    return this.getCollection('sales', [where('supplierId', '==', supplierId)]);
  },

  async getSupplierOrders(supplierId: string) {
    try {
      // Query orders where the supplierId is in the supplierIds array
      const orders = await this.getCollection('orders', [
        where('supplierIds', 'array-contains', supplierId)
      ]);
      return orders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  },

  async getSupplierReturns(supplierId: string) {
    try {
      const returns = await this.getCollection('returns', [
        where('supplierIds', 'array-contains', supplierId)
      ]);
      return returns.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'returns');
    }
  },

  // Reviews
  async addReview(review: {
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
  }) {
    try {
      return this.addDocument('reviews', {
        ...review,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    }
  },

  async getProductReviews(productId: string) {
    const reviews = await this.getCollection('reviews', [
      where('productId', '==', productId)
    ]);
    return reviews.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async deleteReview(reviewId: string) {
    return this.deleteDocument('reviews', reviewId);
  },

  // Stock Management
  async decrementProductStock(productId: string, quantity: number) {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const product = docSnap.data();
        const newStock = (product.stock || 0) - quantity;
        
        await updateDoc(docRef, {
          stock: newStock,
          updatedAt: new Date().toISOString()
        });

        // Check for low stock
        const settings = await this.getSettings();
        const threshold = settings?.minStockThreshold ? parseInt(settings.minStockThreshold) : 5;
        
        if (newStock <= threshold && newStock > 0) {
          await this.addNotification({
            title: 'Low Stock Alert',
            message: `Product "${product.name}" is running low on stock (${newStock} units left).`,
            type: 'system',
            link: '/admin/products'
          });
        } else if (newStock <= 0) {
          await this.addNotification({
            title: 'Out of Stock Alert',
            message: `Product "${product.name}" is now out of stock.`,
            type: 'system',
            link: '/admin/products'
          });
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${productId}`);
    }
  }
};
