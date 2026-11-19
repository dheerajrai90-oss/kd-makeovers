import { MapPin, Clock, Phone, Mail, Navigation, MessageCircle } from 'lucide-react';
import { useSalon } from '@/src/context/SalonContext';
import { VERIFIED_BUSINESS_INFO } from '@/src/data/defaults';
import { buildWhatsAppUrl } from '@/src/lib/bookingUtils';

export default function LocationSection() {
  const { settings } = useSalon();
  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappNumber || VERIFIED_BUSINESS_INFO.whatsappNumber,
    'Hi Komal, I need directions or assistance reaching KD Makeovers Studio.'
  );

  return (
    <section id="contact" className="py-16 lg:py-24 bg-kd-surface border-t border-kd-rosegold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.22em] text-kd-rosegold font-semibold mb-2">
            Sant Nagar · Burari · North Delhi
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Visit KD Makeovers Studio
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 bg-kd-black border border-kd-rosegold/30 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-kd-surface border border-kd-rosegold/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-kd-pink" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-white mb-1">Studio Address</h3>
                  <p className="text-sm text-kd-muted leading-relaxed">
                    {settings.address || VERIFIED_BUSINESS_INFO.fullAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-kd-surface border border-kd-rosegold/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-kd-pink" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-white mb-1">Studio Timings</h3>
                  <p className="text-sm text-kd-muted">
                    {settings.workingDays?.join(', ') || 'Mon - Sun'}: {settings.openingTime || '10:00'} –{' '}
                    {settings.closingTime || '20:30'}
                  </p>
                  <p className="text-xs text-kd-rosegold mt-1">
                    Early bridal slots available by prior reservation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-kd-surface border border-kd-rosegold/30 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-kd-pink" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-white mb-1">Phone &amp; Email</h3>
                  <a
                    href={`tel:${settings.phone || VERIFIED_BUSINESS_INFO.phoneRaw}`}
                    className="block text-sm text-kd-pink hover:underline tabular-nums"
                  >
                    {settings.phone || VERIFIED_BUSINESS_INFO.phoneDisplay}
                  </a>
                  <a
                    href={`mailto:${settings.email || VERIFIED_BUSINESS_INFO.email}`}
                    className="inline-flex items-center gap-1.5 text-sm text-kd-muted hover:text-white mt-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {settings.email || VERIFIED_BUSINESS_INFO.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-kd-rosegold/20">
              <a
                href={VERIFIED_BUSINESS_INFO.mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-sm transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-kd-rosegold/40 text-white hover:border-kd-pink hover:text-kd-pink font-semibold text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-kd-rosegold/30 bg-kd-black min-h-[340px]">
            <iframe
              title="KD Makeovers & Cosmetics Studio Map"
              src={VERIFIED_BUSINESS_INFO.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '360px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
