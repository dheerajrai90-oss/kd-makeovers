export interface Appointment {
  id?: string;
  userId?: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  price?: number;
  pointsUsed?: number;
  pointsEarned?: number;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  loyaltyPoints: number;
  totalSpent: number;
  updatedAt: any;
}

export interface Service {
  id?: string;
  name: string;
  description: string;
  price: string;
  category: string;
}

export interface Review {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: any;
}

export interface GalleryItem {
  id?: string;
  url: string;
  title: string;
  category: string;
  createdAt: any;
}

export interface Offer {
  id?: string;
  title: string;
  description: string;
  code?: string;
  expiryDate?: string;
  active: boolean;
  createdAt: any;
}
