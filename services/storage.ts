import { Property, Booking } from '../types';

// تحديث المفتاح لضمان حذف الإعلانات القديمة وبقاء إعلان ميرادور فقط
const STORAGE_KEY = 'airhome_properties_v7_mirador_only'; 
const BOOKING_KEY = 'airhome_bookings_v7_mirador_only';

// بيانات العقارات (تم إبقاء العقار الحقيقي فقط)
const SEED_DATA: Property[] = [
  {
    id: 'prop_real_mirador_sea_view',
    title: 'شقة فاخرة مطلة على البحر - ميرادور',
    description: 'استمتع بإقامة هادئة في هذه الشقة المميزة بحي ميرادور الراقي. تتميز بإطلالة بانورامية رائعة على البحر الأبيض المتوسط، وتصميم مريح يجمع بين الأصالة والحداثة. قريبة جداً من الكورنيش والمقاهي والشاطئ.',
    location: 'ميرادور (Mirador)',
    price: 400,
    images: [
      'https://i.ibb.co/nsvn24xj/IMG-20251031-WA0069.jpg', // صالون رئيسي (غلاف)
      'https://i.ibb.co/7Jy1mJXs/IMG-20251031-WA0059.jpg', // الإطلالة
      'https://i.ibb.co/pTc99Wh/IMG-20251031-WA0065.jpg', // غرفة النوم 1
      'https://i.ibb.co/7tjZr6bT/IMG-20251031-WA0064.jpg', // غرفة النوم 2
      'https://i.ibb.co/JjWyvmnR/IMG-20251031-WA0067.jpg', // صالون زاوية 2
      'https://i.ibb.co/LDDKjXQr/IMG-20251031-WA0060.jpg', // الحمام
      'https://i.ibb.co/Z6gbmM9Y/IMG-20251031-WA0054.jpg'  // العمارة من الخارج
    ],
    category: 'شاطئية',
    status: 'published',
    rating: 5.0,
    ownerId: 'host_123',
    amenities: ['إطلالة على البحر', 'واي فاي', 'تلفاز', 'مطبخ مجهز', 'قريب من الشاطئ', 'عائلية'],
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    livingRooms: 1,
    kitchens: 1,
    badge: 'verified', // علامة موثوق لزيادة الثقة
    latitude: 35.2365, 
    longitude: -3.9345,
    imageCategories: {
        'https://i.ibb.co/nsvn24xj/IMG-20251031-WA0069.jpg': 'cover',
        'https://i.ibb.co/7Jy1mJXs/IMG-20251031-WA0059.jpg': 'living',
        'https://i.ibb.co/pTc99Wh/IMG-20251031-WA0065.jpg': 'bedroom_1',
        'https://i.ibb.co/7tjZr6bT/IMG-20251031-WA0064.jpg': 'bedroom_2',
        'https://i.ibb.co/JjWyvmnR/IMG-20251031-WA0067.jpg': 'living',
        'https://i.ibb.co/LDDKjXQr/IMG-20251031-WA0060.jpg': 'bathroom_1',
        'https://i.ibb.co/Z6gbmM9Y/IMG-20251031-WA0054.jpg': 'exterior'
    }
  }
];

// عند بدء التطبيق، إذا لم يكن هناك تخزين لهذا المفتاح الجديد، نقوم بتهيئة البيانات التجريبية
if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
}

export const PropertyService = {
  getAll: (): Property[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
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
      // تحديث البيانات الموجودة دون حذف الحقول الأخرى
      all[existingIndex] = { ...all[existingIndex], ...property };
    } else {
      // إضافة العقار الجديد في مقدمة القائمة
      all.unshift(property); 
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  delete: (id: string): void => {
    const all = PropertyService.getAll();
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
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