import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  return (
    <footer className="bg-maroon text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-5 mb-8 group w-full justify-center md:justify-start">
              <div className="relative">
                <div className="absolute -inset-1 bg-gold/10 rounded-full blur-md group-hover:bg-gold/20 transition-colors" />
                <img 
                  src="/logo.png" 
                  alt="KD Makeovers Logo" 
                  className="relative h-24 w-24 rounded-full object-cover border-2 border-gold/40 p-1 bg-maroon/20 transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h2 className="text-3xl font-serif font-bold text-gold tracking-tight">KD Makeovers & Cosmetics</h2>
                <div className="w-12 h-0.5 bg-gold/30 mt-1" />
              </div>
            </div>
            <p className="text-soft-pink/70 max-w-md mb-8 leading-relaxed text-center md:text-left mx-auto md:mx-0">
              Premium Indian bridal makeup and cosmetics services in Delhi. 
              We believe every bride deserves to look her best on her special day. 
              Our expert team led by Komal Kumari is dedicated to making your beauty dreams come true.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-maroon transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-maroon transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://api.whatsapp.com/send?phone=919650349357&text=Hello%20Komal!" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold hover:text-maroon transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-serif font-bold text-gold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-soft-pink/70">
              <li><a href="#" className="hover:text-gold transition-colors">Home</a></li>
              <li><a href="#services" className="hover:text-gold transition-colors">Services</a></li>
              <li><a href="#gallery" className="hover:text-gold transition-colors">Gallery</a></li>
              <li><a href="#reviews" className="hover:text-gold transition-colors">Reviews</a></li>
              <li><a href="#appointment" className="hover:text-gold transition-colors">Book Now</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-serif font-bold text-gold mb-6">Contact Us</h3>
            <ul className="space-y-4 text-soft-pink/70">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                <a 
                  href="https://share.google/xIt4UThOQCeSDPB8I" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  41ft Road Kamal Vihar, Sant Nagar, Delhi-110084
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <a href="tel:+919650349357" className="hover:text-gold transition-colors">+91 96503 49357</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <a href="mailto:komalbsc@gmail.com" className="hover:text-gold transition-colors">komalbsc@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:row justify-between items-center text-soft-pink/50 text-sm">
          <p>© {new Date().getFullYear()} KD Makeovers & Cosmetics. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed with ❤️ for Komal Kumari</p>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://api.whatsapp.com/send?phone=919650349357&text=Hi%20Komal,%20I'd%20like%20to%20book%20a%20makeup%20session."
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[9999] flex items-center group cursor-pointer"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-green-500 rounded-full pointer-events-none"
        />
        <div className="relative bg-green-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 overflow-hidden ring-4 ring-white/20">
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 font-bold group-hover:ml-1">
            Chat with us
          </span>
        </div>
      </motion.a>
    </footer>
  );
}
