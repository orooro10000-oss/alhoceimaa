import { Property, Booking } from '../types';

// تحديث المفتاح لضمان ظهور العقار الجديد (شقة مطلة على البحر) للجميع فوراً
const STORAGE_KEY = 'airhome_properties_v6_mirador_update'; 
const BOOKING_KEY = 'airhome_bookings_v6_mirador_update';

// بيانات العقارات (تم إضافة العقار الحقيقي في المقدمة)
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
  },
  {
    id: 'prop_2',
    title: 'فيلا رائعة مع مسبح في تالا يوسف',
    description: 'فيلا واسعة وهادئة تقع في منطقة تالا يوسف، مثالية للعائلات الكبيرة. تحتوي على مسبح خاص وحديقة جميلة للاسترخاء.',
    location: 'تالا يوسف (Tala Youssef)',
    price: 2500,
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'مسابح مذهلة',
    status: 'published',
    rating: 5.0,
    ownerId: 'host_123',
    amenities: ['مسبح', 'موقف سيارات', 'واي فاي', 'مطبخ مجهز', 'تكييف'],
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    livingRooms: 2,
    kitchens: 1,
    badge: 'diamond',
    latitude: 35.2205,
    longitude: -3.9802,
    imageCategories: {
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80': 'cover',
        'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=800&q=80': 'bathroom_1',
        'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80': 'living'
    }
  },
  {
    id: 'prop_3',
    title: 'ستوديو مودرن وسط المدينة',
    description: 'ستوديو أنيق ومجهز بالكامل في قلب مدينة الحسيمة. قريب من جميع المرافق والمطاعم والمقاهي.',
    location: 'وسط المدينة (Centre Ville)',
    price: 400,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'مدن',
    status: 'published',
    rating: 4.7,
    ownerId: 'host_123',
    amenities: ['واي فاي', 'تلفاز', 'مطبخ مجهز'],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 0,
    kitchens: 1,
    badge: 'verified',
    latitude: 35.2446,
    longitude: -3.9321,
    imageCategories: {
         'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80': 'cover',
         'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80': 'bedroom_1'
    }
  },
  {
    id: 'prop_4',
    title: 'منزل شاطئي في كيمادو',
    description: 'خطوات قليلة تفصلك عن الرمال الذهبية لشاطئ كيمادو. منزل مريح مع تراس يطل على البحر.',
    location: 'شاطئ كيمادو (Quemado)',
    price: 1200,
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'شاطئية',
    status: 'published',
    rating: 4.8,
    ownerId: 'host_123',
    amenities: ['إطلالة', 'واي فاي', 'قهوة'],
    maxGuests: 5,
    bedrooms: 2,
    bathrooms: 1,
    livingRooms: 1,
    kitchens: 1,
    badge: 'trophy',
    latitude: 35.2472,
    longitude: -3.9365,
    imageCategories: {
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80': 'cover',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80': 'exterior'
    }
  },
    {
    id: 'prop_5',
    title: 'شقة عائلية في حي المنزه',
    description: 'شقة واسعة ومريحة في حي هادئ وآمن، مناسبة جداً للعائلات. قريبة من الأسواق والمساجد.',
    location: 'حي المنزه',
    price: 500,
    images: [
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'رائج',
    status: 'published',
    rating: 4.5,
    ownerId: 'host_123',
    amenities: ['موقف سيارات', 'غسالة', 'مطبخ مجهز'],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 1,
    livingRooms: 1,
    kitchens: 1,
    badge: 'none',
    latitude: 35.2400,
    longitude: -3.9300,
    imageCategories: {
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80': 'cover',
        'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80': 'kitchen_1'
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