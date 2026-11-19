import React, { useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileSpreadsheet, FileText, Plus, Search, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { db, storage } from '@/src/firebase';
import {
  Appointment,
  BusinessSettings,
  PaymentMethod,
  PaymentRecord,
  PaymentStatus,
  RefundStatus,
  UserProfile,
} from '@/src/types';

interface AdminCRMAndPaymentsProps {
  section: 'customers' | 'payments' | 'reports' | 'settings';
  customers: UserProfile[];
  appointments: Appointment[];
  payments: PaymentRecord[];
  settings: BusinessSettings;
  onLog: (action: string, entityType: string, entityId: string, details: string) => Promise<void>;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AdminCRMAndPayments({
  section,
  customers,
  appointments,
  payments,
  settings,
  onLog,
}: AdminCRMAndPaymentsProps) {
  // CRM state
  const [custSearch, setCustSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [custNotes, setCustNotes] = useState('');

  // Payments form
  const [payForm, setPayForm] = useState({
    appointmentId: '',
    totalAmount: '',
    advanceAmount: '',
    paymentMethod: 'upi' as PaymentMethod,
    transactionRef: '',
    refundStatus: 'none' as RefundStatus,
    notes: '',
  });

  // Settings form
  const [cfg, setCfg] = useState<BusinessSettings>(settings);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [holidayInput, setHolidayInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const filteredCustomers = useMemo(() => {
    const q = custSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.displayName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.uid.toLowerCase().includes(q)
    );
  }, [customers, custSearch]);

  const customerHistory = useMemo(() => {
    if (!selectedCustomer) return [];
    return appointments.filter((a) => a.userId === selectedCustomer.uid);
  }, [selectedCustomer, appointments]);

  const paymentSummary = useMemo(() => {
    const collected = payments
      .filter((p) => p.paymentStatus !== 'refunded')
      .reduce((acc, p) => acc + (p.advanceAmount || 0), 0);
    const outstanding = payments
      .filter((p) => p.paymentStatus !== 'refunded')
      .reduce((acc, p) => acc + (p.remainingBalance || 0), 0);
    const refunded = payments
      .filter((p) => p.refundStatus === 'refunded' || p.paymentStatus === 'refunded')
      .reduce((acc, p) => acc + (p.advanceAmount || 0), 0);
    return { collected, outstanding, refunded };
  }, [payments]);

  // Export helpers
  const exportExcel = (filename: string, rows: Record<string, any>[]) => {
    if (rows.length === 0) {
      toast.info('No records available to export.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast.success(`Exported ${filename}.xlsx`);
  };

  const exportPdf = (title: string, columns: string[], rows: (string | number)[][]) => {
    if (rows.length === 0) {
      toast.info('No records available to export.');
      return;
    }
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text(`KD Makeovers & Cosmetics — ${title}`, 14, 18);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
    autoTable(pdf, {
      startY: 32,
      head: [columns],
      body: rows,
    });
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    toast.success(`Exported ${title} PDF`);
  };

  // Record payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const app = appointments.find((a) => a.id === payForm.appointmentId);
    if (!app || !app.id) {
      toast.error('Please select a booking.');
      return;
    }
    const total = Number(payForm.totalAmount) || app.price || 0;
    const paid = Number(payForm.advanceAmount) || 0;
    const remaining = Math.max(0, total - paid);
    const status: PaymentStatus =
      payForm.refundStatus === 'refunded'
        ? 'refunded'
        : remaining === 0 && total > 0
          ? 'paid'
          : paid > 0
            ? 'partial'
            : 'unpaid';

    try {
      const payRef = await addDoc(collection(db, 'payments'), {
        appointmentId: app.id,
        bookingCode: app.bookingCode,
        userId: app.userId || null,
        customerName: app.name,
        totalAmount: total,
        advanceAmount: paid,
        remainingBalance: remaining,
        paymentStatus: status,
        paymentMethod: payForm.paymentMethod,
        transactionRef: payForm.transactionRef.trim(),
        refundStatus: payForm.refundStatus,
        notes: payForm.notes.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'appointments', app.id), {
        price: total,
        advancePaid: paid,
        paymentStatus: status,
        updatedAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'notifications'), {
        recipientRole: 'admin',
        recipientUid: 'admin',
        type: 'payment_received',
        title: 'Payment Recorded',
        message: `₹${paid.toLocaleString()} (${payForm.paymentMethod.toUpperCase()}) recorded for ${app.bookingCode}.`,
        relatedId: payRef.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      if (app.userId) {
        await addDoc(collection(db, 'notifications'), {
          recipientRole: 'customer',
          recipientUid: app.userId,
          type: 'payment_confirmed',
          title: 'Payment Receipt Updated',
          message: `Payment of ₹${paid.toLocaleString()} recorded for booking ${app.bookingCode}. Remaining balance: ₹${remaining.toLocaleString()}.`,
          relatedId: app.id,
          read: false,
          createdAt: serverTimestamp(),
        }).catch(() => {});
      }

      await onLog('Recorded payment', 'payment', payRef.id, `${app.bookingCode}: ₹${paid} (${status})`);
      toast.success('Payment recorded');
      setPayForm({
        appointmentId: '',
        totalAmount: '',
        advanceAmount: '',
        paymentMethod: 'upi',
        transactionRef: '',
        refundStatus: 'none',
        notes: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to record payment');
    }
  };

  // Save Business Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      let logoUrl = cfg.logoUrl || '';
      if (logoFile) {
        const fileRef = ref(storage, `branding/logo_${Date.now()}_${logoFile.name}`);
        await uploadBytes(fileRef, logoFile);
        logoUrl = await getDownloadURL(fileRef);
      }
      await setDoc(doc(db, 'businessSettings', 'default'), {
        ...cfg,
        logoUrl,
        defaultSlotDuration: Number(cfg.defaultSlotDuration) || 60,
        bookingAdvancePercent: Number(cfg.bookingAdvancePercent) || 25,
        updatedAt: serverTimestamp(),
      });
      await onLog('Updated business settings', 'businessSettings', 'default', 'Updated hours, branding & policies');
      setLogoFile(null);
      toast.success('Business settings saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (section === 'customers') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Customer CRM</h2>
            <p className="text-xs text-kd-muted">Registered clients, visits, total spending, and notes.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-kd-rosegold absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={custSearch}
                onChange={(e) => setCustSearch(e.target.value)}
                placeholder="Search customers..."
                className="pl-9 pr-3 py-2 rounded-xl bg-kd-surface border border-kd-rosegold/25 text-xs text-white"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                exportExcel(
                  'kd_customers_crm',
                  filteredCustomers.map((c) => ({
                    CustomerID: c.uid,
                    Name: c.displayName,
                    Email: c.email,
                    Phone: c.phone || '',
                    TotalVisits: c.totalVisits || 0,
                    TotalSpentINR: c.totalSpent || 0,
                    LoyaltyPoints: c.loyaltyPoints || 0,
                  }))
                )
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-kd-pink text-kd-black text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-kd-rosegold/20 text-[11px] uppercase text-kd-muted">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Visits</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4 text-right">CRM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-kd-rosegold/10">
                {filteredCustomers.map((c) => (
                  <tr key={c.uid}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{c.displayName}</div>
                      <div className="font-mono text-[10px] text-kd-muted">{c.uid.slice(0, 10)}...</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white">{c.email}</div>
                      <div className="text-kd-muted">{c.phone || '—'}</div>
                    </td>
                    <td className="py-3 px-4 tabular-nums">{c.totalVisits || 0}</td>
                    <td className="py-3 px-4 tabular-nums text-kd-pink font-semibold">
                      ₹{(c.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 tabular-nums">{c.loyaltyPoints || 0}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustNotes(c.notes || '');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-kd-rosegold/40 text-kd-pink hover:bg-white/5"
                      >
                        Profile &amp; History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedCustomer && (
          <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-kd-surface border border-kd-rosegold/40 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {selectedCustomer.displayName}
                  </h3>
                  <p className="text-xs text-kd-muted">
                    {selectedCustomer.email} · {selectedCustomer.phone || 'No phone'}
                  </p>
                </div>
                <button type="button" onClick={() => setSelectedCustomer(null)}>
                  <X className="w-4 h-4 text-kd-muted" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-kd-pink mb-1">CRM Notes</label>
                <textarea
                  rows={3}
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    await updateDoc(doc(db, 'userProfiles', selectedCustomer.uid), {
                      notes: custNotes.trim(),
                      updatedAt: serverTimestamp(),
                    });
                    await onLog('Updated CRM notes', 'userProfile', selectedCustomer.uid, selectedCustomer.displayName);
                    toast.success('CRM notes saved');
                  }}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-kd-pink text-kd-black text-xs font-semibold"
                >
                  Save Note
                </button>
              </div>
              <div>
                <div className="text-xs font-semibold text-kd-pink mb-2">
                  Booking History ({customerHistory.length})
                </div>
                <div className="space-y-2">
                  {customerHistory.map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-kd-black border border-kd-rosegold/20 text-xs flex justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{h.service}</div>
                        <div className="text-kd-muted">
                          {h.date} · {h.bookingCode}
                        </div>
                      </div>
                      <span className="text-kd-rosegold uppercase">{h.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (section === 'payments') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Payments &amp; Revenue</h2>
          <p className="text-xs text-kd-muted">Track advances, remaining balances, UPI/cash/bank refs, and refunds.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
            <div className="text-xs text-kd-muted">Total Collected</div>
            <div className="text-2xl font-serif font-bold text-kd-pink tabular-nums">
              ₹{paymentSummary.collected.toLocaleString()}
            </div>
          </div>
          <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
            <div className="text-xs text-kd-muted">Pending Balances</div>
            <div className="text-2xl font-serif font-bold text-white tabular-nums">
              ₹{paymentSummary.outstanding.toLocaleString()}
            </div>
          </div>
          <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
            <div className="text-xs text-kd-muted">Refunded</div>
            <div className="text-2xl font-serif font-bold text-kd-rosegold tabular-nums">
              ₹{paymentSummary.refunded.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleRecordPayment}
            className="lg:col-span-4 bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5 space-y-4 h-fit"
          >
            <h3 className="font-serif text-xl font-semibold text-white">Log Payment / Advance</h3>
            <select
              value={payForm.appointmentId}
              onChange={(e) => {
                const app = appointments.find((a) => a.id === e.target.value);
                setPayForm({
                  ...payForm,
                  appointmentId: e.target.value,
                  totalAmount: app ? String(app.price || 0) : '',
                });
              }}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            >
              <option value="">Select Appointment *</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bookingCode} — {a.name} ({a.service})
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Total Amount ₹ *"
                value={payForm.totalAmount}
                onChange={(e) => setPayForm({ ...payForm, totalAmount: e.target.value })}
                required
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              />
              <input
                type="number"
                placeholder="Paid / Advance ₹ *"
                value={payForm.advanceAmount}
                onChange={(e) => setPayForm({ ...payForm, advanceAmount: e.target.value })}
                required
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value as PaymentMethod })}
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online Payment</option>
              </select>
              <select
                value={payForm.refundStatus}
                onChange={(e) => setPayForm({ ...payForm, refundStatus: e.target.value as RefundStatus })}
                className="px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
              >
                <option value="none">No Refund</option>
                <option value="requested">Refund Requested</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Transaction Reference / UPI ID"
              value={payForm.transactionRef}
              onChange={(e) => setPayForm({ ...payForm, transactionRef: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-xs"
            >
              Save Payment Record
            </button>
          </form>

          <div className="lg:col-span-8 bg-kd-surface border border-kd-rosegold/25 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-kd-rosegold/20 text-[11px] uppercase text-kd-muted">
                    <th className="py-3 px-4">Booking &amp; Client</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Method / Ref</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-kd-rosegold/10">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-kd-muted">
                        No payment ledger entries yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 px-4">
                          <div className="font-mono text-kd-rosegold">{p.bookingCode}</div>
                          <div className="text-white">{p.customerName}</div>
                        </td>
                        <td className="py-3 px-4 tabular-nums">₹{p.totalAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 tabular-nums text-kd-pink font-semibold">
                          ₹{p.advanceAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 tabular-nums">₹{p.remainingBalance.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="uppercase">{p.paymentMethod.replace('_', ' ')}</div>
                          <div className="text-[10px] text-kd-muted">{p.transactionRef || '—'}</div>
                        </td>
                        <td className="py-3 px-4 uppercase text-kd-rosegold font-semibold">
                          {p.paymentStatus}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section === 'reports') {
    const todayStr = new Date().toISOString().slice(0, 10);
    const monthPrefix = todayStr.slice(0, 7);

    const reportConfigs = [
      {
        title: 'Daily Booking Report',
        desc: `All appointments scheduled for today (${todayStr}).`,
        rows: appointments.filter((a) => a.date === todayStr),
        type: 'bookings',
      },
      {
        title: 'Weekly Booking Report',
        desc: 'Appointments within the trailing 7 days.',
        rows: appointments.filter((a) => {
          const diff = Math.abs(Date.now() - new Date(`${a.date}T00:00:00`).getTime()) / (1000 * 3600 * 24);
          return diff <= 7;
        }),
        type: 'bookings',
      },
      {
        title: 'Monthly Booking Report',
        desc: `All appointments for ${monthPrefix}.`,
        rows: appointments.filter((a) => a.date?.startsWith(monthPrefix)),
        type: 'bookings',
      },
      {
        title: 'Revenue & Payment Report',
        desc: 'Complete payment ledger with collected, balance, and methods.',
        rows: payments,
        type: 'payments',
      },
      {
        title: 'Service-wise Report',
        desc: 'Booking counts and revenue grouped by service.',
        rows: Object.entries(
          appointments.reduce((acc, a) => {
            if (!acc[a.service]) acc[a.service] = { Service: a.service, Bookings: 0, RevenueINR: 0 };
            acc[a.service].Bookings += 1;
            if (a.status === 'completed') acc[a.service].RevenueINR += a.price || 0;
            return acc;
          }, {} as Record<string, { Service: string; Bookings: number; RevenueINR: number }>)
        ).map(([, v]) => v),
        type: 'services',
      },
      {
        title: 'Customer Report',
        desc: 'Registered customer CRM export with visits and spending.',
        rows: customers,
        type: 'customers',
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Business Reports &amp; Exports
          </h2>
          <p className="text-xs text-kd-muted">Download genuine Excel (.xlsx) and PDF reports from live data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reportConfigs.map((rep) => (
            <div
              key={rep.title}
              className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-6 flex flex-col justify-between space-y-5"
            >
              <div>
                <h3 className="font-serif text-xl font-bold text-white mb-1">{rep.title}</h3>
                <p className="text-xs text-kd-muted leading-relaxed">{rep.desc}</p>
                <div className="text-xs text-kd-pink font-semibold mt-3 tabular-nums">
                  {rep.rows.length} record(s)
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (rep.type === 'bookings') {
                      const bRows = (rep.rows as Appointment[]).map((a) => ({
                        BookingID: a.bookingCode,
                        Customer: a.name,
                        Phone: a.phone,
                        Service: a.service,
                        Date: a.date,
                        Time: a.time,
                        Status: a.status,
                        AmountINR: a.price || 0,
                      }));
                      exportExcel(rep.title.toLowerCase().replace(/\s+/g, '_'), bRows);
                    } else if (rep.type === 'payments') {
                      const pRows = (rep.rows as PaymentRecord[]).map((p) => ({
                        BookingID: p.bookingCode,
                        Customer: p.customerName,
                        TotalINR: p.totalAmount,
                        PaidINR: p.advanceAmount,
                        BalanceINR: p.remainingBalance,
                        Method: p.paymentMethod,
                        Status: p.paymentStatus,
                      }));
                      exportExcel('revenue_payment_report', pRows);
                    } else if (rep.type === 'customers') {
                      const cRows = (rep.rows as UserProfile[]).map((c) => ({
                        Name: c.displayName,
                        Email: c.email,
                        Phone: c.phone || '',
                        Visits: c.totalVisits || 0,
                        SpentINR: c.totalSpent || 0,
                        Points: c.loyaltyPoints || 0,
                      }));
                      exportExcel('customer_report', cRows);
                    } else {
                      exportExcel('service_wise_report', rep.rows as Record<string, any>[]);
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-kd-pink text-kd-black font-semibold text-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Excel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (rep.type === 'bookings') {
                      exportPdf(
                        rep.title,
                        ['Booking ID', 'Customer', 'Service', 'Date', 'Status', 'Amount'],
                        (rep.rows as Appointment[]).map((a) => [
                          a.bookingCode,
                          a.name,
                          a.service,
                          `${a.date} ${a.time}`,
                          a.status,
                          `INR ${a.price || 0}`,
                        ])
                      );
                    } else if (rep.type === 'payments') {
                      exportPdf(
                        rep.title,
                        ['Booking ID', 'Customer', 'Total', 'Paid', 'Balance', 'Status'],
                        (rep.rows as PaymentRecord[]).map((p) => [
                          p.bookingCode,
                          p.customerName,
                          `INR ${p.totalAmount}`,
                          `INR ${p.advanceAmount}`,
                          `INR ${p.remainingBalance}`,
                          p.paymentStatus,
                        ])
                      );
                    } else if (rep.type === 'customers') {
                      exportPdf(
                        rep.title,
                        ['Name', 'Email', 'Visits', 'Spent', 'Points'],
                        (rep.rows as UserProfile[]).map((c) => [
                          c.displayName,
                          c.email,
                          c.totalVisits || 0,
                          `INR ${c.totalSpent || 0}`,
                          c.loyaltyPoints || 0,
                        ])
                      );
                    } else {
                      exportPdf(
                        rep.title,
                        ['Service', 'Bookings', 'Revenue'],
                        (rep.rows as any[]).map((r) => [r.Service, r.Bookings, `INR ${r.RevenueINR}`])
                      );
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-kd-rosegold/40 text-kd-pink font-semibold text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Business Settings
  return (
    <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Business Settings</h2>
        <p className="text-xs text-kd-muted">
          Configure official studio logo, hours, breaks, holidays, slot duration, and policies.
        </p>
      </div>

      <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-kd-pink mb-1">Business Name</label>
            <input
              type="text"
              value={cfg.businessName}
              onChange={(e) => setCfg({ ...cfg, businessName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-kd-pink mb-1">Tagline</label>
            <input
              type="text"
              value={cfg.tagline}
              onChange={(e) => setCfg({ ...cfg, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-kd-pink mb-2">Official Studio Logo</label>
          <div className="flex flex-wrap items-center gap-4">
            <img
              src={cfg.logoUrl || '/kd-logo-round.png'}
              alt="Official Studio Logo Preview"
              className="w-16 h-16 rounded-full border border-kd-pink/40 bg-kd-black object-cover shrink-0"
            />
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-kd-rosegold/40 bg-kd-black text-xs text-kd-muted cursor-pointer">
              <Upload className="w-4 h-4 text-kd-pink" />
              <span>{logoFile ? logoFile.name : 'Replace official logo PNG/SVG'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-kd-pink mb-1">Phone</label>
            <input
              type="text"
              value={cfg.phone}
              onChange={(e) => setCfg({ ...cfg, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-kd-pink mb-1">WhatsApp Number (digits)</label>
            <input
              type="text"
              value={cfg.whatsappNumber}
              onChange={(e) => setCfg({ ...cfg, whatsappNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-kd-pink mb-1">Email</label>
            <input
              type="email"
              value={cfg.email}
              onChange={(e) => setCfg({ ...cfg, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-kd-pink mb-1">Studio Address</label>
          <input
            type="text"
            value={cfg.address}
            onChange={(e) => setCfg({ ...cfg, address: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
          />
        </div>

        <div>
          <span className="block text-xs text-kd-pink mb-2">Working Days</span>
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((day) => {
              const active = cfg.workingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setCfg({
                      ...cfg,
                      workingDays: active
                        ? cfg.workingDays.filter((d) => d !== day)
                        : [...cfg.workingDays, day],
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    active
                      ? 'bg-kd-pink text-kd-black border-kd-pink'
                      : 'bg-kd-black text-kd-muted border-kd-rosegold/25'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-kd-pink mb-1">Opening</label>
            <input
              type="time"
              value={cfg.openingTime}
              onChange={(e) => setCfg({ ...cfg, openingTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-kd-pink mb-1">Closing</label>
            <input
              type="time"
              value={cfg.closingTime}
              onChange={(e) => setCfg({ ...cfg, closingTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-kd-pink mb-1">Break Start</label>
            <input
              type="time"
              value={cfg.breakStart}
              onChange={(e) => setCfg({ ...cfg, breakStart: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-kd-pink mb-1">Break End</label>
            <input
              type="time"
              value={cfg.breakEnd}
              onChange={(e) => setCfg({ ...cfg, breakEnd: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-kd-pink mb-1">Slot Mins</label>
            <input
              type="number"
              min={15}
              step={15}
              value={cfg.defaultSlotDuration}
              onChange={(e) => setCfg({ ...cfg, defaultSlotDuration: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
          </div>
        </div>

        {/* Holidays */}
        <div>
          <span className="block text-xs text-kd-pink mb-1.5">Studio Holidays / Blocked Dates</span>
          <div className="flex gap-2 mb-2">
            <input
              type="date"
              value={holidayInput}
              onChange={(e) => setHolidayInput(e.target.value)}
              className="px-3 py-2 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
            />
            <button
              type="button"
              onClick={() => {
                if (holidayInput && !cfg.holidays.includes(holidayInput)) {
                  setCfg({ ...cfg, holidays: [...cfg.holidays, holidayInput] });
                  setHolidayInput('');
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-kd-rosegold/40 text-xs text-kd-pink"
            >
              <Plus className="w-3.5 h-3.5" /> Add Holiday
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cfg.holidays.map((h) => (
              <span
                key={h}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-kd-black border border-kd-rosegold/30 text-xs text-kd-muted"
              >
                {h}
                <button
                  type="button"
                  onClick={() => setCfg({ ...cfg, holidays: cfg.holidays.filter((d) => d !== h) })}
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-kd-pink mb-1">Cancellation Policy</label>
          <textarea
            rows={2}
            value={cfg.cancellationPolicy}
            onChange={(e) => setCfg({ ...cfg, cancellationPolicy: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-kd-black border border-kd-rosegold/30 text-xs text-white"
          />
        </div>

        <button
          type="submit"
          disabled={savingSettings}
          className="px-6 py-3 rounded-xl bg-kd-pink text-kd-black font-semibold text-sm hover:bg-kd-blush"
        >
          {savingSettings ? 'Saving Settings...' : 'Save Studio Configuration'}
        </button>
      </div>
    </form>
  );
}
