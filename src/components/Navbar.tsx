import React, { useState, useEffect } from 'react';
import { auth, signInWithGoogle, logout } from '@/src/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Menu, X, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Login window was closed. Please try again.');
        return;
      }
      toast.error('Failed to login. Please check your connection.');
      console.error('Login error:', error);
    }
  };

  const isAdmin = user?.email === 'komalbsc@gmail.com' || user?.email === 'dheeraj.rai90@gmail.com';

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Services', href: '#services' },
    { name: 'Offers', href: '#offers' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Location', href: '#location' },
    ...(user && !isAdmin ? [{ name: 'My Bookings', href: '#my-bookings' }] : []),
    ...(isAdmin ? [{ name: 'Admin', href: '#admin' }] : []),
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#') && href !== '#') {
      e.preventDefault();
      const element = document.getElementById(href.substring(1));
      if (element) {
        setIsMenuOpen(false);
        // Small delay to allow menu animation to start closing
        setTimeout(() => {
          const navHeight = 64; // h-16 = 64px
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    } else if (href === '#') {
      e.preventDefault();
      setIsMenuOpen(false);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-maroon/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <a href="#" onClick={(e) => handleNavClick(e, '#')} className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gold/20 rounded-full blur-sm group-hover:bg-gold/40 transition-colors" />
                <img 
                  src="/logo.png" 
                  alt="KD Makeovers Logo" 
                  className="relative h-10 w-10 sm:h-14 sm:w-14 rounded-full object-cover border border-gold sm:border-2 shadow-md group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-xl font-serif font-bold text-maroon tracking-tight leading-none">
                  KD <span className="text-gold">Makeovers</span>
                </span>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-500 font-medium">Redefine Beauty</span>
              </div>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-gray-700 hover:text-maroon transition-colors"
              >
                {link.name}
              </a>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <UserIcon className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.displayName || 'Customer'}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-maroon">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={handleLogin} className="bg-maroon text-white hover:bg-maroon/90 font-bold">
                <LogIn className="w-4 h-4 mr-2" />
                Customer Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-maroon"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-maroon/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-maroon hover:bg-maroon/5 rounded-md"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 border-t border-maroon/10">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-600 flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      {user.displayName || 'Customer'}
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-maroon" onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-maroon text-white font-bold" onClick={handleLogin}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Customer Login
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
