export interface Appointment {
  id?: string;
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed';
  createdAt: any;
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
