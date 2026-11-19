import { Link } from 'react-router-dom';
import { Copy, Calendar, Tag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useSalon } from '@/src/context/SalonContext';

interface OffersSectionProps {
  compactHomeMode?: boolean;
}

export default function OffersSection({ compactHomeMode = false }: OffersSectionProps) {
  const { offers } = useSalon();
  const visibleOffers = compactHomeMode ? offers.slice(0, 3) : offers;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied`);
  };

  if (visibleOffers.length === 0) return null;

  return (
    <section id="offers" className="py-16 lg:py-24 bg-kd-surface border-y border-kd-rosegold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-kd-rosegold font-semibold mb-2">
              Exclusive Studio Promotions
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Special Offers &amp; Deals
            </h2>
          </div>
          {compactHomeMode && offers.length > 3 && (
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 text-sm font-semibold text-kd-pink hover:text-white transition-colors"
            >
              View All Offers
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleOffers.map((offer) => (
            <article
              key={offer.id || offer.title}
              className="bg-kd-black border border-kd-rosegold/35 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-kd-rosegold font-medium mb-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {offer.offerType || 'Special Offer'}
                  </span>
                  {offer.discountLabel && (
                    <span className="text-kd-pink font-semibold">{offer.discountLabel}</span>
                  )}
                </div>

                <h3 className="font-serif text-2xl font-bold text-white mb-2">{offer.title}</h3>
                <p className="text-sm text-kd-muted leading-relaxed mb-5">{offer.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-kd-rosegold/20">
                {offer.code && (
                  <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-kd-surface border border-dashed border-kd-rosegold/60">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-kd-muted">Promo Code</div>
                      <div className="font-mono text-base font-bold text-kd-pink">{offer.code}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCode(offer.code!)}
                      className="inline-flex items-center gap-1 text-xs text-kd-rosegold hover:text-white px-2.5 py-1.5 rounded-lg border border-kd-rosegold/30"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-kd-muted inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-kd-rosegold" />
                    {offer.expiryDate ? `Valid till ${offer.expiryDate}` : 'Limited-time studio offer'}
                  </span>
                  <Link
                    to="/book"
                    className="text-xs font-semibold text-kd-pink hover:underline whitespace-nowrap"
                  >
                    Claim &amp; Book →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
