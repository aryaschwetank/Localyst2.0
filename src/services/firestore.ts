import { db } from '@/lib/firebase'; // Changed from '@/lib/firebase' - this was correct
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
// import { GeneratedStore } from './gemini';

export interface StoreDocument {
  id?: string;
  businessName: string;
  businessType: string;
  location: string;
  phone: string;
  hours: string;
  description: string;
  services: string[];
  servicePrices?: Array<{name: string; price: string}>;
  tagline?: string;
  pricingSuggestions?: string[];
  policies?: string[];
  marketingContent?: string;
  storeSlug?: string;
  userId: string;
  createdAt: Date;
  views?: number;
  lastViewed?: Date;
  // Add these missing properties:
  updatedAt?: Date;
  isPublished?: boolean;
  businessPolicies?: string[];
  aiGeneratedPromo?: string;
  socialMediaPost?: string;
}

// Save store to Firestore
export async function saveStore(storeData: Omit<StoreDocument, 'id'>, userId?: string): Promise<string> {
  try {
    const storeSlug = storeData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const storeDoc: Omit<StoreDocument, 'id'> = {
      ...storeData,
      userId: userId || 'anonymous',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true,
      views: 0,
      storeSlug
    };

    const docRef = await addDoc(collection(db, 'stores'), storeDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error saving store:', error);
    throw error;
  }
}

// Create a new store
export async function createStore(storeData: Omit<StoreDocument, 'id'>): Promise<string> {
  try {
    console.log('💾 Creating store in Firestore:', storeData);
    
    const docRef = await addDoc(collection(db, 'stores'), {
      ...storeData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: true,
      views: 0
    });
    
    console.log('✅ Store created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating store:', error);
    throw error;
  }
}

// Get store by ID
export async function getStore(storeId: string): Promise<StoreDocument | null> {
  try {
    const docRef = doc(db, 'stores', storeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as StoreDocument;
    }
    return null;
  } catch (error) {
    console.error('Error getting store:', error);
    return null;
  }
}

// Get store by slug
export async function getStoreBySlug(slug: string): Promise<StoreDocument | null> {
  try {
    const q = query(collection(db, 'stores'), where('storeSlug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as StoreDocument;
    }
    return null;
  } catch (error) {
    console.error('Error getting store by slug:', error);
    return null;
  }
}

// Get all stores for a user
export async function getUserStores(userId: string): Promise<StoreDocument[]> {
  try {
    const storesRef = collection(db, 'stores');
    const querySnapshot = await getDocs(storesRef);
    
    const stores: StoreDocument[] = [];
    querySnapshot.forEach((doc) => {
      const storeData = doc.data() as StoreDocument;
      // Filter by userId after fetching (simple approach for now)
      if (storeData.userId === userId) {
        stores.push({ id: doc.id, ...storeData });
      }
    });
    
    return stores.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error fetching user stores:', error);
    return [];
  }
}

// Get all public stores for customer discovery
export async function getAllStores(): Promise<StoreDocument[]> {
  try {
    console.log('🔍 Querying all public stores...');
    
    const q = query(collection(db, 'stores'));
    const querySnapshot = await getDocs(q);
    
    console.log('📦 Query executed, docs found:', querySnapshot.docs.length);
    
    const stores = querySnapshot.docs.map(doc => {
      return { 
        id: doc.id, 
        ...doc.data() 
      };
    }) as StoreDocument[];
    
    console.log('✅ Final stores array:', stores);
    return stores;
  } catch (error) {
    console.error('❌ Error getting all stores:', error);
    return [];
  }
}

// Update store
export async function updateStore(storeId: string, updates: Partial<StoreDocument>): Promise<void> {
  try {
    const docRef = doc(db, 'stores', storeId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
}

// Delete store
export async function deleteStore(storeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'stores', storeId));
  } catch (error) {
    console.error('Error deleting store:', error);
    throw error;
  }
}

// Increment store views (for analytics)
export async function incrementStoreViews(storeId: string): Promise<void> {
  try {
    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);
    
    if (storeSnap.exists()) {
      const currentViews = storeSnap.data().views || 0;
      await updateDoc(storeRef, {
        views: currentViews + 1,
        lastViewed: new Date()
      });
      console.log('👁️ Store view incremented:', storeId);
    }
  } catch (error) {
    console.error('❌ Error incrementing views:', error);
  }
}

// Get popular stores
export async function getPopularStores(limit: number = 10): Promise<StoreDocument[]> {
  try {
    const q = query(
      collection(db, 'stores'),
      where('isPublished', '==', true),
      orderBy('views', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .slice(0, limit)
      .map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as StoreDocument[];
  } catch (error) {
    console.error('Error getting popular stores:', error);
    return [];
  }
}

// Booking interface
export interface BookingDocument {
  id?: string;
  storeId: string;
  storeName: string;
  storePhone: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  selectedService: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// Create a new booking
export async function createBooking(bookingData: Omit<BookingDocument, 'id'>): Promise<string> {
  try {
    console.log('📅 Creating new booking:', bookingData);
    
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      bookingDate: new Date(),
      status: 'pending'
    });
    
    console.log('✅ Booking created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    throw error;
  }
}

// Get bookings for a store (for business owners)
export async function getStoreBookings(storeId: string): Promise<BookingDocument[]> {
  try {
    console.log('📋 Getting bookings for store:', storeId);
    
    const q = query(
      collection(db, 'bookings'),
      where('storeId', '==', storeId),
      orderBy('bookingDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as BookingDocument[];
    
    console.log('📋 Found bookings:', bookings.length);
    return bookings;
  } catch (error) {
    console.error('❌ Error getting store bookings:', error);
    return [];
  }
}