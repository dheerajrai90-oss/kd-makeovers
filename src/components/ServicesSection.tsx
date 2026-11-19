import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Heart, ArrowRight, Calendar } from 'lucide-react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '@/src/firebase';
import { useSalon } from '@/src/context/SalonContext';
import { ALL_SERVICE_CATEGORIES, DEFAULT_ACADEMY_COURSES } from '@/src/data/defaults';
import { generateAvailableSlotsForDate } from '@/src/lib/bookingUtils';

interface ServicesSectionProps {
  compactHomeMode?: boolean;
}

export default function ServicesSection({ compactHomeMode = false }: ServicesSectionProps) {
  const { services, user, userProfile, settings, bookedSlotKeys } = useSalon();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const activeServices = useMemo(
    () => services.filter((s) => s.active !== false),
    [services]
  );

  const availableCategories = useMemo(() => {
    const dynamicCats = new Set<string>(activeServices.map((s) => s.category));
    const ordered = ALL_SERVICE_CATEGORIES.filter((c) => dynamicCats.has(c));
    const extras = Array.from(dynamicCats).filter(
      (c) => !(ALL_SERVICE_CATEGORIES as readonly string[]).includes(c)
    );
    return ['All', ...ordered, ...extras];
  }, [activeServices]);

  const filteredServices = useMemo(() => {
    const base = compactHomeMode
      ? activeServices.filter((s) => s.featured).slice(0, 6)
      : activeServices;

    return base.filter((srv) => {
      const catMatch = selectedCategory === 'All' || srv.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const textMatch =
        !q ||
        srv.name.toLowerCase().includes(q) ||
        srv.description.toLowerCase().includes(q) ||
        srv.category.toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [activeServices, compactHomeMode, selectedCategory, searchQuery]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const favoriteIds = userProfile?.favoriteServiceIds || [];

  const toggleFavorite = async (serviceId?: string) => {
    if (!serviceId) return;
    if (!user) {
      toast.info('Sign in to save favourite services to your profile.');
      return;
    }
    const exists = favoriteIds.includes(serviceId);
    const updated = exists
      ? favoriteIds.filter((id) => id !== serviceId)
      : [...favoriteIds, serviceId];
    try {
      await updateDoc(doc(db, 'userProfiles', user.uid), {
        favoriteServiceIds: updated,
        updatedAt: serverTimestamp(),
      });
      toast.success(exists ? 'Removed from favourites' : 'Saved to your favourites');
    } catch (err) {
      console.error('Favourite update failed:', err);
      toast.error('Could not update favourites.');
    }
  };

  return (
    <section id="services" className="py-16 lg:py-24 bg-kd-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-kd-rosegold font-semibold mb-2">
              {compactHomeMode ? 'Popular Services' : 'Complete Service Menu'}
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              {compactHomeMode ? 'Signature Studio Treatments' : 'Salon &amp; Makeup Services'}
            </h2>
          </div>
          {compactHomeMode ? (
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-kd-pink hover:text-white transition-colors whitespace-nowrap"
            >
              Browse All {activeServices.length} Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-kd-rosegold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search makeup, hair, facial..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-kd-surface border border-kd-rosegold/30 text-sm text-white placeholder:text-kd-muted focus:outline-none focus:border-kd-pink"
              />
            </div>
          )}
        </div>

        {/* Category Filter Tabs */}
        {!compactHomeMode && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-kd-pink text-kd-black border-kd-pink'
                    : 'bg-kd-surface text-kd-muted border-kd-rosegold/20 hover:text-white hover:border-kd-rosegold/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Service Cards Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-kd-surface border border-kd-rosegold/20 rounded-2xl p-12 text-center">
            <p className="font-serif text-2xl text-kd-pink mb-2">No Matching Services</p>
            <p className="text-sm text-kd-muted mb-5">Try another category or clear your search filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const isFav = service.id ? favoriteIds.includes(service.id) : false;
              const todaySlots = generateAvailableSlotsForDate(
                todayStr,
                service.durationMinutes || 60,
                settings,
                bookedSlotKeys
              ).filter((s) => s.available);

              return (
                <article
                  key={service.id || service.name}
                  className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-kd-pink/60 transition-colors"
                >
                  <div>
                    <div className="aspect-[4/3] bg-kd-black relative overflow-hidden">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-kd-surface to-kd-black flex items-center justify-center p-6 text-center">
                          <span className="font-serif text-xl text-kd-pink">{service.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(service.id)}
                        aria-label={isFav ? 'Remove from favourites' : 'Save to favourites'}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-kd-black/75 backdrop-blur-sm border border-kd-rosegold/40 flex items-center justify-center text-kd-pink hover:bg-kd-pink hover:text-kd-black transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-kd-rosegold mb-1.5">
                        <span>{service.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3" />
                          {service.durationMinutes || 60} mins
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-semibold text-white mb-2">
                        {service.name}
                      </h3>

                      <p className="text-sm text-kd-muted leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-4 border-t border-kd-rosegold/15 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold text-kd-pink tabular-nums">
                        {service.price || 'On Consultation'}
                      </div>
                      <div className="text-[11px] text-kd-muted tabular-nums">
                        {todaySlots.length > 0
                          ? `${todaySlots.length} slots open today`
                          : 'Next-day slots available'}
                      </div>
                    </div>
                    <Link
                      to={`/book?service=${encodeURIComponent(service.id || service.name)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-xs whitespace-nowrap transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book Now
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Academy Section (Preserved from existing website on full Services page) */}
        {!compactHomeMode && (
          <div className="mt-20 pt-16 border-t border-kd-rosegold/20">
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.22em] text-kd-rosegold font-semibold mb-2">
                KD Makeovers Academy
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
                Professional Training &amp; Courses
              </h2>
              <p className="text-sm text-kd-muted max-w-2xl">
                Certified hands-on beauty &amp; makeup courses led by Komal Kumari.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEFAULT_ACADEMY_COURSES.map((course) => (
                <div
                  key={course.id}
                  className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] bg-kd-black overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-5">
                      <div className="text-xs text-kd-rosegold font-medium mb-1">
                        Duration: {course.duration}
                      </div>
                      <h3 className="font-serif text-2xl font-semibold text-white mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-kd-muted leading-relaxed">{course.desc}</p>
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <Link
                      to={`/book?course=${encodeURIComponent(course.id)}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-kd-rosegold/40 text-kd-pink hover:bg-kd-pink hover:text-kd-black text-sm font-semibold transition-colors"
                    >
                      Enquire / Book Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
