import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, User as UserIcon, Calendar, Sparkles, Home, Grid, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { signInWithGoogle, logout } from '@/src/firebase';
import { useSalon } from '@/src/context/SalonContext';
import { KDLogo } from './KDLogo';
import { PWAInstallButton } from './PWAInstallButton';

export default function Navbar() {
  const { user, settings } = useSalon();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'Services', to: '/services' },
    { name: 'Bridal Packages', to: '/packages' },
    { name: 'Gallery', to: '/gallery' },
    { name: 'Offers', to: '/offers' },
    { name: 'My Bookings', to: '/my-bookings' },
    { name: 'Contact', to: '/contact' },
  ];

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setShowAuthModal(false);
      setIsMenuOpen(false);
      toast.success('Signed in successfully');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Login window closed. Please try again.');
        return;
      }
      toast.error('Failed to sign in. Please check your connection.');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    toast.success('Signed out');
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-[100] bg-kd-black/95 backdrop-blur-md border-b border-kd-rosegold/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16 md:h-20">
            {/* Brand Zone */}
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="shrink-0">
              <KDLogo
                logoUrl={settings.logoUrl}
                businessName={settings.businessName}
                tagline={settings.tagline}
                size="sm"
                showTagline={false}
              />
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-6" aria-label="Primary Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                    isActive(link.to)
                      ? 'text-kd-pink border-kd-rosegold'
                      : 'text-kd-muted border-transparent hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions Zone */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <PWAInstallButton variant="compact" />
              {user ? (
                <button
                  type="button"
                  onClick={() => navigate('/my-bookings')}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-kd-rosegold/30 bg-kd-surface text-xs font-medium text-kd-pink hover:border-kd-pink transition-colors whitespace-nowrap shrink-0"
                  title="Customer Account"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="max-w-[90px] truncate">{user.displayName?.split(' ')[0] || 'Account'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-kd-muted hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
              <Link
                to="/book"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-sm transition-colors whitespace-nowrap shrink-0"
              >
                Book Now
              </Link>
            </div>

            {/* Mobile Controls */}
            <div className="flex lg:hidden items-center gap-2">
              <Link
                to="/book"
                className="px-3 py-1.5 rounded-lg bg-kd-pink text-kd-black font-semibold text-xs whitespace-nowrap shrink-0"
              >
                Book
              </Link>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-kd-pink hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-kd-surface border-b border-kd-rosegold/25 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? 'bg-kd-pink text-kd-black font-semibold'
                        : 'text-kd-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="pt-3 mt-3 border-t border-kd-rosegold/20 space-y-2.5">
                  <PWAInstallButton variant="full" />
                  {user ? (
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-kd-black/60 border border-kd-rosegold/20">
                      <div className="flex items-center gap-2 text-sm text-kd-pink">
                        <UserIcon className="w-4 h-4" />
                        <span className="truncate max-w-[180px]">{user.displayName || user.email}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1 text-xs text-kd-muted hover:text-white px-2.5 py-1.5 rounded-lg border border-white/10"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowAuthModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/40 text-white text-sm font-semibold"
                    >
                      <LogIn className="w-4 h-4 text-kd-pink" />
                      Customer Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Bottom Thumb Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-kd-black/95 backdrop-blur-md border-t border-kd-rosegold/25 px-2 py-1"
        aria-label="Mobile Quick Navigation"
      >
        <div className="grid grid-cols-5 gap-1">
          {[
            { label: 'Home', to: '/', icon: Home },
            { label: 'Services', to: '/services', icon: Sparkles },
            { label: 'Book', to: '/book', icon: Calendar },
            { label: 'Gallery', to: '/gallery', icon: ImageIcon },
            { label: 'Bookings', to: '/my-bookings', icon: Grid },
          ].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center py-1.5 rounded-lg min-h-[44px] transition-colors ${
                  active ? 'text-kd-pink' : 'text-kd-muted hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Branded Application Login Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-kd-surface border border-kd-rosegold/40 p-7 text-center shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-kd-muted hover:text-white"
              aria-label="Close login modal"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex justify-center mb-5">
              <KDLogo
                logoUrl={settings.logoUrl}
                businessName={settings.businessName}
                tagline={settings.tagline}
                size="lg"
                showTagline={true}
              />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-white mb-2">
              Welcome to Your Beauty Account
            </h2>
            <p className="text-sm text-kd-muted mb-6 leading-relaxed">
              Sign in with Google to track upcoming appointments, manage rescheduling, save favourite services, and earn studio loyalty rewards.
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-xl bg-kd-pink text-kd-black font-semibold text-sm hover:bg-kd-blush transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Continue with Google
            </button>
            <p className="text-xs text-kd-muted/80 mt-4">
              Prefer not to sign in? You can also book directly as a guest on our booking page.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
