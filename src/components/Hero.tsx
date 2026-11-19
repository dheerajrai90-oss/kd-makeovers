import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ArrowRight, MessageCircle, Star, MapPin, Clock } from 'lucide-react';
import { useSalon } from '@/src/context/SalonContext';
import { BRAND_IMAGES, VERIFIED_BUSINESS_INFO } from '@/src/data/defaults';
import { buildWhatsAppUrl } from '@/src/lib/bookingUtils';

export default function Hero() {
  const { settings } = useSalon();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || VERIFIED_BUSINESS_INFO.whatsappNumber,
    "Hi Komal, I'm interested in booking a bridal/salon appointment at KD Makeovers!"
  );

  return (
    <section className="relative bg-kd-black overflow-hidden border-b border-kd-rosegold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Editorial Column */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs text-kd-rosegold font-medium tracking-wider uppercase mb-5">
              <span>{settings.tagline || VERIFIED_BUSINESS_INFO.tagline}</span>
              <span aria-hidden="true">·</span>
              <span>Sant Nagar, Delhi</span>
              <span aria-hidden="true">·</span>
              <a
                href={VERIFIED_BUSINESS_INFO.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-kd-pink hover:underline"
              >
                <Star className="w-3.5 h-3.5 fill-kd-rosegold text-kd-rosegold" />
                <span className="tabular-nums">4.9 Google Rated (200+)</span>
              </a>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-5">
              Bespoke Indian Bridal Artistry &amp;{' '}
              <span className="text-kd-pink italic font-semibold">Luxury Salon</span> Care
            </h1>

            <p className="text-base sm:text-lg text-kd-muted max-w-xl leading-relaxed mb-8">
              Signature HD &amp; airbrush bridal makeovers, engagement glamour, hairstyling, nail art, and curated cosmetics led by Komal Kumari.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 mb-8">
              <Link
                to="/book"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-base transition-colors whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-kd-rosegold/50 bg-kd-surface text-white hover:border-kd-pink hover:text-kd-pink font-semibold text-base transition-colors whitespace-nowrap"
              >
                Explore Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-kd-rosegold/20 text-xs text-kd-muted">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-kd-rosegold" />
                {VERIFIED_BUSINESS_INFO.hoursSummary}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-kd-rosegold" />
                41ft Road Kamal Vihar, Burari
              </span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-kd-pink hover:underline font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp Studio
              </a>
            </div>
          </motion.div>

          {/* Right Editorial Photography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-kd-rosegold/35 bg-kd-surface min-h-[340px] lg:min-h-[480px]"
          >
            <img
              src={BRAND_IMAGES.heroBridal}
              alt="KD Makeovers Bridal Makeup Studio Look"
              className="w-full h-full object-cover object-top"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-kd-black via-kd-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-kd-rosegold font-semibold">
                  Lead Makeup Artist
                </p>
                <p className="font-serif text-2xl font-semibold text-white">Komal Kumari</p>
              </div>
              <Link
                to="/packages"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-kd-pink hover:text-white bg-kd-black/80 backdrop-blur-sm border border-kd-rosegold/40 px-4 py-2 rounded-xl w-fit transition-colors"
              >
                View Bridal Packages
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
