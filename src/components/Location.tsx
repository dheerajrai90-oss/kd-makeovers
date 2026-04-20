import { MapPin, Navigation, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

export default function Location() {
  const mapLink = "https://www.google.com/maps/dir/?api=1&destination=KD+Makeovers+%26+Cosmetics,+Sant+Nagar,+Delhi";
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3498.4124958611847!2d77.1970221755!3d28.75204427559381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd6879802d31%3A0xe1043336ba76527!2sKD%20Makeovers%20%26%20Cosmetics!5e0!3m2!1sen!2sin!4v1713575999000!5m2!1sen!2sin";

  return (
    <section id="location" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-maroon mb-4">Visit Our Studio</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Step into our sanctuary of beauty. We are located in the heart of North Delhi, ready to transform your look.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-soft-pink/20 p-8 rounded-3xl border border-maroon/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-maroon/10">
                    <MapPin className="w-6 h-6 text-maroon" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-maroon mb-1">Our Address</h4>
                    <p className="text-gray-600 leading-relaxed">
                      41ft Road Kamal Vihar, Sant Nagar, <br />
                      Burari, Delhi-110084
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-maroon/10">
                    <Clock className="w-6 h-6 text-maroon" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-maroon mb-1">Business Hours</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Mon - Sun: 10:00 AM - 08:30 PM <br />
                      <span className="text-maroon font-medium text-sm italic">*Open on all major wedding seasons</span>
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-maroon hover:bg-maroon/90 text-white font-bold h-14 px-10 shadow-lg shadow-maroon/20 group"
                    asChild
                  >
                    <a href={mapLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 group-hover:animate-bounce" />
                      Get Directions
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gold/10 -rotate-3 rounded-3xl -z-10 translate-x-4 translate-y-4" />
            <div className="bg-white p-3 rounded-3xl shadow-2xl border border-maroon/10 overflow-hidden aspect-square sm:aspect-video lg:aspect-square group cursor-pointer">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-2xl grayscale group-hover:grayscale-0 group-active:grayscale-0 transition-all duration-700 ease-in-out"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
