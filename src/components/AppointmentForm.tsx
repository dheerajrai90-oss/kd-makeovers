import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, User, Phone, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const appointmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
  service: z.string().min(1, 'Please select a service'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      status: 'pending'
    } as any
  });

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'appointments'), {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success('Appointment booked successfully! We will contact you soon.');
      reset();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              
              <div className="md:col-span-3 p-8 bg-white">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    <Label htmlFor="service" className="text-maroon font-medium">Service</Label>
                    <Select onValueChange={(value: string) => setValue('service', value)}>
                      <SelectTrigger className="border-maroon/20 focus:border-maroon">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bridal Makeup">Bridal Makeup</SelectItem>
                        <SelectItem value="Party Makeup">Party Makeup</SelectItem>
                        <SelectItem value="Engagement Makeup">Engagement Makeup</SelectItem>
                        <SelectItem value="Hair Styling">Hair Styling</SelectItem>
                        <SelectItem value="Other">Other Services</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.service && <p className="text-red-500 text-xs">{errors.service.message}</p>}
                  </div>

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

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-maroon hover:bg-maroon/90 text-white font-bold h-12">
                    {isSubmitting ? 'Booking...' : 'Confirm Appointment'}
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
