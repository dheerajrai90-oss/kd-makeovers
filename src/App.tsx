import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SalonProvider, useSalon } from '@/src/context/SalonContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { KDLogo } from '@/src/components/KDLogo';
import { OfflineIndicator } from '@/src/components/OfflineIndicator';
import Navbar from '@/src/components/Navbar';
import Footer from '@/src/components/Footer';
import Hero from '@/src/components/Hero';
import PackagesSection from '@/src/components/PackagesSection';
import ServicesSection from '@/src/components/ServicesSection';
import GallerySection from '@/src/components/GallerySection';
import OffersSection from '@/src/components/OffersSection';
import ReviewsSection from '@/src/components/ReviewsSection';
import LocationSection from '@/src/components/LocationSection';
import BookingSection from '@/src/components/BookingSection';
import CustomerDashboard from '@/src/components/CustomerDashboard';
import AdminLayout from '@/src/components/admin/AdminLayout';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'KD Makeovers & Cosmetics | Luxury Bridal Makeup & Salon in Delhi',
  '/services': 'Services Catalogue & Academy | KD Makeovers & Cosmetics',
  '/packages': 'Bridal & Event Packages | KD Makeovers & Cosmetics',
  '/gallery': 'Makeup & Styling Gallery | KD Makeovers & Cosmetics',
  '/offers': 'Offers & Promotions | KD Makeovers & Cosmetics',
  '/book': 'Book Appointment Online | KD Makeovers & Cosmetics',
  '/my-bookings': 'My Bookings & Account | KD Makeovers & Cosmetics',
  '/contact': 'Location & Contact | KD Makeovers & Cosmetics',
  '/admin': 'Studio Administration | KD Makeovers & Cosmetics',
};

function RouteManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    document.title = ROUTE_TITLES[pathname] || ROUTE_TITLES['/'];
  }, [pathname]);

  return null;
}

function HomePage() {
  return (
    <>
      <Hero />
      <PackagesSection compactHomeMode />
      <ServicesSection compactHomeMode />
      <GallerySection compactHomeMode />
      <OffersSection compactHomeMode />
      <ReviewsSection />
      <LocationSection />
    </>
  );
}

function CustomerShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-kd-black text-white">
      <Navbar />
      <main className="flex-grow pb-16 md:pb-0">{children}</main>
      <Footer />
      <OfflineIndicator />
    </div>
  );
}

function AppRoutes() {
  const { isAuthReady, settings } = useSalon();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-kd-black text-white p-6">
        <div className="animate-pulse flex flex-col items-center gap-5">
          <KDLogo
            logoUrl={settings.logoUrl}
            businessName={settings.businessName}
            tagline={settings.tagline}
            size="lg"
            showTagline
          />
          <div className="w-24 h-0.5 rounded-full bg-gradient-to-r from-transparent via-kd-rosegold to-transparent" />
        </div>
      </div>
    );
  }

  return (
    <>
      <RouteManager />
      <Routes>
        <Route path="/admin" element={<AdminLayout />} />
        <Route
          path="/"
          element={
            <CustomerShell>
              <HomePage />
            </CustomerShell>
          }
        />
        <Route
          path="/services"
          element={
            <CustomerShell>
              <ServicesSection />
            </CustomerShell>
          }
        />
        <Route
          path="/packages"
          element={
            <CustomerShell>
              <PackagesSection />
            </CustomerShell>
          }
        />
        <Route
          path="/gallery"
          element={
            <CustomerShell>
              <GallerySection />
            </CustomerShell>
          }
        />
        <Route
          path="/offers"
          element={
            <CustomerShell>
              <OffersSection />
            </CustomerShell>
          }
        />
        <Route
          path="/book"
          element={
            <CustomerShell>
              <BookingSection />
            </CustomerShell>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <CustomerShell>
              <CustomerDashboard />
            </CustomerShell>
          }
        />
        <Route
          path="/contact"
          element={
            <CustomerShell>
              <LocationSection />
            </CustomerShell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            background: '#171415',
            color: '#FFFFFF',
            border: '1px solid rgba(239, 208, 208, 0.35)',
          },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SalonProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SalonProvider>
    </ErrorBoundary>
  );
}
