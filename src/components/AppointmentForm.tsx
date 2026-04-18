import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth, signInWithGoogle } from '@/src/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, doc, updateDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, User, Phone, Sparkles, MessageCircle, Coins, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { Service, UserProfile } from '@/src/types';

const appointmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
  serviceId: z.string().min(1, 'Please select a service'),
  serviceName: z.string(),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'bridal-makeup',
    name: 'Bridal Makeup',
    description: 'Complete bridal transformation including hair styling, draping, and premium HD makeup.',
    price: '₹10,000 onwards',
    category: 'Bridal'
  },
  {
    id: 'party-makeup',
    name: 'Party Makeup',
    description: 'Elegant and sophisticated look for parties, weddings, and special events.',
    price: '₹1,200 onwards',
    category: 'Makeup'
  },
  {
    id: 'engagement-makeup',
    name: 'Engagement Makeup',
    description: 'Soft and glowing look tailored for your engagement ceremony.',
    price: '₹7,000 onwards',
    category: 'Bridal'
  },
  {
    id: 'hair-styling',
    name: 'Hair Styling',
    description: 'Professional hair styling from traditional buns to modern waves.',
    price: '₹500 onwards',
    category: 'Hair'
  },
  {
    id: 'beauty-service',
    name: 'Beauty Service',
    description: 'General beauty treatments including cleanup, threading, and waxing.',
    price: '',
    category: 'Beauty'
  },
  {
    id: 'other-service',
    name: 'Custom Service',
    description: 'Any other beauty requirement not listed above.',
    price: 'Flexible',
    category: 'Other'
  }
];

export default function AppointmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const unsubServices = onSnapshot(query(collection(db, 'services')), (snap) => {
      const servicesData = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
      if (servicesData.length > 0) {
        setServices(servicesData);
      }
    });
    
    let unsubProfile = () => {};
    const setupProfileListener = (uid: string) => {
      unsubProfile = onSnapshot(doc(db, 'userProfiles', uid), (snap) => {
        if (snap.exists()) setUserProfile(snap.data() as UserProfile);
      });
    };

    if (auth.currentUser) {
      setupProfileListener(auth.currentUser.uid);
    }

    return () => {
      unsubAuth();
      unsubServices();
      unsubProfile();
    };
  }, []);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      serviceId: '',
      serviceName: '',
      date: '',
      time: '',
      notes: ''
    }
  });

  const watchServiceId = watch('serviceId');

  useEffect(() => {
    if (watchServiceId) {
      const s = services.find(srv => srv.id === watchServiceId);
      if (s) {
        setSelectedService(s);
        setValue('serviceName', s.name);
        
        // Reset redemption if price is below threshold
        const price = parseInt(s.price.replace(/[^0-9]/g, '')) || 0;
        if (price < 500) {
          setRedeemPoints(false);
        }
      }
    }
  }, [watchServiceId, services, setValue]);

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    try {
      const userId = auth.currentUser?.uid;
      
      // Parse numeric price from service price string
      const numericPrice = selectedService 
        ? parseInt(selectedService.price.replace(/[^0-9]/g, '')) || 0 
        : 0;

      const pointsToUse = redeemPoints && userProfile ? userProfile.loyaltyPoints : 0;

      await addDoc(collection(db, 'appointments'), {
        name: data.name,
        phone: data.phone,
        service: data.serviceName,
        serviceId: data.serviceId,
        date: data.date,
        time: data.time,
        notes: data.notes || '',
        price: numericPrice,
        pointsUsed: pointsToUse,
        userId: userId || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      if (pointsToUse > 0 && userId) {
        // Mark points as "reserved" or just deduct now for simplicity
        const userRef = doc(db, 'userProfiles', userId);
        await updateDoc(userRef, {
          loyaltyPoints: increment(-pointsToUse),
          updatedAt: serverTimestamp()
        });
      }

      toast.success('Appointment booked successfully! Your points have been applied as a discount.');
      reset();
      setSelectedService(null);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Login window was closed. Please try again.');
        return;
      }
      toast.error('Failed to login. Please try again.');
    }
  };

  return (
    <section id="appointment" className="py-24 bg-soft-pink/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Card className="border-maroon/10 shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">
              <div className="md:col-span-2 bg-maroon p-8 text-white flex flex-col justify-center">
                <Sparkles className="w-12 h-12 text-gold mb-6" />
                <h3 className="text-3xl font-serif font-bold mb-4">Book Your Session</h3>
                <p className="text-soft-pink/80 mb-8 font-light">
                  Ready for your transformation? Fill out the form and our team will get back to you to confirm your slot.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-gold" />
                    <a href="tel:+919650349357" className="hover:text-gold transition-colors">+91 96503 49357</a>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <CalendarIcon className="w-4 h-4 text-gold" />
                    <span>Mon - Sun: 10:00 AM - 8:00 PM</span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-3 p-8 bg-white relative">
                {!currentUser ? (
                  <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-8 rounded-2xl shadow-xl border border-maroon/10 max-w-sm"
                    >
                      <div className="w-16 h-16 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-6">
                        <LogIn className="w-8 h-8 text-maroon" />
                      </div>
                      <h4 className="text-xl font-serif font-bold text-maroon mb-2">Login Required</h4>
                      <p className="text-gray-500 text-sm mb-8">
                        To provide you with a personalized experience and loyalty points, please sign in before booking your appointment.
                      </p>
                      <Button 
                        onClick={handleLogin} 
                        className="w-full bg-maroon hover:bg-maroon/90 text-white font-bold h-12 shadow-lg"
                      >
                        Sign in with Google
                      </Button>
                    </motion.div>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${!currentUser ? 'opacity-20 pointer-events-none' : ''}`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-maroon font-medium">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="name" {...register('name')} className="pl-10 border-maroon/20 focus:border-maroon" placeholder="Jane Doe" />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-maroon font-medium">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="phone" {...register('phone')} className="pl-10 border-maroon/20 focus:border-maroon" placeholder="+91 XXXXX XXXXX" />
                      </div>
                      {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="service" className="text-maroon font-medium">Service</Label>
                    </div>
                    
                    <Select 
                      value={watchServiceId || ""} 
                      onValueChange={(val) => setValue('serviceId', val, { shouldValidate: true })}
                    >
                      <SelectTrigger className="w-full border-maroon/20 focus:border-maroon h-12 bg-white text-maroon">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-maroon/10 shadow-xl z-50">
                        {services.length > 0 ? (
                          services.map((s) => (
                            <SelectItem 
                              key={s.id || s.name} 
                              value={s.id || s.name}
                              className="focus:bg-soft-pink focus:text-maroon"
                            >
                              {s.name}{s.price ? ` — ${s.price}` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-3 text-sm text-gray-500 text-center italic">
                            No services found.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.serviceId && <p className="text-red-500 text-xs mt-1">{errors.serviceId.message}</p>}
                  </div>

                  {userProfile && userProfile.loyaltyPoints > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-gold/5 border border-gold/20 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm font-bold text-maroon">
                          <Coins className="w-4 h-4 mr-2 text-gold fill-current" />
                          Rewards Balance: {userProfile.loyaltyPoints} Points
                        </div>
                        {selectedService && (parseInt(selectedService.price.replace(/[^0-9]/g, '')) || 0) >= 500 ? (
                          <button
                            type="button"
                            onClick={() => setRedeemPoints(!redeemPoints)}
                            className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                              redeemPoints 
                                ? 'bg-maroon text-white shadow-md' 
                                : 'bg-gold/20 text-maroon border border-maroon/20 hover:bg-gold/30'
                            }`}
                          >
                            {redeemPoints ? '✓ Redeeming' : 'Redeem for ₹' + userProfile.loyaltyPoints + ' off'}
                          </button>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-maroon/20 text-maroon/50 bg-white">
                            Min. ₹500 needed
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 italic">
                        {selectedService && (parseInt(selectedService.price.replace(/[^0-9]/g, '')) || 0) < 500
                          ? "Note: Points can only be redeemed on services worth ₹500 or more."
                          : redeemPoints 
                            ? "Great choice! These points will be applied as a discount on your final bill." 
                            : "You have points available! Use them to get a direct discount on this booking."}
                      </p>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-maroon font-medium">Preferred Date</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="date" type="date" {...register('date')} className="pl-10 border-maroon/20 focus:border-maroon" />
                      </div>
                      {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-maroon font-medium">Preferred Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="time" type="time" {...register('time')} className="pl-10 border-maroon/20 focus:border-maroon" />
                      </div>
                      {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-maroon font-medium">Special Requests (Optional)</Label>
                    <Textarea id="notes" {...register('notes')} className="border-maroon/20 focus:border-maroon" placeholder="Tell us more about your requirements..." />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-maroon hover:bg-maroon/90 text-white font-bold h-12">
                      {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                    </Button>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 font-medium">OR</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-bold h-12"
                      asChild
                    >
                      <a 
                        href="https://api.whatsapp.com/send?phone=919650349357&text=Hi%20Komal,%20I'd%20like%20to%20know%20more%20about%20your%20bridal/party%20makeup%20packages." 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        Quick Chat on WhatsApp
                      </a>
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
