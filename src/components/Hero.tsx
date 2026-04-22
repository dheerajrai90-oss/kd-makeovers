import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Sparkles, MessageCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 sm:pt-32 overflow-hidden bg-maroon">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/22605372/pexels-photo-22605372.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Premium Makeup Artistry"
          className="w-full h-full object-cover brightness-[0.5] contrast-[1.1]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Delhi's Premium Bridal Studio</span>
            </div>
            <a 
              href="https://www.google.com/search?q=kd+makeovers+%26+cosmetics#lrd=0x390cff595fb9fcdd:0xbc93f994fe8c0caa,1,,,," 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5" />
              <span className="flex items-center gap-1">
                4.9 <span className="text-gold">★★★★★</span> (200+)
              </span>
            </a>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6">
            Unveil Your <span className="text-gold italic">Radiant</span> Beauty
          </h1>
          <p className="text-lg md:text-xl text-soft-pink/90 mb-8 font-light leading-relaxed">
            Exquisite Indian bridal makeovers and premium cosmetics by Komal Kumari. 
            Crafting timeless looks for your most special moments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-4">
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
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-soft-pink to-transparent z-10 pointer-events-none" />
    </section>
  );
}
