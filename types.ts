
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  images: string[]; 
  imageCategories?: Record<string, string>; // Map Image URL/Base64 -> Category Name (e.g. "Bedroom 1")
  category: string;
  status: 'published' | 'hidden';
  rating: number;
  ownerId: string;
  amenities?: string[];
  maxGuests: number;     
  bedrooms: number;      
  bathrooms: number;     
  livingRooms: number;   
  kitchens: number;
  // Geo Coordinates
  latitude?: number;
  longitude?: number;
  // New Badge System
  badge?: 'none' | 'crown' | 'trophy' | 'diamond' | 'verified';
}

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string; // Saved for easier display
  guestId: string;
  guestName: string;     // Saved for display
  guestPhone: string;    // Added phone number
  startDate: string; 
  endDate: string;   
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'rejected'; // New status field
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  role: 'guest' | 'host';
  avatar: string;
}

export interface Category {
  label: string;
  icon: string; 
}