import React, { useState, useEffect } from 'react';
import { db } from '@/src/firebase';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Review } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Quote, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const DEFAULT_REVIEWS: Review[] = [
  {
    name: 'Priya Sharma',
    rating: 5,
    comment: 'Komal did an amazing job for my wedding! The makeup was flawless and lasted all day. Highly recommend!',
    approved: true,
    createdAt: new Date()
  },
  {
    name: 'Anjali Gupta',
    rating: 5,
    comment: 'Best bridal studio in Delhi. Very professional and friendly staff. Loved my engagement look.',
    approved: true,
    createdAt: new Date()
  }
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(reviewsData.length > 0 ? reviewsData : DEFAULT_REVIEWS);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...newReview,
        approved: false,
        createdAt: serverTimestamp(),
      });
      toast.success('Review submitted! It will be visible after approval.');
      setNewReview({ name: '', rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-24 bg-soft-pink/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Testimonials List */}
          <div>
            <h2 className="text-4xl font-serif font-bold text-maroon mb-4">What Our Clients Say</h2>
            <div className="w-24 h-1 bg-gold mb-12" />
            
            <div className="space-y-8">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-lg bg-white relative overflow-hidden">
                    <Quote className="absolute top-4 right-4 w-12 h-12 text-soft-pink/50 -z-0" />
                    <CardContent className="pt-8 relative z-10">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-gold fill-gold' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 italic mb-6 leading-relaxed">"{review.comment}"</p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-maroon text-white flex items-center justify-center font-bold mr-3">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-maroon">{review.name}</h4>
                          <p className="text-xs text-gray-500">Verified Client</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Review Form */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-maroon/5">
            <h3 className="text-2xl font-serif font-bold text-maroon mb-2">Leave a Review</h3>
            <p className="text-gray-600 mb-8">Share your experience with us.</p>
            
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rev-name">Your Name</Label>
                <Input
                  id="rev-name"
                  value={newReview.name}
                  onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="Enter your name"
                  className="border-maroon/20 focus:border-maroon"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= newReview.rating ? 'text-gold fill-gold' : 'text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rev-comment">Your Feedback</Label>
                <Textarea
                  id="rev-comment"
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Tell us what you loved..."
                  className="border-maroon/20 focus:border-maroon h-32"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-maroon hover:bg-maroon/90 text-white font-bold h-12"
              >
                {isSubmitting ? 'Submitting...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
