export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'rescheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'online';
export type RefundStatus = 'none' | 'requested' | 'refunded';

export interface Appointment {
  id?: string;
  bookingCode: string;
  userId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  bookingType: 'service' | 'package' | 'course';
  service: string;
  serviceId?: string | null;
  packageId?: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  slotKeys?: string[];
  notes?: string;
  referenceImages?: string[];
  status: BookingStatus;
  price: number;
  advancePaid: number;
  paymentStatus: PaymentStatus;
  pointsUsed: number;
  pointsEarned: number;
  internalNotes?: string;
  rescheduleRequested?: boolean;
  requestedDate?: string;
  requestedTime?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface BookedSlot {
  id?: string;
  date: string;
  time: string;
  appointmentId: string;
  status: 'active' | 'released';
  createdAt: any;
}

export interface BookingTracker {
  bookingCode: string;
  appointmentId: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  totalSpent: number;
  totalVisits: number;
  notes?: string;
  favoriteServiceIds?: string[];
  createdAt?: any;
  updatedAt: any;
}

export interface Service {
  id?: string;
  name: string;
  description: string;
  price: string;
  numericPrice?: number;
  durationMinutes?: number;
  category: string;
  imageUrl?: string;
  active?: boolean;
  featured?: boolean;
  updatedAt?: any;
}

export interface ServiceCategory {
  id?: string;
  name: string;
  slug: string;
  displayOrder: number;
  active: boolean;
}

export type PackageTier = 'Bridal' | 'Engagement' | 'Pre-Bridal' | 'Wedding Guest' | 'Custom';

export interface BridalPackage {
  id?: string;
  name: string;
  tier: PackageTier;
  price: string;
  numericPrice: number;
  includedServices: string[];
  imageUrl?: string;
  description: string;
  specialOffer?: string;
  durationMinutes: number;
  active: boolean;
  createdAt?: any;
}

export interface Review {
  id?: string;
  name: string;
  userId?: string | null;
  appointmentId?: string | null;
  rating: number;
  comment: string;
  photoUrl?: string | null;
  approved: boolean;
  createdAt: any;
}

export type GalleryCategory =
  | 'Bridal Makeup'
  | 'Reception Makeup'
  | 'Engagement Makeup'
  | 'Party Makeup'
  | 'Hairstyling'
  | 'Before and After';

export interface GalleryItem {
  id?: string;
  url: string;
  title: string;
  category: GalleryCategory | string;
  caption?: string;
  isActualClientWork?: boolean;
  createdAt: any;
}

export type OfferType = 'Discount' | 'Festival' | 'Bridal Special' | 'Limited Time';

export interface Offer {
  id?: string;
  title: string;
  description: string;
  code?: string;
  offerType: OfferType;
  discountLabel?: string;
  expiryDate?: string;
  active: boolean;
  createdAt: any;
}

export interface PaymentRecord {
  id?: string;
  appointmentId: string;
  bookingCode: string;
  userId?: string | null;
  customerName: string;
  totalAmount: number;
  advanceAmount: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  refundStatus: RefundStatus;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface AppNotification {
  id?: string;
  recipientRole: 'admin' | 'customer';
  recipientUid: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: any;
}

export interface BusinessSettings {
  id?: string;
  businessName: string;
  tagline: string;
  logoUrl?: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  workingDays: string[];
  openingTime: string;
  closingTime: string;
  breakStart: string;
  breakEnd: string;
  holidays: string[];
  defaultSlotDuration: number;
  bookingAdvancePercent: number;
  cancellationPolicy: string;
  instagramUrl: string;
  facebookUrl: string;
  updatedAt?: any;
}

export interface ActivityLog {
  id?: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  createdAt: any;
}
