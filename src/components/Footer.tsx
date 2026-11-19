import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useSalon } from '@/src/context/SalonContext';
import { VERIFIED_BUSINESS_INFO } from '@/src/data/defaults';
import { buildWhatsAppUrl } from '@/src/lib/bookingUtils';
import { KDLogo } from './KDLogo';
import { PWAInstallButton } from './PWAInstallButton';

export default function Footer() {
  const { settings } = useSalon();
  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappNumber || VERIFIED_BUSINESS_INFO.whatsappNumber,
    'Hello Komal, I would like to enquire about makeup and salon services at KD Makeovers.'
  );

  return (
    <>
      <footer className="bg-kd-surface border-t border-kd-rosegold/25 text-white pt-16 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-kd-rosegold/20">
            {/* Brand & App Install */}
            <div className="lg:col-span-2 space-y-5">
              <KDLogo
                logoUrl={settings.logoUrl}
                businessName={settings.businessName}
                tagline={settings.tagline}
                size="md"
                showTagline={true}
              />
              <p className="text-sm text-kd-muted max-w-md leading-relaxed">
                Bridal makeup studio, luxury salon care, and curated cosmetics led by Komal Kumari in Sant Nagar, Delhi. Crafting radiant, camera-ready looks for weddings and everyday confidence.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <PWAInstallButton variant="footer" />
                <a
                  href={settings.instagramUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-xl border border-kd-rosegold/30 bg-kd-black flex items-center justify-center text-kd-pink hover:bg-kd-pink hover:text-kd-black transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={settings.facebookUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-xl border border-kd-rosegold/30 bg-kd-black flex items-center justify-center text-kd-pink hover:bg-kd-pink hover:text-kd-black transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-xl border border-kd-rosegold/30 bg-kd-black flex items-center justify-center text-kd-pink hover:bg-kd-pink hover:text-kd-black transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Explore Links */}
            <div>
              <h3 className="font-serif text-xl font-semibold text-kd-pink mb-4">Explore</h3>
              <ul className="space-y-2.5 text-sm text-kd-muted">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Services Catalogue</Link></li>
                <li><Link to="/packages" className="hover:text-white transition-colors">Bridal Packages</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition-colors">Makeup Gallery</Link></li>
                <li><Link to="/offers" className="hover:text-white transition-colors">Offers & Deals</Link></li>
                <li><Link to="/book" className="hover:text-white transition-colors">Book Appointment</Link></li>
                <li><Link to="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
              </ul>
            </div>

            {/* Verified Contact */}
            <div>
              <h3 className="font-serif text-xl font-semibold text-kd-pink mb-4">Visit Studio</h3>
              <ul className="space-y-3 text-sm text-kd-muted">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-kd-rosegold shrink-0 mt-1" />
                  <a
                    href={VERIFIED_BUSINESS_INFO.mapDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors leading-relaxed"
                  >
                    {settings.address || VERIFIED_BUSINESS_INFO.fullAddress}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-kd-rosegold shrink-0" />
                  <a href={`tel:${settings.phone || VERIFIED_BUSINESS_INFO.phoneRaw}`} className="hover:text-white transition-colors tabular-nums">
                    {settings.phone || VERIFIED_BUSINESS_INFO.phoneDisplay}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-kd-rosegold shrink-0" />
                  <a href={`mailto:${settings.email || VERIFIED_BUSINESS_INFO.email}`} className="hover:text-white transition-colors">
                    {settings.email || VERIFIED_BUSINESS_INFO.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-kd-rosegold shrink-0" />
                  <span>{VERIFIED_BUSINESS_INFO.hoursSummary}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-kd-muted">
            <p>© {new Date().getFullYear()} {settings.businessName || VERIFIED_BUSINESS_INFO.name}. All rights reserved.</p>
            <p>Sant Nagar, Burari, Delhi-110084 · Lead Artist: Komal Kumari</p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp & Phone Call Actions */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[85] flex flex-col gap-2.5">
        <a
          href={`tel:${settings.phone || VERIFIED_BUSINESS_INFO.phoneRaw}`}
          aria-label="Call KD Makeovers"
          className="w-12 h-12 rounded-full bg-kd-surface border border-kd-rosegold/60 text-kd-pink hover:bg-kd-pink hover:text-kd-black shadow-xl flex items-center justify-center transition-colors"
          title="Call Studio"
        >
          <Phone className="w-5 h-5" />
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="w-12 h-12 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-xl flex items-center justify-center transition-colors ring-2 ring-kd-black"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
        </a>
      </div>
    </>
  );
}
