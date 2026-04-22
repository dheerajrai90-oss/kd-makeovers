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
    imageUrl: 'https://images.pexels.com/photos/11111797/pexels-photo-11111797.jpeg?auto=compress&cs=tinysrgb&w=800'
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
          className="relative bg-maroon rounded-[2rem] p-8 md:p-16 mb-20 overflow-hidden shadow-2xl group border border-white/10"
        >
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/10 rounded-full -mr-64 -mt-64 blur-3xl group-hover:bg-gold/20 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-gold text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Exclusive Member Benefit
              </div>
              <h3 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-[1.1]">
                Get rewarded for <br />
                <span className="text-gold italic">every session</span>
              </h3>
              <p className="text-soft-pink/80 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 font-light leading-relaxed mb-10">
                Experience luxury and savings. Earn <span className="text-white font-semibold">10 points for every ₹100 spent</span>. 
                Redeem your points for direct discounts on your future bookings!
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Button size="lg" className="bg-gold hover:bg-white text-maroon hover:text-maroon font-bold text-lg h-16 px-10 rounded-xl shadow-lg transition-all" asChild>
                  <a href="#appointment" className="flex items-center gap-3">
                    Join & Book Now
                    <Sparkles className="w-5 h-5 fill-current" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-8 min-w-[280px]">
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gold blur-3xl opacity-20 animate-pulse" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 flex flex-col items-center text-center shadow-2xl">
                  <div className="w-20 h-20 rounded-2xl bg-gold flex items-center justify-center shadow-xl mb-6 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <Coins className="w-12 h-12 text-maroon" />
                  </div>
                  <div className="text-3xl font-serif font-bold text-white mb-2 leading-none">1 Point = ₹1</div>
                  <div className="text-gold/80 text-sm font-medium uppercase tracking-widest">Instant Cashback</div>
                </div>
              </div>
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-maroon/5 border border-maroon/10 text-maroon text-xs font-bold uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Professional Academy
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-maroon mb-6">Academy & Courses</h2>
            <div className="w-24 h-1.5 bg-gold mx-auto mb-8 rounded-full" />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Build your career in the beauty industry with our certified professional training programs led by Komal Kumari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                title: 'Professional Makeup Artist', 
                desc: 'Become a certified MUA with hands-on training in HD, Airbrush, and Bridal makeup.',
                duration: '45 Days',
                image: 'https://images.pexels.com/photos/4006709/pexels-photo-4006709.jpeg?auto=compress&cs=tinysrgb&w=800'
              },
              { 
                title: 'Hair Styling Masterclass', 
                desc: 'Master the art of traditional and modern hair styling for every occasion.',
                duration: '30 Days',
                image: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800'
              },
              { 
                title: 'Professional Nail Art', 
                desc: 'Learn nail extensions, gel polish, and creative nail art techniques from scratch.',
                duration: '15 Days',
                image: 'https://images.pexels.com/photos/18112333/pexels-photo-18112333.jpeg?auto=compress&cs=tinysrgb&w=800'
              },
              { 
                title: 'Professional Beautician', 
                desc: 'Comprehensive course covering skin analysis, facials, and advanced beauty treatments.',
                duration: '60 Days',
                image: 'https://images.pexels.com/photos/6663373/pexels-photo-6663373.jpeg?auto=compress&cs=tinysrgb&w=800'
              },
              { 
                title: 'Custom Skill Training', 
                desc: 'Specific modules tailored for your needs—perfect for quick skill upgrading.',
                duration: 'Custom',
                image: 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=800'
              }
            ].map((course, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white rounded-3xl border border-maroon/5 shadow-[0_15px_40px_rgba(128,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(128,0,0,0.12)] transition-all group overflow-hidden flex flex-col ${
                  i === 3 ? 'md:col-start-1 lg:col-start-automatic' : ''
                } ${
                  i === 4 ? 'lg:col-start-automatic' : ''
                }`}
              >
                <div className="h-56 sm:h-64 overflow-hidden relative">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-maroon/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>
                <div className="p-6 sm:p-8 lg:p-10 flex flex-col flex-grow">
                  <h4 className="text-xl sm:text-2xl font-serif font-bold text-maroon mb-3 group-hover:text-gold transition-colors">{course.title}</h4>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gold/10 text-gold text-[10px] font-black uppercase tracking-widest mb-4 w-fit">
                    Course Duration: {course.duration}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-grow font-light">
                    {course.desc}
                  </p>
                  <Button variant="outline" className="w-full border-maroon/20 text-maroon hover:bg-maroon hover:text-white rounded-2xl font-bold h-12 sm:h-14 text-base transition-all shadow-sm hover:shadow-md" asChild>
                    <a href="https://api.whatsapp.com/send?phone=919650349357&text=Hi%20Komal,%20I'm%20interested%20in%20your%20academy%20courses!" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      Request Course Details
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
