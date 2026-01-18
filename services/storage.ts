import { Property, Booking } from '../types';

// قمنا بتحديث مفتاح التخزين لضمان ظهور البيانات الجديدة التجريبية
// عند رفع الموقع، سيقوم هذا المفتاح الجديد بتحميل الإعلانات الافتراضية
const STORAGE_KEY = 'airhome_properties_demo_v2'; 
const BOOKING_KEY = 'airhome_bookings_demo_v2';

// بيانات تجريبية (إعلانات وهمية) لتظهر مباشرة عند فتح التطبيق
const SEED_DATA: Property[] = [
  {
    id: 'prop_1',
    title: 'شقة فاخرة بإطلالة على البحر في ميرادور',
    description: 'استمتع بإقامة لا تُنسى في هذه الشقة الفاخرة التي تطل مباشرة على البحر الأبيض المتوسط. تتميز بتصميم عصري وأثاث مريح، مع شرفة واسعة مثالية لتناول الإفطار أمام الأمواج.',
    location: 'ميرادور (Mirador)',
    price: 800,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'شاطئية',
    status: 'published',
    rating: 4.9,
    ownerId: 'host_123',
    amenities: ['واي فاي', 'مطبخ مجهز', 'تكييف', 'إطلالة', 'تلفاز'],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    livingRooms: 1,
    kitchens: 1,
    badge: 'crown',
    imageCategories: {
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80': 'cover',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80': 'living',
        'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80': 'kitchen_1'
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