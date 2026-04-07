import { FirestoreService } from './FirestoreService';
import { products } from '../data/products';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const SeedService = {
  async seedProductsIfNeeded(user: any) {
    if (!user) return;
    
    try {
      // Check if products already exist (this read is allowed for everyone)
      const q = query(collection(db, 'products'), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('Seeding products to Firestore...');
        for (const product of products) {
          await FirestoreService.setDocument('products', product.id, {
            ...product,
            createdAt: new Date().toISOString()
          });
        }
        console.log('Products seeded successfully!');
      }
    } catch (error) {
      console.error('Error seeding products:', error);
    }
  }
};
