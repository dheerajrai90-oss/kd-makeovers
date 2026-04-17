import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Sparkles, MessageCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1595152248441-c3a8d4469040?q=80&w=2000&auto=format&fit=crop"
          alt="Indian Bridal Makeup"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon/80 to-maroon/40 mix-blend-multiply" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Delhi's Premium Bridal Studio</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
            Unveil Your <span className="text-gold italic">Radiant</span> Beauty
          </h1>
          <p className="text-lg md:text-xl text-soft-pink/90 mb-8 font-light leading-relaxed">
            Exquisite Indian bridal makeovers and premium cosmetics by Komal Kumari. 
            Crafting timeless looks for your most special moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-gold hover:bg-gold/90 text-maroon font-bold text-lg h-14 px-8" asChild>
              <a href="#appointment">Book Appointment</a>
            </Button>
            <Button size="lg" className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg h-14 px-8" asChild>
              <a 
                href="https://api.whatsapp.com/send?phone=919650349357&text=Hi%20Komal,%20I'm%20interested%20in%20your%20makeup%20services!" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                Chat on WhatsApp
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold text-lg h-14 px-8" asChild>
              <a href="#gallery">View Gallery</a>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-soft-pink to-transparent z-10 pointer-events-none" />
    </section>
  );
}
