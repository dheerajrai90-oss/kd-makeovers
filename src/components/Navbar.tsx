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
          const navHeight = 84; // Matches the new h-20/h-24 navbar
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
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md border-b border-maroon/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-24">
          <div className="flex-shrink-0 flex items-center">
            <a href="#" onClick={(e) => handleNavClick(e, '#')} className="flex items-center group">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-4xl font-serif font-bold text-maroon tracking-tighter leading-none group-hover:text-gold transition-colors duration-300">
                  KD <span className="text-gold group-hover:text-maroon transition-colors duration-300">Makeovers</span>
                </span>
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] text-gray-500 font-semibold mt-1">Redefine Beauty</span>
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
                className="text-sm font-semibold text-gray-700 hover:text-maroon transition-colors uppercase tracking-wider"
              >
                {link.name}
              </a>
            ))}
            {user ? (
              <div className="flex items-center gap-4 border-l border-maroon/10 pl-8">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Welcome</span>
                  <span className="text-xs font-bold text-maroon">{user.displayName || 'Customer'}</span>
                </div>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-maroon/20 hover:bg-maroon hover:text-white transition-all" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="lg" onClick={handleLogin} className="bg-maroon text-white hover:bg-maroon/90 font-bold px-6 h-12">
                <LogIn className="w-5 h-5 mr-2" />
                Customer Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-maroon p-2"
            >
              {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
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
