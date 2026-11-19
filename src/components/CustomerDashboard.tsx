import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  Bell,
  Calendar,
  Clock,
  Heart,
  LogIn,
  LogOut,
  Search,
  Star,
  User as UserIcon,
  XCircle,
  RefreshCw,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { db, handleFirestoreError, logout, OperationType, signInWithGoogle } from '@/src/firebase';
import { useSalon } from '@/src/context/SalonContext';
import { Appointment, AppNotification } from '@/src/types';
import { createTrackingHash, formatTime12h } from '@/src/lib/bookingUtils';
import { KDLogo } from './KDLogo';

export default function CustomerDashboard() {
  const { user, userProfile, services, offers, settings } = useSalon();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'favorites' | 'profile' | 'notifications'>('upcoming');

  // Profile form state
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Reschedule modal state
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [reqDate, setReqDate] = useState('');
  const [reqTime, setReqTime] = useState('');

  // Completed review modal
  const [reviewTarget, setReviewTarget] = useState<Appointment | null>(null);
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!user) {
      setAppointments([]);
      setNotifications([]);
      setLoading(false);
      return;
    }

    const getTimeMs = (ts: any) => {
      if (!ts) return 0;
      if (typeof ts.toMillis === 'function') return ts.toMillis();
      if (typeof ts.seconds === 'number') return ts.seconds * 1000;
      const parsed = Date.parse(String(ts));
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const unsubApp = onSnapshot(
      query(collection(db, 'appointments'), where('userId', '==', user.uid)),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Appointment))
          .sort((a, b) => getTimeMs(b.createdAt) - getTimeMs(a.createdAt));
        setAppointments(list);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        console.warn('Customer appointments listener:', err.message);
      }
    );

    const unsubNotif = onSnapshot(
      query(collection(db, 'notifications'), where('recipientUid', '==', user.uid)),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as AppNotification))
          .filter((n) => n.recipientRole === 'customer')
          .sort((a, b) => getTimeMs(b.createdAt) - getTimeMs(a.createdAt));
        setNotifications(list);
      },
      (err) => {
        console.warn('Customer notifications listener:', err.message);
      }
    );

    return () => {
      unsubApp();
      unsubNotif();
    };
  }, [user]);

  const upcomingBookings = useMemo(
    () => appointments.filter((a) => ['pending', 'confirmed', 'rescheduled'].includes(a.status)),
    [appointments]
  );

  const pastBookings = useMemo(
    () => appointments.filter((a) => ['completed', 'cancelled', 'no_show'].includes(a.status)),
    [appointments]
  );

  const favoriteServices = useMemo(() => {
    const ids = userProfile?.favoriteServiceIds || [];
    return services.filter((s) => s.id && ids.includes(s.id));
  }, [services, userProfile]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await updateDoc(doc(db, 'userProfiles', user.uid), {
        displayName: displayName.trim().slice(0, 120) || 'Customer',
        phone: phone.trim().slice(0, 24),
        address: address.trim().slice(0, 300),
        updatedAt: serverTimestamp(),
      });
      toast.success('Profile updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `userProfiles/${user.uid}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelBooking = async (app: Appointment) => {
    if (!app.id) return;
    try {
      await updateDoc(doc(db, 'appointments', app.id), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });

      // Release occupied slot locks
      if (app.slotKeys && app.slotKeys.length > 0) {
        for (const sk of app.slotKeys) {
          await deleteDoc(doc(db, 'bookedSlots', sk)).catch(() => {});
        }
      }

      // Update tracker
      const hash = await createTrackingHash(app.bookingCode, app.phone);
      await updateDoc(doc(db, 'bookingTrackers', hash), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      }).catch(() => {});

      // Notify admin
      await addDoc(collection(db, 'notifications'), {
        recipientRole: 'admin',
        recipientUid: 'admin',
        type: 'booking_cancelled',
        title: 'Booking Cancelled by Customer',
        message: `${app.name} cancelled booking ${app.bookingCode} (${app.service} on ${app.date}).`,
        relatedId: app.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Appointment cancelled and time slot released.');
    } catch (err) {
      console.error('Cancel booking error:', err);
      toast.error('Could not cancel appointment.');
    }
  };

  const handleRequestReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget?.id || !reqDate || !reqTime) return;
    try {
      await updateDoc(doc(db, 'appointments', rescheduleTarget.id), {
        rescheduleRequested: true,
        requestedDate: reqDate,
        requestedTime: reqTime,
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'notifications'), {
        recipientRole: 'admin',
        recipientUid: 'admin',
        type: 'reschedule_request',
        title: 'Reschedule Requested',
        message: `${rescheduleTarget.name} (${rescheduleTarget.bookingCode}) requested ${reqDate} at ${formatTime12h(reqTime)}.`,
        relatedId: rescheduleTarget.id,
        read: false,
        createdAt: serverTimestamp(),
      });
      toast.success('Reschedule request sent to the studio.');
      setRescheduleTarget(null);
    } catch (err) {
      console.error('Reschedule request error:', err);
      toast.error('Failed to send reschedule request.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget || !user || revComment.trim().length < 3) return;
    try {
      const revRef = doc(collection(db, 'reviews'));
      await setDoc(revRef, {
        name: userProfile?.displayName || user.displayName || reviewTarget.name,
        userId: user.uid,
        appointmentId: reviewTarget.id || null,
        rating: revRating,
        comment: revComment.trim().slice(0, 1000),
        photoUrl: null,
        approved: false,
        createdAt: serverTimestamp(),
      });
      toast.success('Review submitted for admin approval.');
      setReviewTarget(null);
      setRevComment('');
    } catch (err) {
      console.error('Review error:', err);
      toast.error('Failed to submit review.');
    }
  };

  const markNotificationRead = async (id?: string) => {
    if (!id) return;
    await updateDoc(doc(db, 'notifications', id), { read: true }).catch(() => {});
  };

  if (!user) {
    return (
      <section className="py-16 lg:py-24 bg-kd-black min-h-[70vh] flex items-center">
        <div className="max-w-lg mx-auto px-4 w-full">
          <div className="bg-kd-surface border border-kd-rosegold/35 rounded-2xl p-8 text-center">
            <div className="flex justify-center mb-5">
              <KDLogo
                logoUrl={settings.logoUrl}
                businessName={settings.businessName}
                tagline={settings.tagline}
                size="lg"
                showTagline={true}
              />
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-2">Customer Account</h1>
            <p className="text-sm text-kd-muted mb-6 leading-relaxed">
              Sign in to manage upcoming appointments, request rescheduling, view booking history, save favourite services, and check loyalty rewards.
            </p>
            <button
              type="button"
              onClick={() => signInWithGoogle().catch(() => toast.error('Sign in cancelled'))}
              className="w-full py-3 rounded-xl bg-kd-pink text-kd-black hover:bg-kd-blush font-semibold text-sm inline-flex items-center justify-center gap-2 mb-3"
            >
              <LogIn className="w-4 h-4" />
              Sign In / Register with Google
            </button>
            <Link
              to="/book?tab=track"
              className="w-full py-3 rounded-xl border border-kd-rosegold/40 text-kd-pink hover:bg-white/5 font-semibold text-sm inline-flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Track Guest Booking by ID
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-kd-black min-h-[75vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-8 border-b border-kd-rosegold/20">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-kd-rosegold font-semibold mb-1">
              Customer Portal
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Welcome, {userProfile?.displayName || user.displayName || 'Guest'}
            </h1>
            <p className="text-xs text-kd-muted mt-1">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/book"
              className="px-5 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-xs hover:bg-kd-blush"
            >
              Book New Appointment
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-kd-rosegold/30 text-kd-muted hover:text-white text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
            <div className="text-xs text-kd-muted mb-1">Upcoming Bookings</div>
            <div className="text-3xl font-serif font-bold text-kd-pink tabular-nums">
              {upcomingBookings.length}
            </div>
          </div>
          <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
            <div className="text-xs text-kd-muted mb-1">Completed Visits</div>
            <div className="text-3xl font-serif font-bold text-white tabular-nums">
              {userProfile?.totalVisits || pastBookings.filter((b) => b.status === 'completed').length}
            </div>
          </div>
          <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
            <div className="text-xs text-kd-muted mb-1">Loyalty Points</div>
            <div className="text-3xl font-serif font-bold text-kd-rosegold tabular-nums">
              {(userProfile?.loyaltyPoints || 0).toLocaleString()}
            </div>
          </div>
          <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
            <div className="text-xs text-kd-muted mb-1">Active Offers</div>
            <div className="text-3xl font-serif font-bold text-white tabular-nums">
              {offers.length}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {[
            { id: 'upcoming', label: `Upcoming (${upcomingBookings.length})` },
            { id: 'history', label: `History (${pastBookings.length})` },
            { id: 'favorites', label: `Favourites (${favoriteServices.length})` },
            { id: 'notifications', label: `Notifications (${unreadCount})` },
            { id: 'profile', label: 'My Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                activeTab === tab.id
                  ? 'bg-kd-pink text-kd-black border-kd-pink'
                  : 'bg-kd-surface text-kd-muted border-kd-rosegold/20 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="p-12 text-center text-sm text-kd-muted">Loading your bookings...</div>
        ) : activeTab === 'upcoming' ? (
          upcomingBookings.length === 0 ? (
            <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-10 text-center">
              <p className="font-serif text-2xl text-kd-pink mb-2">No Upcoming Appointments</p>
              <p className="text-sm text-kd-muted mb-5">Schedule your next bridal or salon visit online.</p>
              <Link
                to="/book"
                className="inline-flex px-5 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-sm"
              >
                Book Appointment
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingBookings.map((app) => (
                <div
                  key={app.id}
                  className="bg-kd-surface border border-kd-rosegold/30 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs text-kd-rosegold font-semibold">
                        {app.bookingCode}
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-white">{app.service}</h3>
                    </div>
                    <span className="text-xs uppercase font-semibold text-kd-pink">
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-kd-muted tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-kd-rosegold" />
                      {app.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-kd-rosegold" />
                      {formatTime12h(app.time)}
                    </span>
                  </div>
                  {app.rescheduleRequested && (
                    <div className="text-xs text-kd-pink bg-kd-black/60 border border-kd-rosegold/30 rounded-lg px-3 py-2">
                      Reschedule requested for {app.requestedDate} at {formatTime12h(app.requestedTime || '')}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2.5 pt-3 border-t border-kd-rosegold/15">
                    <button
                      type="button"
                      onClick={() => {
                        setRescheduleTarget(app);
                        setReqDate(app.date);
                        setReqTime(app.time);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-kd-rosegold/40 text-xs font-semibold text-kd-pink hover:bg-white/5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Request Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(app)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'history' ? (
          pastBookings.length === 0 ? (
            <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-10 text-center text-sm text-kd-muted">
              No past appointments recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pastBookings.map((app) => (
                <div
                  key={app.id}
                  className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-6 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono text-xs text-kd-muted">{app.bookingCode}</div>
                      <h3 className="font-serif text-xl font-semibold text-white">{app.service}</h3>
                    </div>
                    <span className="text-xs uppercase font-semibold text-kd-rosegold">
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-kd-muted tabular-nums">
                    {app.date} · {formatTime12h(app.time)}
                    {app.price > 0 ? ` · ₹${app.price.toLocaleString()}` : ''}
                  </div>
                  {app.status === 'completed' && (
                    <button
                      type="button"
                      onClick={() => setReviewTarget(app)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-kd-pink hover:underline pt-2"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Leave a Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'favorites' ? (
          favoriteServices.length === 0 ? (
            <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-10 text-center">
              <Heart className="w-7 h-7 text-kd-rosegold mx-auto mb-3" />
              <p className="text-sm text-kd-muted mb-4">You haven&apos;t saved any favourite services yet.</p>
              <Link to="/services" className="text-xs font-semibold text-kd-pink hover:underline">
                Browse Services →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {favoriteServices.map((srv) => (
                <div key={srv.id} className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5 space-y-3">
                  <div className="text-xs text-kd-rosegold">{srv.category}</div>
                  <h3 className="font-serif text-xl font-semibold text-white">{srv.name}</h3>
                  <div className="text-sm font-bold text-kd-pink">{srv.price}</div>
                  <Link
                    to={`/book?service=${encodeURIComponent(srv.id || srv.name)}`}
                    className="inline-flex px-4 py-2 rounded-xl bg-kd-pink text-kd-black text-xs font-semibold"
                  >
                    Book Service
                  </Link>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'notifications' ? (
          <div className="space-y-3 max-w-2xl">
            {notifications.length === 0 ? (
              <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-8 text-center text-sm text-kd-muted">
                <Bell className="w-6 h-6 text-kd-rosegold mx-auto mb-2" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                    n.read
                      ? 'bg-kd-surface/60 border-kd-rosegold/15 text-kd-muted'
                      : 'bg-kd-surface border-kd-pink/40 text-white'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">{n.title}</div>
                    <p className="text-xs text-kd-muted mt-1">{n.message}</p>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className="text-xs text-kd-pink hover:underline shrink-0 inline-flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <form
            onSubmit={handleSaveProfile}
            className="bg-kd-surface border border-kd-rosegold/30 rounded-2xl p-6 max-w-xl space-y-4"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <UserIcon className="w-5 h-5 text-kd-pink" />
              <h2 className="font-serif text-2xl font-bold text-white">Personal Information</h2>
            </div>
            <div>
              <label className="block text-xs font-medium text-kd-pink mb-1.5">Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-kd-pink mb-1.5">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-kd-pink mb-1.5">Address / Locality</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white"
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-sm hover:bg-kd-blush"
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleRequestReschedule}
            className="w-full max-w-md bg-kd-surface border border-kd-rosegold/40 rounded-2xl p-6 space-y-4"
          >
            <h3 className="font-serif text-2xl font-bold text-white">Request Reschedule</h3>
            <p className="text-xs text-kd-muted">
              {rescheduleTarget.service} ({rescheduleTarget.bookingCode})
            </p>
            <div>
              <label className="block text-xs text-kd-pink mb-1">New Preferred Date</label>
              <input
                type="date"
                value={reqDate}
                onChange={(e) => setReqDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-kd-pink mb-1">New Preferred Time</label>
              <input
                type="time"
                value={reqTime}
                onChange={(e) => setReqTime(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white"
              />
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-kd-rosegold/30 text-xs text-kd-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-xs"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Completed Appointment Review Modal */}
      {reviewTarget && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleReviewSubmit}
            className="w-full max-w-md bg-kd-surface border border-kd-rosegold/40 rounded-2xl p-6 space-y-4"
          >
            <h3 className="font-serif text-2xl font-bold text-white">Review {reviewTarget.service}</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRevRating(s)}>
                  <Star className={`w-6 h-6 ${s <= revRating ? 'text-kd-rosegold fill-kd-rosegold' : 'text-white/20'}`} />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              required
              value={revComment}
              onChange={(e) => setRevComment(e.target.value)}
              placeholder="Share your feedback..."
              className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-sm text-white"
            />
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-kd-rosegold/30 text-xs text-kd-muted"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-xs"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
