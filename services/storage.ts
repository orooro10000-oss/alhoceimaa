import { Property, Booking } from '../types';

// تحديث المفتاح إلى الإصدار 4 (v4) لبدء تطبيق فارغ
const STORAGE_KEY = 'airhome_master_data_v4_empty'; 
const BOOKING_KEY = 'airhome_master_bookings_v4_empty';

// بيانات العقارات (فارغة الآن)
const SEED_DATA: Property[] = [];

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