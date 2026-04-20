import { useState, useEffect } from 'react';
import { auth, db } from '@/src/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { Button } from '@/components/ui/button';
import Services from './components/Services';
import Offers from './components/Offers';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import AppointmentForm from './components/AppointmentForm';
import UserAppointments from './components/UserAppointments';
import AdminPanel from './components/AdminPanel';
import Location from './components/Location';
import Footer from './components/Footer';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Sync user profile
        const userRef = doc(db, 'userProfiles', u.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName || 'Customer',
            loyaltyPoints: 0,
            totalSpent: 0,
            updatedAt: serverTimestamp()
          });
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === 'komalbsc@gmail.com' || user?.email === 'dheeraj.rai90@gmail.com';

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-pink">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-4xl font-serif font-bold text-maroon mb-2">KD Makeovers</div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-maroon/60 font-medium mb-6">Redefine Beauty</div>
          <div className="w-16 h-1 bg-gold rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Services />
        <Offers />
        <Gallery />
        <Reviews />
        <AppointmentForm />
        {user && !isAdmin && <UserAppointments />}
        {isAdmin && <AdminPanel />}
        <Location />
      </main>
      <Footer />
      <Toaster position="top-center" expand={true} richColors />
    </div>
  );
}
