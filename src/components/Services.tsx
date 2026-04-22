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
    category: 'Bridal',
    imageUrl: 'https://images.pexels.com/photos/30452324/pexels-photo-30452324.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'Party Makeup',
    description: 'Elegant and sophisticated look for parties, weddings, and special events.',
    price: '₹1,200 onwards',
    category: 'Makeup',
    imageUrl: 'https://images.pexels.com/photos/324655/pexels-photo-324655.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'Engagement Makeup',
    description: 'Soft and glowing look tailored for your engagement ceremony.',
    price: '₹7,000 onwards',
    category: 'Bridal',
    imageUrl: 'https://images.pexels.com/photos/34037599/pexels-photo-34037599.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'Hair Styling',
    description: 'Professional hair styling from traditional buns to modern waves.',
    price: '₹500 onwards',
    category: 'Hair',
    imageUrl: 'https://images.pexels.com/photos/28994569/pexels-photo-28994569.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'Beauty Service',
    description: 'General beauty treatments including cleanup, threading, and waxing.',
    price: 'Flexible',
    category: 'Beauty',
    imageUrl: 'https://images.pexels.com/photos/18809795/pexels-photo-18809795.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    name: 'Others',
    description: 'Have a specific request? We provide custom beauty services on demand.',
    price: 'Flexible',
    category: 'Other',
    imageUrl: 'https://images.pexels.com/photos/3985325/pexels-photo-3985325.jpeg?auto=compress&cs=tinysrgb&w=800'
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
      case 'beauty': return <Sparkles className="w-6 h-6 text-maroon" />;
      case 'other': return <Star className="w-6 h-6 text-maroon" />;
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
              <Card className="h-full border-maroon/10 hover:border-gold/50 transition-all hover:shadow-xl group overflow-hidden">
                {service.imageUrl && (
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={service.imageUrl} 
                      alt={service.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-maroon/10 group-hover:bg-transparent transition-colors duration-300" />
                  </div>
                )}
                <CardHeader className="relative">
                  <div className="absolute -top-6 right-6 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getIcon(service.category)}
                  </div>
                  <CardTitle className="text-xl font-serif text-maroon pt-2">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
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

        {/* Training Academy Section */}
        <div className="mt-32 pt-24 border-t border-maroon/10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-maroon/10 text-maroon text-xs font-bold uppercase tracking-widest mb-4">
              <Star className="w-3 h-3 fill-maroon" />
              Professional Academy
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-maroon mb-4">Academy & Courses</h2>
            <div className="w-24 h-1 bg-gold mx-auto mb-6" />
            <p className="text-gray-600 max-w-2xl mx-auto">
              Build your career in the beauty industry with our certified professional training programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: 'Professional Makeup Artist', 
                desc: 'Become a certified MUA with hands-on training in HD, Airbrush, and Bridal makeup.',
                icon: <Sparkles className="w-8 h-8 text-gold" />,
                duration: '45 Days'
              },
              { 
                title: 'Hair Styling Masterclass', 
                desc: 'Master the art of traditional and modern hair styling for every occasion.',
                icon: <Scissors className="w-8 h-8 text-gold" />,
                duration: '30 Days'
              },
              { 
                title: 'Professional Nail Art', 
                desc: 'Learn nail extensions, gel polish, and creative nail art techniques from scratch.',
                icon: <Star className="w-8 h-8 text-gold" />,
                duration: '15 Days'
              },
              { 
                title: 'Professional Beautician', 
                desc: 'Comprehensive course covering skin analysis, facials, and advanced beauty treatments.',
                icon: <Heart className="w-8 h-8 text-gold" />,
                duration: '60 Days'
              },
              { 
                title: 'Custom Skill Training', 
                desc: 'Specific modules tailored for your needs—perfect for quick skill upgrading.',
                icon: <Star className="w-8 h-8 text-gold" />,
                duration: 'Custom'
              }
            ].map((course, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-maroon/5 shadow-lg hover:shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-maroon flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                  {course.icon}
                </div>
                <h4 className="text-xl font-bold text-maroon mb-2">{course.title}</h4>
                <div className="text-xs text-gold font-bold uppercase tracking-wider mb-4 border-b border-gold/20 pb-2">
                  Duration: {course.duration}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {course.desc}
                </p>
                <Button variant="outline" className="w-full border-maroon/20 text-maroon hover:bg-maroon hover:text-white rounded-full font-bold" asChild>
                  <a href="#appointment">Enquire Now</a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
