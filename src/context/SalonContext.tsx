import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, isAdminUser, OperationType } from '@/src/firebase';
import {
  BridalPackage,
  BusinessSettings,
  GalleryItem,
  Offer,
  Review,
  Service,
  UserProfile,
} from '@/src/types';
import {
  DEFAULT_BUSINESS_SETTINGS,
  DEFAULT_GALLERY,
  DEFAULT_OFFERS,
  DEFAULT_PACKAGES,
  DEFAULT_REVIEWS,
  DEFAULT_SERVICES,
} from '@/src/data/defaults';

interface SalonContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  services: Service[];
  packages: BridalPackage[];
  gallery: GalleryItem[];
  offers: Offer[];
  reviews: Review[];
  settings: BusinessSettings;
  bookedSlotKeys: Set<string>;
}

const SalonContext = createContext<SalonContextValue | undefined>(undefined);

export function SalonProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [packages, setPackages] = useState<BridalPackage[]>(DEFAULT_PACKAGES);
  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY);
  const [offers, setOffers] = useState<Offer[]>(DEFAULT_OFFERS);
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [bookedSlotKeys, setBookedSlotKeys] = useState<Set<string>>(new Set());

  const isAdmin = isAdminUser(user);

  // Auth state & user profile bootstrap
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const userRef = doc(db, 'userProfiles', u.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            await setDoc(userRef, {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || 'Customer',
              phone: '',
              address: '',
              loyaltyPoints: 0,
              totalSpent: 0,
              totalVisits: 0,
              favoriteServiceIds: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.error('Profile sync notice:', err);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubAuth();
  }, []);

  // Signed-in user profile live listener
  useEffect(() => {
    if (!isAuthReady || !user) return;
    const path = `userProfiles/${user.uid}`;
    const unsub = onSnapshot(
      doc(db, 'userProfiles', user.uid),
      (snap) => {
        if (snap.exists()) {
          setUserProfile({ uid: snap.id, ...snap.data() } as UserProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
    return () => unsub();
  }, [isAuthReady, user]);

  // Public storefront listeners
  useEffect(() => {
    const unsubServices = onSnapshot(
      collection(db, 'services'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service));
        setServices(list.length > 0 ? list : DEFAULT_SERVICES);
      },
      (err) => console.warn('Services listener fallback:', err.message)
    );

    const unsubPackages = onSnapshot(
      collection(db, 'packages'),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as BridalPackage));
        setPackages(list.length > 0 ? list : DEFAULT_PACKAGES);
      },
      (err) => console.warn('Packages listener fallback:', err.message)
    );

    const unsubGallery = onSnapshot(
      query(collection(db, 'gallery'), orderBy('createdAt', 'desc')),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem));
        setGallery(list.length > 0 ? list : DEFAULT_GALLERY);
      },
      (err) => console.warn('Gallery listener fallback:', err.message)
    );

    const unsubOffers = onSnapshot(
      query(collection(db, 'offers'), where('active', '==', true)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Offer));
        setOffers(list.length > 0 ? list : DEFAULT_OFFERS);
      },
      (err) => console.warn('Offers listener fallback:', err.message)
    );

    const unsubReviews = onSnapshot(
      query(collection(db, 'reviews'), where('approved', '==', true)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
        setReviews(list.length > 0 ? list : DEFAULT_REVIEWS);
      },
      (err) => console.warn('Reviews listener fallback:', err.message)
    );

    const unsubSettings = onSnapshot(
      doc(db, 'businessSettings', 'default'),
      (snap) => {
        if (snap.exists()) {
          const merged = { ...DEFAULT_BUSINESS_SETTINGS, ...snap.data() } as BusinessSettings;
          if (!merged.logoUrl) {
            merged.logoUrl = DEFAULT_BUSINESS_SETTINGS.logoUrl;
          }
          setSettings(merged);
        }
      },
      (err) => console.warn('Settings listener fallback:', err.message)
    );

    const unsubSlots = onSnapshot(
      query(collection(db, 'bookedSlots'), where('status', '==', 'active')),
      (snap) => {
        const keys = new Set<string>();
        snap.docs.forEach((d) => keys.add(d.id));
        setBookedSlotKeys(keys);
      },
      (err) => console.warn('BookedSlots listener fallback:', err.message)
    );

    return () => {
      unsubServices();
      unsubPackages();
      unsubGallery();
      unsubOffers();
      unsubReviews();
      unsubSettings();
      unsubSlots();
    };
  }, []);

  return (
    <SalonContext.Provider
      value={{
        user,
        userProfile,
        isAuthReady,
        isAdmin,
        services,
        packages,
        gallery,
        offers,
        reviews,
        settings,
        bookedSlotKeys,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const ctx = useContext(SalonContext);
  if (!ctx) {
    throw new Error('useSalon must be used inside SalonProvider');
  }
  return ctx;
}
