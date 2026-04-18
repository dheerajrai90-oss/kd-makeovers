import React, { useState, useEffect } from 'react';
import { db, auth } from '@/src/firebase';
import { collection, onSnapshot, query, where, orderBy, doc } from 'firebase/firestore';
import { Appointment, UserProfile } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Sparkles, Coins, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function UserAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubAppointments = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });

    const unsubProfile = onSnapshot(doc(db, 'userProfiles', auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    });

    return () => {
      unsubAppointments();
      unsubProfile();
    };
  }, []);

  if (!auth.currentUser) return null;

  return (
    <section id="my-bookings" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-maroon mb-4">My Dashboard</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your beauty journey and loyalty rewards.
          </p>
        </div>

        {profile && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            <Card className="bg-maroon text-white border-none shadow-lg overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              <CardHeader className="pb-2">
                <CardTitle className="text-soft-pink/60 text-sm font-sans uppercase tracking-widest flex items-center">
                  <Coins className="w-4 h-4 mr-2" />
                  Loyalty Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-serif font-bold text-gold drop-shadow-sm">
                  {profile.loyaltyPoints.toLocaleString()}
                </div>
                <p className="text-xs text-soft-pink/40 mt-2 font-light">
                  1 Point = ₹1 Discount on your next visit
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-maroon/10 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-gray-400 text-sm font-sans uppercase tracking-widest flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-gold" />
                  Total Value Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-serif font-bold text-maroon">
                  ₹{profile.totalSpent.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-2 font-light">
                  Elevating your beauty journey with every visit.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gold/10 border-gold/20 shadow-sm md:col-span-2 lg:col-span-1 border-dashed border-2 flex items-center justify-center p-6 text-center">
              <div>
                <Sparkles className="w-8 h-8 text-gold mx-auto mb-3" />
                <h4 className="text-maroon font-serif font-bold mb-1 italic">VVIP Status Awaits</h4>
                <p className="text-[10px] text-gray-600">Complete 5 more sessions to unlock Platinum Rewards.</p>
              </div>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon"></div>
          </div>
        ) : appointments.length === 0 ? (
          <Card className="max-w-md mx-auto border-maroon/10 text-center p-12">
            <div className="w-16 h-16 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-8 h-8 text-maroon/40" />
            </div>
            <h3 className="text-xl font-serif font-bold text-maroon mb-2">No Appointments Yet</h3>
            <p className="text-gray-500 mb-8 font-light">
              You haven't booked any sessions yet. Ready for your makeover?
            </p>
            <a 
              href="#appointment" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gold text-maroon font-bold rounded-md hover:bg-gold/90 transition-colors"
            >
              Book Now
            </a>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {appointments.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-maroon/10 hover:border-gold/50 transition-all hover:shadow-xl">
                  <CardHeader className="bg-soft-pink/30 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={
                        app.status === 'confirmed' ? 'bg-green-500' :
                        app.status === 'rejected' ? 'bg-red-500' :
                        app.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500 text-maroon'
                      }>
                        {app.status.toUpperCase()}
                      </Badge>
                      <Sparkles className="w-5 h-5 text-gold" />
                    </div>
                    <CardTitle className="text-xl font-serif text-maroon">{app.service}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-3 text-gold" />
                        <span className="text-sm font-medium">{app.date}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-3 text-gold" />
                        <span className="text-sm font-medium">{app.time}</span>
                      </div>
                      <div className="pt-4 border-t border-maroon/5">
                        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Booking ID</p>
                        <p className="text-sm font-mono text-maroon/60 truncate">{app.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
