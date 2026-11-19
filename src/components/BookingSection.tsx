import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  Calendar,
  Clock,
  CheckCircle2,
  MessageCircle,
  Search,
  Upload,
  X,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { db, storage } from '@/src/firebase';
import { useSalon } from '@/src/context/SalonContext';
import { DEFAULT_ACADEMY_COURSES, VERIFIED_BUSINESS_INFO } from '@/src/data/defaults';
import {
  buildWhatsAppUrl,
  computeOccupiedSlotKeys,
  createTrackingHash,
  formatTime12h,
  generateAvailableSlotsForDate,
  generateBookingCode,
} from '@/src/lib/bookingUtils';
import { BookingTracker } from '@/src/types';

export default function BookingSection() {
  const { user, userProfile, services, packages, settings, bookedSlotKeys } = useSalon();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'book' | 'track'>('book');
  const [bookingType, setBookingType] = useState<'service' | 'package' | 'course'>('service');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingCode: string;
    service: string;
    date: string;
    time: string;
    name: string;
    phone: string;
  } | null>(null);

  // Track booking state
  const [trackCode, setTrackCode] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackResult, setTrackResult] = useState<BookingTracker | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackNotFound, setTrackNotFound] = useState(false);

  // Pre-fill from query params or user profile
  useEffect(() => {
    const srvParam = searchParams.get('service');
    const pkgParam = searchParams.get('package');
    const courseParam = searchParams.get('course');
    const tabParam = searchParams.get('tab');

    if (tabParam === 'track') {
      setActiveTab('track');
    }
    if (pkgParam) {
      setBookingType('package');
      setSelectedItemId(pkgParam);
    } else if (courseParam) {
      setBookingType('course');
      setSelectedItemId(courseParam);
    } else if (srvParam) {
      setBookingType('service');
      setSelectedItemId(srvParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (userProfile) {
      if (!name && userProfile.displayName) setName(userProfile.displayName);
      if (!phone && userProfile.phone) setPhone(userProfile.phone);
      if (!email && userProfile.email) setEmail(userProfile.email);
    } else if (user) {
      if (!name && user.displayName) setName(user.displayName);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user, userProfile]);

  const activeServices = useMemo(() => services.filter((s) => s.active !== false), [services]);
  const activePackages = useMemo(() => packages.filter((p) => p.active !== false), [packages]);

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    if (bookingType === 'service') {
      return activeServices.find((s) => (s.id || s.name) === selectedItemId) || null;
    }
    if (bookingType === 'package') {
      return activePackages.find((p) => (p.id || p.name) === selectedItemId) || null;
    }
    return DEFAULT_ACADEMY_COURSES.find((c) => c.id === selectedItemId) || null;
  }, [bookingType, selectedItemId, activeServices, activePackages]);

  const selectedDuration = useMemo(() => {
    if (bookingType === 'service' && selectedItem && 'durationMinutes' in selectedItem) {
      return selectedItem.durationMinutes || 60;
    }
    if (bookingType === 'package' && selectedItem && 'durationMinutes' in selectedItem) {
      return selectedItem.durationMinutes || 180;
    }
    return settings.defaultSlotDuration || 60;
  }, [bookingType, selectedItem, settings.defaultSlotDuration]);

  const availableSlots = useMemo(() => {
    if (!date) return [];
    return generateAvailableSlotsForDate(date, selectedDuration, settings, bookedSlotKeys);
  }, [date, selectedDuration, settings, bookedSlotKeys]);

  const isHoliday = useMemo(() => (date ? settings.holidays?.includes(date) : false), [date, settings.holidays]);

  const minDateStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files as FileList | null;
    const files: File[] = fileList ? Array.from(fileList).slice(0, 3) : [];
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024 && f.type.startsWith('image/'));
    if (valid.length !== files.length) {
      toast.error('Only image files under 5MB are allowed (max 3).');
    }
    setReferenceFiles(valid);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      toast.error('Please select a service, package, or course.');
      return;
    }
    if (!date || !time) {
      toast.error('Please select a date and an available time slot.');
      return;
    }
    if (name.trim().length < 2 || phone.trim().length < 8) {
      toast.error('Please enter your full name and valid mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Optional reference image uploads (authenticated users)
      const uploadedUrls: string[] = [];
      if (referenceFiles.length > 0 && user) {
        for (const file of referenceFiles) {
          const fileRef = ref(storage, `booking-references/${user.uid}/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          uploadedUrls.push(url);
        }
      }

      const bookingCode = generateBookingCode();
      const trackingHash = await createTrackingHash(bookingCode, phone);
      const slotKeys = computeOccupiedSlotKeys(date, time, selectedDuration, 30);

      const serviceName =
        'name' in selectedItem ? selectedItem.name : selectedItem.title;
      const numericPrice =
        'numericPrice' in selectedItem && typeof selectedItem.numericPrice === 'number'
          ? selectedItem.numericPrice
          : 'price' in selectedItem && typeof selectedItem.price === 'string'
            ? parseInt(selectedItem.price.replace(/[^0-9]/g, ''), 10) || 0
            : 0;

      const appointmentRef = doc(collection(db, 'appointments'));
      const trackerRef = doc(db, 'bookingTrackers', trackingHash);
      const notifRef = doc(collection(db, 'notifications'));

      await runTransaction(db, async (tx) => {
        // Double-booking atomic check on all occupied 30-min blocks
        for (const sk of slotKeys) {
          const slotDocRef = doc(db, 'bookedSlots', sk);
          const slotSnap = await tx.get(slotDocRef);
          if (slotSnap.exists() && slotSnap.data()?.status === 'active') {
            throw new Error('SLOT_CONFLICT');
          }
        }

        tx.set(appointmentRef, {
          bookingCode,
          userId: user?.uid || null,
          name: name.trim().slice(0, 120),
          phone: phone.trim().slice(0, 24),
          email: email.trim() ? email.trim().slice(0, 200) : null,
          bookingType,
          service: serviceName.slice(0, 160),
          serviceId: bookingType === 'service' ? selectedItem.id || null : null,
          packageId: bookingType === 'package' ? selectedItem.id || null : null,
          date,
          time,
          durationMinutes: selectedDuration,
          slotKeys,
          notes: notes.trim().slice(0, 1000),
          referenceImages: uploadedUrls,
          status: 'pending',
          price: numericPrice,
          advancePaid: 0,
          paymentStatus: 'unpaid',
          pointsUsed: 0,
          pointsEarned: 0,
          rescheduleRequested: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        for (const sk of slotKeys) {
          tx.set(doc(db, 'bookedSlots', sk), {
            date,
            time,
            appointmentId: appointmentRef.id,
            status: 'active',
            createdAt: serverTimestamp(),
          });
        }

        tx.set(trackerRef, {
          bookingCode,
          appointmentId: appointmentRef.id,
          service: serviceName.slice(0, 160),
          date,
          time,
          status: 'pending',
          updatedAt: serverTimestamp(),
        });

        tx.set(notifRef, {
          recipientRole: 'admin',
          recipientUid: 'admin',
          type: 'new_booking',
          title: 'New Appointment Request',
          message: `${name.trim()} requested ${serviceName} on ${date} at ${formatTime12h(time)} (${bookingCode}).`,
          relatedId: appointmentRef.id,
          read: false,
          createdAt: serverTimestamp(),
        });
      });

      setConfirmedBooking({
        bookingCode,
        service: serviceName,
        date,
        time,
        name: name.trim(),
        phone: phone.trim(),
      });
      setTime('');
      setNotes('');
      setReferenceFiles([]);
      toast.success(`Appointment submitted! Booking ID: ${bookingCode}`);
    } catch (err: any) {
      console.error('Booking error:', err);
      if (err?.message === 'SLOT_CONFLICT') {
        toast.error('That time slot was just reserved. Please pick another available slot.');
      } else {
        toast.error('Could not submit booking. Please check your details and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackCode.trim() || !trackPhone.trim()) {
      toast.error('Enter both Booking ID and mobile number.');
      return;
    }
    setTrackLoading(true);
    setTrackNotFound(false);
    setTrackResult(null);
    try {
      const hash = await createTrackingHash(trackCode, trackPhone);
      const snap = await getDoc(doc(db, 'bookingTrackers', hash));
      if (snap.exists()) {
        setTrackResult(snap.data() as BookingTracker);
      } else {
        setTrackNotFound(true);
      }
    } catch (err) {
      console.error('Track lookup error:', err);
      toast.error('Unable to look up booking status.');
    } finally {
      setTrackLoading(false);
    }
  };

  return (
    <section id="appointment" className="py-16 lg:py-20 bg-kd-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-kd-rosegold font-semibold mb-2">
              Real-Time Studio Calendar
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Online Appointment Booking
            </h1>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-kd-surface border border-kd-rosegold/30 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'book' ? 'bg-kd-pink text-kd-black' : 'text-kd-muted hover:text-white'
              }`}
            >
              Book Slot
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'track' ? 'bg-kd-pink text-kd-black' : 'text-kd-muted hover:text-white'
              }`}
            >
              Track Booking Status
            </button>
          </div>
        </div>

        {activeTab === 'track' ? (
          <div className="bg-kd-surface border border-kd-rosegold/30 rounded-2xl p-6 sm:p-8 max-w-xl">
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              Check Appointment Status
            </h2>
            <p className="text-sm text-kd-muted mb-6">
              Enter your unique Booking ID (e.g., KDM-26-XXXXX) and the mobile number used during booking.
            </p>
            <form onSubmit={handleTrackLookup} className="space-y-4">
              <div>
                <label htmlFor="track-code" className="block text-xs font-medium text-kd-pink mb-1.5">
                  Booking ID
                </label>
                <input
                  id="track-code"
                  type="text"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value.toUpperCase())}
                  placeholder="KDM-26-XXXXX"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white font-mono uppercase focus:outline-none focus:border-kd-pink"
                />
              </div>
              <div>
                <label htmlFor="track-phone" className="block text-xs font-medium text-kd-pink mb-1.5">
                  Mobile Number
                </label>
                <input
                  id="track-phone"
                  type="tel"
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white focus:outline-none focus:border-kd-pink"
                />
              </div>
              <button
                type="submit"
                disabled={trackLoading}
                className="w-full py-3 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-sm inline-flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {trackLoading ? 'Checking...' : 'Check Status'}
              </button>
            </form>

            {trackResult && (
              <div className="mt-6 p-5 rounded-xl bg-kd-black border border-kd-rosegold/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-kd-pink">{trackResult.bookingCode}</span>
                  <span className="text-xs uppercase font-semibold text-kd-rosegold">
                    {trackResult.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="font-serif text-xl text-white">{trackResult.service}</div>
                <div className="text-xs text-kd-muted tabular-nums">
                  {trackResult.date} · {formatTime12h(trackResult.time)}
                </div>
              </div>
            )}

            {trackNotFound && (
              <div className="mt-6 p-4 rounded-xl bg-kd-black border border-red-500/30 text-sm text-kd-muted flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>No booking matched that Booking ID and mobile number combination.</span>
              </div>
            )}
          </div>
        ) : confirmedBooking ? (
          <div className="bg-kd-surface border border-kd-rosegold/40 rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-full bg-kd-pink/15 border border-kd-pink/40 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-kd-pink" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-white mb-2">
              Booking Request Submitted
            </h2>
            <p className="text-sm text-kd-muted mb-6">
              Save your unique Booking ID to track status or share on WhatsApp for priority confirmation.
            </p>
            <div className="bg-kd-black border border-kd-rosegold/30 rounded-xl p-5 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-kd-muted">Booking ID</span>
                <span className="font-mono font-bold text-kd-pink">{confirmedBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-kd-muted">Service</span>
                <span className="text-white font-medium">{confirmedBooking.service}</span>
              </div>
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-kd-muted">Date &amp; Time</span>
                <span className="text-white">
                  {confirmedBooking.date} · {formatTime12h(confirmedBooking.time)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-kd-muted">Status</span>
                <span className="text-kd-rosegold font-semibold">Pending Studio Confirmation</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={buildWhatsAppUrl(
                  settings.whatsappNumber || VERIFIED_BUSINESS_INFO.whatsappNumber,
                  `Hi Komal, I just booked an appointment at KD Makeovers.\nBooking ID: ${confirmedBooking.bookingCode}\nName: ${confirmedBooking.name}\nService: ${confirmedBooking.service}\nDate: ${confirmedBooking.date} at ${formatTime12h(confirmedBooking.time)}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20bd5a]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Confirm on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => setConfirmedBooking(null)}
                className="flex-1 py-3 px-5 rounded-xl border border-kd-rosegold/40 text-kd-pink font-semibold text-sm hover:bg-white/5"
              >
                Book Another Slot
              </button>
            </div>
            {user && (
              <div className="mt-4">
                <Link to="/my-bookings" className="text-xs text-kd-pink hover:underline">
                  View in My Bookings →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-kd-surface border border-kd-rosegold/30 rounded-2xl p-6 sm:p-8">
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Step 1: Type Selection */}
              <div>
                <label className="block text-xs font-medium text-kd-pink mb-2">
                  1. Booking Category
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-kd-black border border-kd-rosegold/20">
                  {[
                    { id: 'service', label: 'Salon Services' },
                    { id: 'package', label: 'Bridal Packages' },
                    { id: 'course', label: 'Academy Courses' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setBookingType(tab.id as 'service' | 'package' | 'course');
                        setSelectedItemId('');
                        setTime('');
                      }}
                      className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                        bookingType === tab.id
                          ? 'bg-kd-pink text-kd-black'
                          : 'text-kd-muted hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Item & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="booking-item" className="block text-xs font-medium text-kd-pink mb-1.5">
                    2. Select {bookingType === 'service' ? 'Service' : bookingType === 'package' ? 'Package' : 'Course'}
                  </label>
                  <select
                    id="booking-item"
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      setTime('');
                    }}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white focus:outline-none focus:border-kd-pink"
                  >
                    <option value="">Choose an option...</option>
                    {bookingType === 'service' &&
                      activeServices.map((s) => (
                        <option key={s.id || s.name} value={s.id || s.name}>
                          {s.name} ({s.durationMinutes || 60}m) — {s.price || 'On Consultation'}
                        </option>
                      ))}
                    {bookingType === 'package' &&
                      activePackages.map((p) => (
                        <option key={p.id || p.name} value={p.id || p.name}>
                          {p.name} — {p.price}
                        </option>
                      ))}
                    {bookingType === 'course' &&
                      DEFAULT_ACADEMY_COURSES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.duration})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="booking-date" className="block text-xs font-medium text-kd-pink mb-1.5">
                    3. Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-kd-rosegold absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="booking-date"
                      type="date"
                      min={minDateStr}
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setTime('');
                      }}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white focus:outline-none focus:border-kd-pink"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Available Slots */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-kd-pink">
                    4. Available Time Slots ({selectedDuration} mins duration)
                  </span>
                  {date && (
                    <span className="text-[11px] text-kd-muted">
                      Studio Hours: {formatTime12h(settings.openingTime)} – {formatTime12h(settings.closingTime)}
                    </span>
                  )}
                </div>

                {!date ? (
                  <div className="p-4 rounded-xl bg-kd-black border border-kd-rosegold/20 text-xs text-kd-muted flex items-center gap-2">
                    <Clock className="w-4 h-4 text-kd-rosegold" />
                    Select a preferred date to view available non-conflicting slots.
                  </div>
                ) : isHoliday || availableSlots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-kd-black border border-red-500/30 text-xs text-kd-muted">
                    Studio is closed or on holiday for this date. Please choose another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setTime(slot.time)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-medium border tabular-nums transition-colors ${
                          !slot.available
                            ? 'bg-kd-black/40 border-white/5 text-white/25 cursor-not-allowed line-through'
                            : time === slot.time
                              ? 'bg-kd-pink text-kd-black border-kd-pink font-bold'
                              : 'bg-kd-black border-kd-rosegold/25 text-white hover:border-kd-pink'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4: Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="cust-name" className="block text-xs font-medium text-kd-pink mb-1.5">
                    Full Name *
                  </label>
                  <input
                    id="cust-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white focus:outline-none focus:border-kd-pink"
                  />
                </div>
                <div>
                  <label htmlFor="cust-phone" className="block text-xs font-medium text-kd-pink mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    id="cust-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98XXX XXXXX"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white focus:outline-none focus:border-kd-pink"
                  />
                </div>
                <div>
                  <label htmlFor="cust-email" className="block text-xs font-medium text-kd-pink mb-1.5">
                    Email (Optional)
                  </label>
                  <input
                    id="cust-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white focus:outline-none focus:border-kd-pink"
                  />
                </div>
              </div>

              {/* Step 5: Notes & Reference Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cust-notes" className="block text-xs font-medium text-kd-pink mb-1.5">
                    Additional Requirements (Optional)
                  </label>
                  <textarea
                    id="cust-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Outfit shade, skin preferences, event timing..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white focus:outline-none focus:border-kd-pink"
                  />
                </div>
                <div>
                  <span className="block text-xs font-medium text-kd-pink mb-1.5">
                    Reference Makeup Images (Optional, max 3)
                  </span>
                  {user ? (
                    <div className="space-y-2">
                      <label className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl border border-dashed border-kd-rosegold/40 bg-kd-black text-xs text-kd-muted hover:border-kd-pink cursor-pointer">
                        <Upload className="w-4 h-4 text-kd-pink" />
                        <span>
                          {referenceFiles.length > 0
                            ? `${referenceFiles.length} image(s) selected`
                            : 'Upload look inspiration photos (JPG/PNG)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      {referenceFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {referenceFiles.map((f, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[11px] bg-kd-black border border-kd-rosegold/30 px-2.5 py-1 rounded-lg text-kd-pink"
                            >
                              {f.name}
                              <button
                                type="button"
                                onClick={() => setReferenceFiles(referenceFiles.filter((_, idx) => idx !== i))}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-kd-black border border-kd-rosegold/20 text-xs text-kd-muted">
                      Guest booking is enabled! Sign in with Google if you also wish to attach makeup inspiration photos.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-kd-rosegold/20">
                <p className="text-xs text-kd-muted">
                  {settings.cancellationPolicy}
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || !time}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {isSubmitting ? 'Reserving Slot...' : 'Submit Appointment Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
