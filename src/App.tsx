import { useState, useEffect } from 'react';
import { auth } from '@/src/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Offers from './components/Offers';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import AppointmentForm from './components/AppointmentForm';
import AdminPanel from './components/AdminPanel';
import Footer from './components/Footer';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === 'komalbsc@gmail.com' || user?.email === 'dheeraj.rai90@gmail.com';

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-pink">
        <div className="animate-pulse flex flex-col items-center">
          <div className="text-4xl font-serif font-bold text-maroon mb-4">KD Makeovers</div>
          <div className="w-12 h-1 bg-gold rounded-full"></div>
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
        {isAdmin && <AdminPanel />}
      </main>
      <Footer />
      <Toaster position="top-center" expand={true} richColors />
    </div>
  );
}
