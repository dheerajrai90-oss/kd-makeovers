import { useState, useEffect } from 'react';
import { db } from '@/src/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Service } from '@/src/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Scissors, Heart, Sparkles, Star } from 'lucide-react';

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
