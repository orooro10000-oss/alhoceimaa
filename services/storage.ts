import { Property, Booking } from '../types';

// تحديث المفتاح إلى الإصدار 6 (v6) لتحديث الصور
const STORAGE_KEY = 'airhome_master_data_v6_matadiro_imgs'; 
const BOOKING_KEY = 'airhome_master_bookings_v6_matadiro_imgs';

// بيانات العقارات (تم تحديث روابط الصور)
const SEED_DATA: Property[] = [
  {
    id: 'prop_matadiro_centre_ville',
    title: 'MATADIRO',
    description: 'استمتع بإقامة استثنائية في MATADIRO بقلب وسط المدينة. شقة شاطئية فاخرة بتصنيف ماسي، مجهزة بكل وسائل الراحة من واي فاي وتلفاز وغسالة ومطبخ متكامل. موقع مثالي قريب من البحر والمرافق الحيوية.',
    location: 'وسط المدينة (Centre Ville)',
    price: 400,
    category: 'شاطئية',
    status: 'published',
    rating: 5.0,
    ownerId: 'host_123',
    amenities: ['واي فاي', 'تلفاز', 'غسالة', 'مطبخ مجهز', 'ثلاجة', 'قريب من الشاطئ'],
    maxGuests: 4,
    bedrooms: 1,
    bathrooms: 1,
    livingRooms: 1,
    kitchens: 1,
    badge: 'diamond',
    images: [
      'https://i.ibb.co/ZzmTSVmQ/IMG-20251031-WA0071.jpg', // Living (Cover) - غرفة المعيشة
      'https://i.ibb.co/whJTX1WM/IMG-20251031-WA0059-1.jpg', // Bedroom - غرفة نوم 1
      'https://i.ibb.co/67HDSKnZ/IMG-20251031-WA0067-1.jpg', // Bedroom - غرفة نوم 1
      'https://i.ibb.co/yFrXtvcy/IMG-20251031-WA0065-1.jpg', // Bedroom - غرفة نوم 1
      'https://i.ibb.co/4RnRdXB6/IMG-20251031-WA0064.jpg', // Kitchen - مطبخ
      'https://i.ibb.co/kspWRM6d/IMG-20251031-WA0070.jpg'  // Bathroom - حمام
    ],
    imageCategories: {
        'https://i.ibb.co/ZzmTSVmQ/IMG-20251031-WA0071.jpg': 'living',
        'https://i.ibb.co/whJTX1WM/IMG-20251031-WA0059-1.jpg': 'bedroom_1',
        'https://i.ibb.co/67HDSKnZ/IMG-20251031-WA0067-1.jpg': 'bedroom_1',
        'https://i.ibb.co/yFrXtvcy/IMG-20251031-WA0065-1.jpg': 'bedroom_1',
        'https://i.ibb.co/4RnRdXB6/IMG-20251031-WA0064.jpg': 'kitchen_1',
        'https://i.ibb.co/kspWRM6d/IMG-20251031-WA0070.jpg': 'bathroom_1'
    }
  }
];

// منطق التحميل:
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
      all[existingIndex] = { ...all[existingIndex], ...property };
    } else {
      all.unshift(property); 
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  delete: (id: string): void => {
    const all = PropertyService.getAll();
    const filtered = all.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

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