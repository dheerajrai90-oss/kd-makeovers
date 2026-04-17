import { useState, useEffect } from 'react';
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
    { name: 'Reviews', href: '#reviews' },
    ...(isAdmin ? [{ name: 'Admin', href: '#admin' }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-maroon/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-serif font-bold text-maroon tracking-tight">
              KD <span className="text-gold">Makeovers</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-maroon transition-colors"
              >
                {link.name}
              </a>
            ))}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <UserIcon className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.displayName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={logout} className="text-maroon">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={handleLogin} className="border-maroon text-maroon hover:bg-maroon hover:text-white">
                <LogIn className="w-4 h-4 mr-2" />
                Admin Login
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
                  onClick={() => setIsMenuOpen(false)}
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
                      {user.displayName}
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-maroon" onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full border-maroon text-maroon" onClick={handleLogin}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Admin Login
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
