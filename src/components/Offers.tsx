import React, { useState, useEffect } from 'react';
import { db } from '@/src/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { Offer } from '@/src/types';
import { motion } from 'motion/react';
import { Tag, Calendar, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'offers'),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer)));
    });
    return () => unsubscribe();
  }, []);

  if (offers.length === 0) return null;

  return (
    <section id="offers" className="py-24 bg-soft-pink/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-maroon mb-4">Special Offers</h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't miss out on our exclusive deals and bridal packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-2 border-gold/20 hover:border-gold/50 transition-all shadow-lg group">
                <div className="absolute top-0 right-0 p-4">
                  <Gift className="w-8 h-8 text-gold/20 group-hover:text-gold/40 transition-colors" />
                </div>
                <CardContent className="pt-8">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-maroon text-white text-xs font-bold mb-4">
                    <Tag className="w-3 h-3 mr-1" />
                    LIMITED TIME
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-maroon mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    {offer.description}
                  </p>
                  
                  <div className="space-y-3">
                    {offer.code && (
                      <div className="flex items-center justify-between p-3 bg-white border border-dashed border-gold rounded-lg">
                        <span className="text-xs font-medium text-gray-500 uppercase">Use Code</span>
                        <span className="text-lg font-mono font-bold text-maroon">{offer.code}</span>
                      </div>
                    )}
                    
                    {offer.expiryDate && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Expires on: {offer.expiryDate}
                      </div>
                    )}
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
