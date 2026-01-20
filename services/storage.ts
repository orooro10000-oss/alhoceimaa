import { Property, Booking } from '../types';

// مفتاح التخزين الرئيسي والثابت - لن يتم تغييره مستقبلاً لضمان حفظ تعديلاتك
const STORAGE_KEY = 'airhome_master_data_v1'; 
const BOOKING_KEY = 'airhome_master_bookings_v1';

// بيانات العقارات (البيانات الأولية بالصور الصحيحة)
const SEED_DATA: Property[] = [
  {
    id: 'prop_real_mirador_sea_view',
    title: 'شقة فاخرة مطلة على البحر - ميرادور',
    description: 'استمتع بإقامة هادئة في هذه الشقة المميزة بحي ميرادور الراقي. تتميز بإطلالة بانورامية رائعة على البحر الأبيض المتوسط، وتصميم مريح يجمع بين الأصالة والحداثة. قريبة جداً من الكورنيش والمقاهي والشاطئ.',
    location: 'ميرادور (Mirador)',
    // price: 400, // السعر مخفي (تواصل للسعر)
    images: [
      'https://i.ibb.co/TDGMmGNP/IMG-20251031-WA0071.jpg', // Cover
      'https://i.ibb.co/35sXJ29r/IMG-20251031-WA0069.jpg', // Living
      'https://i.ibb.co/DfRKKbpF/IMG-20251031-WA0068.jpg', // Living
      'https://i.ibb.co/pkyLsF1/IMG-20251031-WA0070.jpg', // Living
      'https://i.ibb.co/KpF1w40C/IMG-20251031-WA0065.jpg', // Bedroom 1
      'https://i.ibb.co/zhV2N2Cx/IMG-20251031-WA0066.jpg', // Bedroom 1
      'https://i.ibb.co/q3PG6rpH/IMG-20251031-WA0062.jpg', // Bedroom 2
      'https://i.ibb.co/Fq08YQVB/IMG-20251031-WA0067.jpg', // Bedroom 2
      'https://i.ibb.co/JL7NhzP/IMG-20251031-WA0061.jpg', // Kitchen
      'https://i.ibb.co/nqth0vfy/IMG-20251031-WA0064.jpg', // Kitchen
      'https://i.ibb.co/1YsKBScC/IMG-20251031-WA0059.jpg', // Bathroom
      'https://i.ibb.co/nNj0gYqP/IMG-20251031-WA0057.jpg', // Exterior
      'https://i.ibb.co/Z1mRjtQz/IMG-20251031-WA0056.jpg', // Exterior
      'https://i.ibb.co/gL6YhydF/IMG-20251031-WA0058.jpg', // Exterior
      'https://i.ibb.co/NdwzN6jz/IMG-20251031-WA0060.jpg', // Exterior
      'https://i.ibb.co/jvMQw06L/IMG-20251031-WA0054.jpg', // Other
      'https://i.ibb.co/pvNSfyZ3/IMG-20251031-WA0055.jpg'  // Other
    ],
    category: 'شاطئية',
    status: 'published',
    rating: 5.0,
    ownerId: 'host_123',
    amenities: ['إطلالة على البحر', 'واي فاي', 'تلفاز', 'مطبخ مجهز', 'قريب من الشاطئ', 'عائلية'],
    maxGuests: 6,
    bedrooms: 2,
    bathrooms: 1,
    livingRooms: 1,
    kitchens: 1,
    badge: 'verified', 
    latitude: 35.2365, 
    longitude: -3.9345,
    imageCategories: {
        'https://i.ibb.co/TDGMmGNP/IMG-20251031-WA0071.jpg': 'cover', 
        'https://i.ibb.co/35sXJ29r/IMG-20251031-WA0069.jpg': 'living',
        'https://i.ibb.co/DfRKKbpF/IMG-20251031-WA0068.jpg': 'living',
        'https://i.ibb.co/pkyLsF1/IMG-20251031-WA0070.jpg': 'living',
        'https://i.ibb.co/KpF1w40C/IMG-20251031-WA0065.jpg': 'bedroom_1',
        'https://i.ibb.co/zhV2N2Cx/IMG-20251031-WA0066.jpg': 'bedroom_1',
        'https://i.ibb.co/q3PG6rpH/IMG-20251031-WA0062.jpg': 'bedroom_2',
        'https://i.ibb.co/Fq08YQVB/IMG-20251031-WA0067.jpg': 'bedroom_2',
        'https://i.ibb.co/JL7NhzP/IMG-20251031-WA0061.jpg': 'kitchen_1',
        'https://i.ibb.co/nqth0vfy/IMG-20251031-WA0064.jpg': 'kitchen_1',
        'https://i.ibb.co/1YsKBScC/IMG-20251031-WA0059.jpg': 'bathroom_1',
        'https://i.ibb.co/nNj0gYqP/IMG-20251031-WA0057.jpg': 'exterior',
        'https://i.ibb.co/Z1mRjtQz/IMG-20251031-WA0056.jpg': 'exterior',
        'https://i.ibb.co/gL6YhydF/IMG-20251031-WA0058.jpg': 'exterior',
        'https://i.ibb.co/NdwzN6jz/IMG-20251031-WA0060.jpg': 'exterior',
        'https://i.ibb.co/jvMQw06L/IMG-20251031-WA0054.jpg': 'other',
        'https://i.ibb.co/pvNSfyZ3/IMG-20251031-WA0055.jpg': 'other'
    }
  }
];

// عند بدء التطبيق: 
// 1. إذا لم يكن هناك تخزين، نستخدم SEED_DATA
// 2. إذا كان هناك تخزين، نستخدمه كما هو (بما في ذلك التعديلات السابقة)
if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
}

export const PropertyService = {
  getAll: (): Property[] => {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error loading properties", e);
        return [];
    }
  },

  getPublished: (): Property[] => {
    const all = PropertyService.getAll();
    return all.filter(p => p.status === 'published');
  },

  getById: (id: string): Property | undefined => {
     const all = PropertyService.getAll();
     return all.find(p => p.id === id);
  },

  getByOwner: (ownerId: string): Property[] => {
    const all = PropertyService.getAll();
    return all.filter(p => p.ownerId === ownerId);
  },

  save: (property: Property): void => {
    const all = PropertyService.getAll();
    const existingIndex = all.findIndex(p => p.id === property.id);
    
    if (existingIndex >= 0) {
      // تحديث البيانات الموجودة
      all[existingIndex] = { ...all[existingIndex], ...property };
    } else {
      // إضافة جديد
      all.unshift(property); 
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  delete: (id: string): void => {
    const all = PropertyService.getAll();
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // وظيفة لتصدير البيانات كملف JSON (للنسخ الاحتياطي)
  exportData: (): string => {
      const data = PropertyService.getAll();
      return JSON.stringify(data, null, 2);
  }
};

export const BookingService = {
  getAll: (): Booking[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(BOOKING_KEY);
    return data ? JSON.parse(data) : [];
  },

  getByProperty: (propertyId: string): Booking[] => {
    return BookingService.getAll().filter(b => b.propertyId === propertyId);
  },

  isRangeAvailable: (propertyId: string, startDate: string, endDate: string): boolean => {
    const propertyBookings = BookingService.getByProperty(propertyId)
        .filter(b => b.status !== 'rejected'); 
    
    const newStart = new Date(startDate).getTime();
    const newEnd = new Date(endDate).getTime();

    return !propertyBookings.some(booking => {
        const existingStart = new Date(booking.startDate).getTime();
        const existingEnd = new Date(booking.endDate).getTime();
        return (newStart < existingEnd && newEnd > existingStart);
    });
  },

  create: (booking: Booking): boolean => {
    if (!BookingService.isRangeAvailable(booking.propertyId, booking.startDate, booking.endDate)) {
        return false;
    }

    const all = BookingService.getAll();
    all.push(booking);
    localStorage.setItem(BOOKING_KEY, JSON.stringify(all));
    return true;
  },

  updateStatus: (bookingId: string, status: 'confirmed' | 'rejected'): void => {
    const all = BookingService.getAll();
    const index = all.findIndex(b => b.id === bookingId);
    if (index !== -1) {
        all[index].status = status;
        localStorage.setItem(BOOKING_KEY, JSON.stringify(all));
    }
  }
};