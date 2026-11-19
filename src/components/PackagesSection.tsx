import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, MessageCircle, Calendar, ArrowRight } from 'lucide-react';
import { useSalon } from '@/src/context/SalonContext';
import { PackageTier } from '@/src/types';
import { buildWhatsAppUrl } from '@/src/lib/bookingUtils';
import { VERIFIED_BUSINESS_INFO } from '@/src/data/defaults';

interface PackagesSectionProps {
  compactHomeMode?: boolean;
}

const TIERS: ('All' | PackageTier)[] = [
  'All',
  'Bridal',
  'Engagement',
  'Pre-Bridal',
  'Wedding Guest',
  'Custom',
];

export default function PackagesSection({ compactHomeMode = false }: PackagesSectionProps) {
  const { packages, settings } = useSalon();
  const [selectedTier, setSelectedTier] = useState<'All' | PackageTier>('All');

  const visiblePackages = useMemo(() => {
    const active = packages.filter((p) => p.active !== false);
    if (compactHomeMode) return active.slice(0, 3);
    if (selectedTier === 'All') return active;
    return active.filter((p) => p.tier === selectedTier);
  }, [packages, compactHomeMode, selectedTier]);

  return (
    <section id="packages" className="py-16 lg:py-24 bg-kd-surface border-y border-kd-rosegold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-kd-rosegold font-semibold mb-2">
              Bridal &amp; Event Suites
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Curated Bridal Packages
            </h2>
          </div>
          {compactHomeMode && (
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 text-sm font-semibold text-kd-pink hover:text-white transition-colors whitespace-nowrap"
            >
              Explore All Packages
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {!compactHomeMode && (
          <div className="flex flex-wrap gap-2 mb-8">
            {TIERS.map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedTier(tier)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  selectedTier === tier
                    ? 'bg-kd-pink text-kd-black border-kd-pink'
                    : 'bg-kd-black text-kd-muted border-kd-rosegold/25 hover:text-white'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePackages.map((pkg) => {
            const whatsappUrl = buildWhatsAppUrl(
              settings.whatsappNumber || VERIFIED_BUSINESS_INFO.whatsappNumber,
              `Hi Komal, I'd like to enquire about the "${pkg.name}" (${pkg.price}) package.`
            );

            return (
              <article
                key={pkg.id || pkg.name}
                className="bg-kd-black border border-kd-rosegold/30 rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-kd-surface overflow-hidden relative">
                    {pkg.imageUrl ? (
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-6 text-center">
                        <span className="font-serif text-2xl text-kd-pink">{pkg.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 text-xs text-kd-rosegold mb-2">
                      <span>{pkg.tier} Package</span>
                      <span className="tabular-nums">{pkg.durationMinutes || 180} mins</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <div className="text-xl font-bold text-kd-pink tabular-nums mb-3">
                      {pkg.price}
                    </div>
                    <p className="text-sm text-kd-muted leading-relaxed mb-4">{pkg.description}</p>

                    {pkg.specialOffer && (
                      <div className="mb-4 px-3.5 py-2 rounded-xl bg-kd-blush/10 border border-kd-pink/30 text-xs text-kd-pink font-medium">
                        {pkg.specialOffer}
                      </div>
                    )}

                    <ul className="space-y-2 text-sm text-kd-muted">
                      {pkg.includedServices.map((inc, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-kd-rosegold shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-kd-rosegold/20 flex flex-col sm:flex-row gap-2.5">
                  <Link
                    to={`/book?package=${encodeURIComponent(pkg.id || pkg.name)}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-xs transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Book Package
                  </Link>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-kd-rosegold/40 text-white hover:border-kd-pink hover:text-kd-pink font-semibold text-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Enquire
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
