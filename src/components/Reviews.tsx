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
    name: 'Ritu Varma',
    rating: 5,
    comment: 'Komal ma\'am is truly the best! She did my bridal makeup and I looked like a dream. Every detail was perfect. The studio in Sant Nagar is very professional.',
    approved: true,
    createdAt: new Date()
  },
  {
    name: 'Suman Rawat',
    rating: 5,
    comment: 'Professional staff and excellent services. Best bridal studio in Burari/Sant Nagar area. Their cosmetics are also of very high quality.',
    approved: true,
    createdAt: new Date()
  },
  {
    name: 'Meenakshi Singh',
    rating: 5,
    comment: 'Highly recommended for party makeup. Very natural finish and lasted the whole night. Thank you KD Makeovers!',
    approved: true,
    createdAt: new Date()
  }
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleReviewsUrl = "https://www.google.com/search?q=kd+makeovers+%26+cosmetics#lrd=0x390cff595fb9fcdd:0xbc93f994fe8c0caa,1,,,,";

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
    <section id="reviews" className="py-24 bg-soft-pink/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-bold uppercase tracking-wider mb-4">
              <Star className="w-3 h-3 fill-gold" />
              Top Rated on Google
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-maroon">Client Experiences</h2>
            <div className="w-24 h-1 bg-gold mt-4" />
          </div>
          <Button variant="outline" className="border-maroon/20 text-maroon hover:bg-maroon hover:text-white font-bold rounded-full transition-all group" asChild>
            <a href={googleReviewsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              View all 200+ Google Reviews
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Testimonials List */}
          <div>
            <div className="space-y-8">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id || index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-xl bg-white relative group hover:scale-[1.02] transition-all duration-300">
                    <Quote className="absolute top-4 right-4 w-12 h-12 text-soft-pink/50 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <CardContent className="pt-8 relative z-10">
                      <div className="flex mb-4 gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-gold fill-gold' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 italic mb-8 leading-relaxed text-lg">"{review.comment}"</p>
                      <div className="flex items-center justify-between border-t border-maroon/5 pt-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-maroon to-maroon/80 text-white flex items-center justify-center font-bold mr-4 text-xl shadow-md">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-maroon">{review.name}</h4>
                            <p className="text-xs text-gold font-medium uppercase tracking-tighter">Verified Google User</p>
                          </div>
                        </div>
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-30 grayscale group-hover:grayscale-0 transition-all" />
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
