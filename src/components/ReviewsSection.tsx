import React, { useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Star, Send, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/src/firebase';
import { useSalon } from '@/src/context/SalonContext';
import { VERIFIED_BUSINESS_INFO } from '@/src/data/defaults';

export default function ReviewsSection() {
  const { reviews, user } = useSalon();
  const [name, setName] = useState(user?.displayName || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = (name || user?.displayName || '').trim();
    const cleanComment = comment.trim();
    if (cleanName.length < 2 || cleanComment.length < 3) {
      toast.error('Please enter your name and review feedback.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewRef = doc(collection(db, 'reviews'));
      await setDoc(reviewRef, {
        name: cleanName.slice(0, 100),
        userId: user?.uid || null,
        appointmentId: null,
        rating,
        comment: cleanComment.slice(0, 1000),
        photoUrl: null,
        approved: false,
        createdAt: serverTimestamp(),
      });

      // Notify admin of new review pending moderation
      await addDoc(collection(db, 'notifications'), {
        recipientRole: 'admin',
        recipientUid: 'admin',
        type: 'new_review',
        title: 'New Client Review Submitted',
        message: `${cleanName} left a ${rating}-star review awaiting approval.`,
        relatedId: reviewRef.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Thank you! Your review has been submitted for approval.');
      setComment('');
      if (!user) setName('');
    } catch (err) {
      console.error('Review submission failed:', err);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-16 lg:py-24 bg-kd-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-kd-rosegold font-semibold mb-2">
              4.9 ★ Rated on Google
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Client Experiences
            </h2>
          </div>
          <a
            href={VERIFIED_BUSINESS_INFO.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-kd-rosegold/40 text-xs font-semibold text-kd-pink hover:bg-kd-pink hover:text-kd-black transition-colors w-fit"
          >
            <span>View 200+ Google Reviews</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Approved Reviews List */}
          <div className="lg:col-span-7 grid grid-cols-1 gap-5">
            {reviews.map((rev, idx) => (
              <article
                key={rev.id || idx}
                className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= rev.rating ? 'text-kd-rosegold fill-kd-rosegold' : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-base text-kd-blush italic leading-relaxed mb-4">
                  &ldquo;{rev.comment}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-kd-rosegold/15">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-kd-black border border-kd-rosegold/50 flex items-center justify-center font-serif font-bold text-kd-pink">
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{rev.name}</div>
                      <div className="text-[11px] text-kd-muted">Verified Studio Client</div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Submit Review Form */}
          <div className="lg:col-span-5 bg-kd-surface border border-kd-rosegold/30 rounded-2xl p-6 sm:p-7">
            <h3 className="font-serif text-2xl font-bold text-white mb-1">Share Your Feedback</h3>
            <p className="text-sm text-kd-muted mb-6">
              Reviews are published after verification by our studio team.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="review-name" className="block text-xs font-medium text-kd-pink mb-1.5">
                  Your Name
                </label>
                <input
                  id="review-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white placeholder:text-kd-muted/60 focus:outline-none focus:border-kd-pink"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-kd-pink mb-1.5">Rating</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Rate ${star} stars`}
                      className="p-1.5 rounded-lg hover:bg-white/5"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= rating ? 'text-kd-rosegold fill-kd-rosegold' : 'text-white/20'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-xs font-medium text-kd-pink mb-1.5">
                  Your Experience
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required
                  maxLength={1000}
                  placeholder="Tell us about your makeover or salon visit..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white placeholder:text-kd-muted/60 focus:outline-none focus:border-kd-pink"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
