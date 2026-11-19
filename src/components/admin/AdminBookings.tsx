import React, { useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Calendar as CalendarIcon,
  Check,
  Image as ImageIcon,
  MessageCircle,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/src/firebase';
import { Appointment, BookingStatus, BusinessSettings } from '@/src/types';
import {
  buildWhatsAppUrl,
  computeOccupiedSlotKeys,
  createTrackingHash,
  formatTime12h,
} from '@/src/lib/bookingUtils';
import { VERIFIED_BUSINESS_INFO } from '@/src/data/defaults';

interface AdminBookingsProps {
  mode: 'list' | 'calendar';
  appointments: Appointment[];
  settings: BusinessSettings;
  onLog: (action: string, entityType: string, entityId: string, details: string) => Promise<void>;
}

const ALL_STATUSES: ('all' | BookingStatus)[] = [
  'all',
  'pending',
  'confirmed',
  'rescheduled',
  'completed',
  'cancelled',
  'no_show',
];

export default function AdminBookings({
  mode,
  appointments,
  settings,
  onLog,
}: AdminBookingsProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');

  const [calendarDate, setCalendarDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [internalNote, setInternalNote] = useState('');
  const [reschedDate, setReschedDate] = useState('');
  const [reschedTime, setReschedTime] = useState('');
  const [priceEdit, setPriceEdit] = useState('');

  const uniqueServices = useMemo(
    () => ['all', ...Array.from(new Set(appointments.map((a) => a.service)))],
    [appointments]
  );

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (dateFilter && a.date !== dateFilter) return false;
      if (serviceFilter !== 'all' && a.service !== serviceFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit =
          a.name.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.bookingCode?.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, dateFilter, serviceFilter, search]);

  const calendarAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === calendarDate && a.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, calendarDate]);

  const releaseSlots = async (app: Appointment) => {
    if (!app.slotKeys) return;
    for (const sk of app.slotKeys) {
      await deleteDoc(doc(db, 'bookedSlots', sk)).catch(() => {});
    }
  };

  const syncTrackerStatus = async (app: Appointment, status: BookingStatus, date = app.date, time = app.time) => {
    try {
      const hash = await createTrackingHash(app.bookingCode, app.phone);
      await updateDoc(doc(db, 'bookingTrackers', hash), {
        status,
        date,
        time,
        updatedAt: serverTimestamp(),
      });
    } catch {
      // Tracker may not exist for legacy bookings
    }
  };

  const notifyCustomer = async (app: Appointment, type: string, title: string, message: string) => {
    if (!app.userId) return;
    await addDoc(collection(db, 'notifications'), {
      recipientRole: 'customer',
      recipientUid: app.userId,
      type,
      title,
      message,
      relatedId: app.id || '',
      read: false,
      createdAt: serverTimestamp(),
    }).catch(() => {});
  };

  const handleStatusChange = async (app: Appointment, newStatus: BookingStatus) => {
    if (!app.id) return;
    try {
      const appRef = doc(db, 'appointments', app.id);
      const snap = await getDoc(appRef);
      const latest = snap.data() as Appointment;

      await updateDoc(appRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      if (newStatus === 'cancelled' || newStatus === 'no_show') {
        await releaseSlots(app);
      }

      // Loyalty & customer totalVisits update on completion
      if (newStatus === 'completed' && latest.userId && !latest.pointsEarned) {
        const priceVal = latest.price || 0;
        const earned = Math.floor(priceVal * 0.1);
        await updateDoc(doc(db, 'userProfiles', latest.userId), {
          loyaltyPoints: increment(earned),
          totalSpent: increment(priceVal),
          totalVisits: increment(1),
          updatedAt: serverTimestamp(),
        }).catch(() => {});
        if (earned > 0) {
          await updateDoc(appRef, { pointsEarned: earned });
        }
      }

      await syncTrackerStatus(app, newStatus);
      await notifyCustomer(
        app,
        `booking_${newStatus}`,
        `Booking ${newStatus.replace('_', ' ')}`,
        `Your booking ${app.bookingCode} (${app.service} on ${app.date}) is now ${newStatus.replace('_', ' ')}.`
      );
      await onLog(`Updated booking status to ${newStatus}`, 'appointment', app.id, `${app.bookingCode} — ${app.name}`);
      toast.success(`Booking marked ${newStatus.replace('_', ' ')}`);
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  const handleRescheduleSave = async () => {
    if (!selectedApp?.id || !reschedDate || !reschedTime) return;
    try {
      await releaseSlots(selectedApp);
      const newSlotKeys = computeOccupiedSlotKeys(
        reschedDate,
        reschedTime,
        selectedApp.durationMinutes || 60,
        30
      );

      for (const sk of newSlotKeys) {
        await setDoc(doc(db, 'bookedSlots', sk), {
          date: reschedDate,
          time: reschedTime,
          appointmentId: selectedApp.id,
          status: 'active',
          createdAt: serverTimestamp(),
        });
      }

      const parsedPrice = Number(priceEdit);
      await updateDoc(doc(db, 'appointments', selectedApp.id), {
        date: reschedDate,
        time: reschedTime,
        slotKeys: newSlotKeys,
        status: 'rescheduled',
        rescheduleRequested: false,
        internalNotes: internalNote.trim(),
        price: Number.isNaN(parsedPrice) ? selectedApp.price : parsedPrice,
        updatedAt: serverTimestamp(),
      });

      await syncTrackerStatus(selectedApp, 'rescheduled', reschedDate, reschedTime);
      await notifyCustomer(
        selectedApp,
        'booking_rescheduled',
        'Booking Rescheduled',
        `Your booking ${selectedApp.bookingCode} moved to ${reschedDate} at ${formatTime12h(reschedTime)}.`
      );
      await onLog(
        'Rescheduled booking',
        'appointment',
        selectedApp.id,
        `${selectedApp.bookingCode} -> ${reschedDate} ${reschedTime}`
      );
      toast.success('Booking rescheduled & notes saved');
      setSelectedApp(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not reschedule');
    }
  };

  const handleSaveNotesAndPrice = async () => {
    if (!selectedApp?.id) return;
    try {
      const parsedPrice = Number(priceEdit);
      await updateDoc(doc(db, 'appointments', selectedApp.id), {
        internalNotes: internalNote.trim(),
        price: Number.isNaN(parsedPrice) ? selectedApp.price : parsedPrice,
        updatedAt: serverTimestamp(),
      });
      await onLog('Updated booking details', 'appointment', selectedApp.id, selectedApp.bookingCode);
      toast.success('Booking details updated');
      setSelectedApp(null);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDelete = async (app: Appointment) => {
    if (!app.id) return;
    await releaseSlots(app);
    await deleteDoc(doc(db, 'appointments', app.id));
    await onLog('Deleted booking', 'appointment', app.id, `${app.bookingCode} — ${app.name}`);
    toast.success('Booking deleted');
  };

  const openDetailModal = (app: Appointment) => {
    setSelectedApp(app);
    setInternalNote(app.internalNotes || '');
    setReschedDate(app.requestedDate || app.date);
    setReschedTime(app.requestedTime || app.time);
    setPriceEdit(String(app.price || 0));
  };

  if (mode === 'calendar') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Studio Calendar</h2>
            <p className="text-xs text-kd-muted">Daily schedule view with booked slots and quick actions.</p>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-kd-rosegold" />
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-kd-surface border border-kd-rosegold/30 text-sm text-white"
            />
          </div>
        </div>

        {calendarAppointments.length === 0 ? (
          <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-12 text-center text-sm text-kd-muted">
            No active bookings scheduled for {calendarDate}.
          </div>
        ) : (
          <div className="space-y-3">
            {calendarAppointments.map((app) => (
              <div
                key={app.id}
                className="bg-kd-surface border border-kd-rosegold/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="px-3.5 py-2 rounded-xl bg-kd-black border border-kd-rosegold/40 text-center shrink-0">
                    <div className="text-sm font-bold text-kd-pink tabular-nums">
                      {formatTime12h(app.time)}
                    </div>
                    <div className="text-[10px] text-kd-muted tabular-nums">
                      {app.durationMinutes || 60} mins
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-kd-rosegold">{app.bookingCode}</div>
                    <h3 className="font-serif text-xl font-semibold text-white">{app.service}</h3>
                    <div className="text-xs text-kd-muted">
                      {app.name} · {app.phone}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-semibold text-kd-pink mr-2">
                    {app.status.replace('_', ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => openDetailModal(app)}
                    className="px-3.5 py-2 rounded-xl border border-kd-rosegold/40 text-xs font-semibold text-white hover:border-kd-pink"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Booking Management</h2>
        <p className="text-xs text-kd-muted">
          Confirm, reschedule, complete, or review customer reference photos.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-kd-rosegold absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, ID..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-kd-surface border border-kd-rosegold/25 text-xs text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3.5 py-2.5 rounded-xl bg-kd-surface border border-kd-rosegold/25 text-xs text-white"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              Status: {s === 'all' ? 'All' : s.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-kd-surface border border-kd-rosegold/25 text-xs text-white"
        >
          {uniqueServices.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Services' : s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-kd-surface border border-kd-rosegold/25 text-xs text-white"
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-kd-rosegold/20 text-[11px] uppercase tracking-wider text-kd-muted">
                <th className="py-3.5 px-4">Booking ID &amp; Customer</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Schedule</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-kd-rosegold/10 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-kd-muted">
                    No bookings match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-kd-rosegold font-semibold">{app.bookingCode}</div>
                      <div className="font-semibold text-white">{app.name}</div>
                      <div className="text-kd-muted tabular-nums">{app.phone}</div>
                      {app.rescheduleRequested && (
                        <div className="text-[10px] text-kd-pink mt-0.5">
                          Req: {app.requestedDate} {app.requestedTime}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{app.service}</div>
                      {app.referenceImages && app.referenceImages.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-kd-pink mt-0.5">
                          <ImageIcon className="w-3 h-3" /> {app.referenceImages.length} ref photo(s)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <div className="text-white">{app.date}</div>
                      <div className="text-kd-muted">{formatTime12h(app.time)}</div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-semibold text-kd-pink">
                      ₹{(app.price || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app, e.target.value as BookingStatus)}
                        className="px-2.5 py-1.5 rounded-lg bg-kd-black border border-kd-rosegold/30 text-xs text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {app.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app, 'confirmed')}
                            className="p-2 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                            title="Confirm Booking"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <a
                          href={buildWhatsAppUrl(
                            app.phone.replace(/\D/g, '').length === 10
                              ? `91${app.phone.replace(/\D/g, '')}`
                              : app.phone || settings.whatsappNumber || VERIFIED_BUSINESS_INFO.whatsappNumber,
                            `Hi ${app.name}, regarding your KD Makeovers booking ${app.bookingCode} (${app.service} on ${app.date} at ${formatTime12h(app.time)}) — Status: ${app.status.toUpperCase()}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openDetailModal(app)}
                          className="px-2.5 py-1.5 rounded-lg border border-kd-rosegold/30 text-kd-pink hover:bg-white/5"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(app)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details / Reschedule / Reference Photos Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-kd-surface border border-kd-rosegold/40 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-xs text-kd-rosegold">{selectedApp.bookingCode}</div>
                <h3 className="font-serif text-2xl font-bold text-white">{selectedApp.name}</h3>
                <div className="text-xs text-kd-muted">
                  {selectedApp.phone} {selectedApp.email ? `· ${selectedApp.email}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 text-kd-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedApp.notes && (
              <div className="p-3.5 rounded-xl bg-kd-black border border-kd-rosegold/20 text-xs">
                <div className="text-kd-rosegold font-semibold mb-1">Customer Notes</div>
                <p className="text-kd-muted">{selectedApp.notes}</p>
              </div>
            )}

            {selectedApp.referenceImages && selectedApp.referenceImages.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-kd-pink mb-2">
                  Uploaded Reference Images
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selectedApp.referenceImages.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-xl overflow-hidden border border-kd-rosegold/30 block"
                    >
                      <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-kd-pink mb-1">Date</label>
                <input
                  type="date"
                  value={reschedDate}
                  onChange={(e) => setReschedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-kd-pink mb-1">Time</label>
                <input
                  type="time"
                  value={reschedTime}
                  onChange={(e) => setReschedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-kd-pink mb-1">Estimated / Final ₹</label>
                <input
                  type="number"
                  value={priceEdit}
                  onChange={(e) => setPriceEdit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-kd-pink mb-1">Internal Studio Notes</label>
              <textarea
                rows={3}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Shade notes, artist assigned, advance notes..."
                className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSaveNotesAndPrice}
                className="flex-1 py-2.5 rounded-xl border border-kd-rosegold/40 text-xs font-semibold text-white hover:bg-white/5"
              >
                Save Notes &amp; Price
              </button>
              <button
                type="button"
                onClick={handleRescheduleSave}
                className="flex-1 py-2.5 rounded-xl bg-kd-pink text-kd-black text-xs font-semibold hover:bg-kd-blush"
              >
                Reschedule &amp; Update Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
