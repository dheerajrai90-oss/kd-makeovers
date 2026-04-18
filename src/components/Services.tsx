import { useState, useEffect } from 'react';
import { db } from '@/src/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Service } from '@/src/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Scissors, Heart, Sparkles, Star, Coins } from 'lucide-react';

const DEFAULT_SERVICES: Service[] = [
  {
    name: 'Bridal Makeup',
    description: 'Complete bridal transformation including hair styling, draping, and premium HD makeup.',
    price: '₹10,000 onwards',
    category: 'Bridal'
  },
  {
    name: 'Party Makeup',
    description: 'Elegant and sophisticated look for parties, weddings, and special events.',
    price: '₹1,200 onwards',
    category: 'Makeup'
  },
  {
    name: 'Engagement Makeup',
    description: 'Soft and glowing look tailored for your engagement ceremony.',
    price: '₹7,000 onwards',
    category: 'Bridal'
  },
  {
    name: 'Hair Styling',
    description: 'Professional hair styling from traditional buns to modern waves.',
    price: '₹500 onwards',
    category: 'Hair'
  }
];

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesData.length > 0 ? servicesData : DEFAULT_SERVICES);
    });
    return () => unsubscribe();
  }, []);

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'bridal': return <Heart className="w-6 h-6 text-maroon" />;
      case 'makeup': return <Sparkles className="w-6 h-6 text-maroon" />;
      case 'hair': return <Scissors className="w-6 h-6 text-maroon" />;
      default: return <Star className="w-6 h-6 text-maroon" />;
    }
  };

  return (
    <section id="services" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-br from-maroon via-maroon to-maroon/90 rounded-3xl p-8 md:p-12 mb-20 overflow-hidden shadow-[0_20px_50px_rgba(128,0,0,0.3)] group"
        >
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-gold/20 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-20 -mb-20 blur-2xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-bold uppercase tracking-widest mb-6 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Exclusive Member Benefit
              </div>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                Get rewarded for <br />
                <span className="text-gold">every session</span>
              </h3>
              <p className="text-soft-pink/70 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                Experience luxury and savings. Earn <span className="text-white font-medium">10 points for every ₹100 spent</span>. 
                Redeem your beauty points for direct discounts on future bridal or party sessions!
              </p>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gold blur-2xl opacity-20 animate-pulse" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center gap-6 shadow-2xl">
                  <div className="w-16 h-16 rounded-xl bg-gold flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <Coins className="w-10 h-10 text-maroon" />
                  </div>
                  <div>
                    <div className="text-2xl font-serif font-bold text-white tracking-tight">1 Point = ₹1</div>
                    <div className="text-soft-pink/60 text-sm">Instant Cashback equivalent</div>
                  </div>
                </div>
              </div>
              <Button size="lg" className="bg-gold hover:bg-white text-maroon hover:text-maroon font-black text-lg h-16 px-10 rounded-full shadow-2xl transform hover:scale-105 active:scale-95 transition-all w-full md:w-auto" asChild>
                <a href="#appointment" className="flex items-center gap-3">
                  Join & Book Now
                  <Sparkles className="w-5 h-5 fill-current" />
                </a>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-maroon mb-4">Our Services</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the finest beauty treatments and professional makeovers tailored to your unique style.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-maroon/10 hover:border-gold/50 transition-all hover:shadow-xl group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-soft-pink flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {getIcon(service.category)}
                  </div>
                  <CardTitle className="text-xl font-serif text-maroon">{service.name}</CardTitle>
                  <CardDescription className="text-gold font-medium">{service.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-maroon/5 pt-4">
                  <span className="text-lg font-bold text-maroon">{service.price}</span>
                  <Button variant="ghost" size="sm" className="text-gold hover:text-maroon p-0 h-auto font-bold" asChild>
                    <a href="#appointment">Book Now</a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
