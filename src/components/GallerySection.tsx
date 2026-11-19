import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Maximize2, X, ChevronLeft, ChevronRight, ArrowRight, Camera } from 'lucide-react';
import { useSalon } from '@/src/context/SalonContext';
import { GALLERY_CATEGORIES } from '@/src/data/defaults';

interface GallerySectionProps {
  compactHomeMode?: boolean;
}

export default function GallerySection({ compactHomeMode = false }: GallerySectionProps) {
  const { gallery } = useSalon();
  const [filter, setFilter] = useState<string>('All');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const categories = ['All', ...GALLERY_CATEGORIES];
  const filteredItems =
    filter === 'All' ? gallery : gallery.filter((item) => item.category === filter);
  const displayedItems = compactHomeMode ? filteredItems.slice(0, 4) : filteredItems;

  const currentItem = lightboxIdx !== null ? displayedItems[lightboxIdx] : null;

  const showPrev = () => {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx - 1 + displayedItems.length) % displayedItems.length);
  };

  const showNext = () => {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx + 1) % displayedItems.length);
  };

  return (
    <section id="gallery" className="py-16 lg:py-24 bg-kd-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-kd-rosegold font-semibold mb-2">
              {compactHomeMode ? 'Latest Makeup Transformations' : 'Portfolio Showcase'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Makeup &amp; Styling Gallery
            </h2>
          </div>
          {compactHomeMode && (
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 text-sm font-semibold text-kd-pink hover:text-white transition-colors whitespace-nowrap"
            >
              View Full Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {!compactHomeMode && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setFilter(cat);
                  setLightboxIdx(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                  filter === cat
                    ? 'bg-kd-pink text-kd-black border-kd-pink'
                    : 'bg-kd-surface text-kd-muted border-kd-rosegold/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {displayedItems.length === 0 ? (
          <div className="bg-kd-surface border border-kd-rosegold/20 rounded-2xl p-12 text-center">
            <Camera className="w-8 h-8 text-kd-rosegold mx-auto mb-3" />
            <p className="font-serif text-xl text-kd-pink mb-1">No Looks in This Category Yet</p>
            <p className="text-sm text-kd-muted">Switch category filters or check back soon for new portfolio updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayedItems.map((item, idx) => (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => setLightboxIdx(idx)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-kd-surface border border-kd-rosegold/25 text-left focus:outline-none focus:ring-2 focus:ring-kd-pink"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-kd-black via-kd-black/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-kd-black/70 border border-kd-rosegold/40 flex items-center justify-center text-kd-pink opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-[11px] text-kd-rosegold font-medium mb-1">
                    {item.category} · {item.isActualClientWork ? 'Client Look' : 'Studio Inspiration'}
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-white leading-snug">
                    {item.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Viewer */}
      {currentItem && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            aria-label="Close image viewer"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-kd-surface border border-kd-rosegold/40 text-white hover:text-kd-pink flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>

          {displayedItems.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label="Previous image"
                className="absolute left-4 sm:left-8 w-11 h-11 rounded-full bg-kd-surface border border-kd-rosegold/40 text-white hover:text-kd-pink flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Next image"
                className="absolute right-4 sm:right-8 w-11 h-11 rounded-full bg-kd-surface border border-kd-rosegold/40 text-white hover:text-kd-pink flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="max-w-3xl w-full flex flex-col items-center">
            <img
              src={currentItem.url}
              alt={currentItem.title}
              className="max-h-[75vh] w-auto rounded-2xl border border-kd-rosegold/35 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="mt-4 text-center">
              <div className="text-xs text-kd-rosegold uppercase tracking-wider mb-1">
                {currentItem.category} · {currentItem.isActualClientWork ? 'Verified Client Work' : 'Studio Editorial Inspiration'}
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white">{currentItem.title}</h3>
              {currentItem.caption && (
                <p className="text-sm text-kd-muted mt-1">{currentItem.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
