import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Property, Booking } from '../types';

// Error Handling Spec for Firestore Operations
enum OperationType {
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

const PROPERTIES_COLLECTION = 'properties';
const BOOKINGS_COLLECTION = 'bookings';

export const PropertyService = {
  getAll: async (): Promise<Property[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, PROPERTIES_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PROPERTIES_COLLECTION);
      return [];
    }
  },

  getPublished: async (): Promise<Property[]> => {
    try {
      const q = query(collection(db, PROPERTIES_COLLECTION), where('status', '==', 'published'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PROPERTIES_COLLECTION);
      return [];
    }
  },

  getById: async (id: string): Promise<Property | undefined> => {
    try {
      const docRef = doc(db, PROPERTIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Property;
      }
      return undefined;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${PROPERTIES_COLLECTION}/${id}`);
      return undefined;
    }
  },

  getByOwner: async (ownerId: string): Promise<Property[]> => {
    try {
      const q = query(collection(db, PROPERTIES_COLLECTION), where('ownerId', '==', ownerId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PROPERTIES_COLLECTION);
      return [];
    }
  },

  save: async (property: Property): Promise<void> => {
    try {
      const docRef = doc(db, PROPERTIES_COLLECTION, property.id);
      await setDoc(docRef, property, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${PROPERTIES_COLLECTION}/${property.id}`);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, PROPERTIES_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${PROPERTIES_COLLECTION}/${id}`);
    }
  },

  subscribeToPublished: (callback: (properties: Property[]) => void) => {
    const q = query(collection(db, PROPERTIES_COLLECTION), where('status', '==', 'published'));
    return onSnapshot(q, (snapshot) => {
      const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      callback(properties);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, PROPERTIES_COLLECTION);
    });
  },

  subscribeByOwner: (ownerId: string, callback: (properties: Property[]) => void) => {
    const q = query(collection(db, PROPERTIES_COLLECTION), where('ownerId', '==', ownerId));
    return onSnapshot(q, (snapshot) => {
      const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      callback(properties);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, PROPERTIES_COLLECTION);
    });
  },

  seedInitialData: async (ownerId: string): Promise<void> => {
    try {
      const existing = await PropertyService.getById('jazz-property-id');
      if (!existing) {
        const seedProperties: Property[] = [
          {
            id: 'jazz-property-id',
            title: 'شقة جاز الفاخرة',
            description: 'عقار فاخر في قلب المدينة يتميز بتصميم عصري وأجواء مريحة ومطبخ مجهز بالكامل.',
            location: 'وسط المدينة (Centre Ville)',
            neighborhood: 'وسط المدينة (Centre Ville)',
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
            category: 'مدن',
            status: 'published',
            rating: 4.9,
            ownerId: ownerId,
            amenities: ['مطبخ مجهز', 'تكييف', 'واي فاي', 'موقف سيارات'],
            maxGuests: 4,
            bedrooms: 2,
            bathrooms: 2,
            livingRooms: 1,
            kitchens: 1,
            badge: 'verified',
            price: 450
          },
          {
            id: 'mirador-view-1',
            title: 'إطلالة ميرادور الساحرة',
            description: 'شقة واسعة مع شرفة تطل مباشرة على خليج الحسيمة. مثالية للعائلات.',
            location: 'ميرادور (Mirador)',
            neighborhood: 'ميرادور (Mirador)',
            images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
            category: 'شاطئية',
            status: 'published',
            rating: 4.8,
            ownerId: ownerId,
            amenities: ['إطلالة بحر', 'مصعد', 'تكييف'],
            maxGuests: 6,
            bedrooms: 3,
            bathrooms: 2,
            livingRooms: 1,
            kitchens: 1,
            badge: 'crown',
            price: 600
          },
          {
            id: 'sabadia-beach-1',
            title: 'جوهرة صبادية',
            description: 'منزل عصري على بعد خطوات قليلة من شاطئ صبادية الهادئ.',
            location: 'صبادية (Sabadia)',
            neighborhood: 'صبادية (Sabadia)',
            images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
            category: 'شاطئية',
            status: 'published',
            rating: 4.7,
            ownerId: ownerId,
            amenities: ['قريب من الشاطئ', 'واي فاي', 'تلفاز'],
            maxGuests: 4,
            bedrooms: 2,
            bathrooms: 1,
            livingRooms: 1,
            kitchens: 1,
            badge: 'diamond',
            price: 550
          },
          {
            id: 'quemado-resort-1',
            title: 'منتجع كيمادو الفاخر',
            description: 'استمتع بأفضل إطلالة على شاطئ كيمادو الشهير في هذه الشقة الراقية.',
            location: 'شاطئ كيمادو (Quemado)',
            neighborhood: 'شاطئ كيمادو (Quemado)',
            images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
            category: 'رائج',
            status: 'published',
            rating: 5.0,
            ownerId: ownerId,
            amenities: ['مسبح', 'إطلالة بحر', 'أمن 24/7'],
            maxGuests: 5,
            bedrooms: 2,
            bathrooms: 2,
            livingRooms: 1,
            kitchens: 1,
            badge: 'trophy',
            price: 800
          },
          {
            id: 'calabonita-flat-1',
            title: 'شقة كالا بونيتا الهادئة',
            description: 'مكان هادئ ومريح بالقرب من منتزه كالا بونيتا الطبيعي.',
            location: 'كالا بونيتا (Calabonita)',
            neighborhood: 'كالا بونيتا (Calabonita)',
            images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'],
            category: 'منازل صغيرة',
            status: 'published',
            rating: 4.6,
            ownerId: ownerId,
            amenities: ['هدوء', 'موقف سيارات مجاني', 'مطبخ'],
            maxGuests: 3,
            bedrooms: 1,
            bathrooms: 1,
            livingRooms: 1,
            kitchens: 1,
            badge: 'verified',
            price: 350
          }
        ];

        for (const property of seedProperties) {
          await PropertyService.save(property);
        }
        console.log('Initial data seeded successfully.');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  },
  
  exportData: async (): Promise<string> => {
    try {
      const properties = await PropertyService.getAll();
      return JSON.stringify(properties, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '[]';
    }
  }
};

export const BookingService = {
  getAll: async (): Promise<Booking[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, BOOKINGS_COLLECTION));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      return [];
    }
  },

  getByProperty: async (propertyId: string): Promise<Booking[]> => {
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION), where('propertyId', '==', propertyId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      return [];
    }
  },

  isRangeAvailable: async (propertyId: string, startDate: string, endDate: string): Promise<boolean> => {
    try {
      const propertyBookings = await BookingService.getByProperty(propertyId);
      const filteredBookings = propertyBookings.filter(b => b.status !== 'rejected');
      
      const newStart = new Date(startDate).getTime();
      const newEnd = new Date(endDate).getTime();

      return !filteredBookings.some(booking => {
          const existingStart = new Date(booking.startDate).getTime();
          const existingEnd = new Date(booking.endDate).getTime();
          return (newStart < existingEnd && newEnd > existingStart);
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
      return false;
    }
  },

  create: async (booking: Booking): Promise<boolean> => {
    try {
      const available = await BookingService.isRangeAvailable(booking.propertyId, booking.startDate, booking.endDate);
      if (!available) return false;

      const docRef = doc(db, BOOKINGS_COLLECTION, booking.id);
      await setDoc(docRef, booking);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, BOOKINGS_COLLECTION);
      return false;
    }
  },

  updateStatus: async (bookingId: string, status: 'confirmed' | 'rejected'): Promise<void> => {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      await setDoc(docRef, { status }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${BOOKINGS_COLLECTION}/${bookingId}`);
    }
  },

  subscribeToUserBookings: (userId: string, callback: (bookings: Booking[]) => void) => {
    const q = query(collection(db, BOOKINGS_COLLECTION), where('guestId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      callback(bookings);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
    });
  },

  subscribeByPropertyOwner: (ownerId: string, callback: (bookings: Booking[]) => void) => {
    const q = query(collection(db, BOOKINGS_COLLECTION), where('propertyOwnerId', '==', ownerId));
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      callback(bookings);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, BOOKINGS_COLLECTION);
    });
  }
};
