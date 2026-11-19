import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ActivityLog, Appointment, PaymentRecord, UserProfile } from '@/src/types';

interface AdminOverviewProps {
  appointments: Appointment[];
  customers: UserProfile[];
  payments: PaymentRecord[];
  activityLogs: ActivityLog[];
}

export default function AdminOverview({
  appointments,
  customers,
  payments,
  activityLogs,
}: AdminOverviewProps) {
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const currentMonthPrefix = todayStr.slice(0, 7);

  const filteredAppointments = useMemo(() => {
    if (dateFilter === 'all') return appointments;
    const now = new Date();
    return appointments.filter((a) => {
      if (!a.date) return false;
      if (dateFilter === 'today') return a.date === todayStr;
      if (dateFilter === 'month') return a.date.startsWith(currentMonthPrefix);
      if (dateFilter === 'week') {
        const diffDays = (now.getTime() - new Date(`${a.date}T00:00:00`).getTime()) / (1000 * 3600 * 24);
        return Math.abs(diffDays) <= 7;
      }
      return true;
    });
  }, [appointments, dateFilter, todayStr, currentMonthPrefix]);

  const metrics = useMemo(() => {
    const todayCount = appointments.filter((a) => a.date === todayStr && a.status !== 'cancelled').length;
    const upcomingCount = appointments.filter(
      (a) => a.date >= todayStr && ['pending', 'confirmed', 'rescheduled'].includes(a.status)
    ).length;
    const pendingCount = filteredAppointments.filter((a) => a.status === 'pending').length;
    const completedCount = filteredAppointments.filter((a) => a.status === 'completed').length;
    const cancelledCount = filteredAppointments.filter((a) =>
      ['cancelled', 'no_show'].includes(a.status)
    ).length;

    const monthlyRevenue = payments
      .filter((p) => {
        const dt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date();
        const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        return ym === currentMonthPrefix && p.paymentStatus !== 'refunded';
      })
      .reduce((acc, p) => acc + (p.advanceAmount || 0), 0);

    const completedRevenueFallback =
      monthlyRevenue > 0
        ? monthlyRevenue
        : appointments
            .filter((a) => a.date?.startsWith(currentMonthPrefix) && a.status === 'completed')
            .reduce((acc, a) => acc + (a.price || 0), 0);

    return {
      total: filteredAppointments.length,
      todayCount,
      upcomingCount,
      pendingCount,
      completedCount,
      cancelledCount,
      monthlyRevenue: completedRevenueFallback,
      totalCustomers: customers.length,
    };
  }, [appointments, filteredAppointments, payments, customers, todayStr, currentMonthPrefix]);

  const dailyBookingsChart = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAppointments.forEach((a) => {
      if (!a.date) return;
      map[a.date] = (map[a.date] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([d1], [d2]) => d1.localeCompare(d2))
      .slice(-14)
      .map(([date, bookings]) => ({ date: date.slice(5), bookings }));
  }, [filteredAppointments]);

  const monthlyTrendChart = useMemo(() => {
    const map: Record<string, { bookings: number; revenue: number }> = {};
    appointments.forEach((a) => {
      if (!a.date) return;
      const ym = a.date.slice(0, 7);
      if (!map[ym]) map[ym] = { bookings: 0, revenue: 0 };
      map[ym].bookings += 1;
      if (a.status === 'completed') {
        map[ym].revenue += a.price || 0;
      }
    });
    return Object.entries(map)
      .sort(([m1], [m2]) => m1.localeCompare(m2))
      .slice(-6)
      .map(([month, val]) => ({ month, ...val }));
  }, [appointments]);

  const servicePopularityChart = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAppointments.forEach((a) => {
      const key = a.service || 'Other';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name: name.length > 18 ? `${name.slice(0, 16)}..` : name,
        count,
      }));
  }, [filteredAppointments]);

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Studio Performance Overview
          </h2>
          <p className="text-xs text-kd-muted">Live metrics synced from bookings, payments, and CRM.</p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-kd-surface border border-kd-rosegold/25 w-fit">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: '7 Days' },
            { id: 'month', label: 'This Month' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setDateFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateFilter === f.id ? 'bg-kd-pink text-kd-black' : 'text-kd-muted hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: metrics.total },
          { label: "Today's Appointments", value: metrics.todayCount },
          { label: 'Upcoming Sessions', value: metrics.upcomingCount },
          { label: 'Pending Requests', value: metrics.pendingCount },
          { label: 'Completed Visits', value: metrics.completedCount },
          { label: 'Cancelled / No Show', value: metrics.cancelledCount },
          { label: 'Monthly Revenue', value: `₹${metrics.monthlyRevenue.toLocaleString()}` },
          { label: 'Registered Customers', value: metrics.totalCustomers },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5"
          >
            <div className="text-xs text-kd-muted mb-1.5">{kpi.label}</div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-kd-pink tabular-nums">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
          <h3 className="font-serif text-lg font-semibold text-white mb-4">Daily Bookings</h3>
          <div className="h-64 w-full">
            {dailyBookingsChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-kd-muted">
                No booking data for selected filter.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyBookingsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,137,112,0.15)" />
                  <XAxis dataKey="date" stroke="#C9BDBD" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="#C9BDBD" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101010',
                      borderColor: '#B88970',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="bookings" fill="#F0CECF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
          <h3 className="font-serif text-lg font-semibold text-white mb-4">
            Monthly Revenue &amp; Bookings Trend
          </h3>
          <div className="h-64 w-full">
            {monthlyTrendChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-kd-muted">
                Monthly trend appears once appointments are recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,137,112,0.15)" />
                  <XAxis dataKey="month" stroke="#C9BDBD" fontSize={11} />
                  <YAxis stroke="#C9BDBD" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101010',
                      borderColor: '#B88970',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B88970"
                    fill="rgba(240,206,207,0.22)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
          <h3 className="font-serif text-lg font-semibold text-white mb-4">Popular Services</h3>
          <div className="h-64 w-full">
            {servicePopularityChart.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-kd-muted">
                No service bookings yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicePopularityChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(184,137,112,0.15)" />
                  <XAxis type="number" allowDecimals={false} stroke="#C9BDBD" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={120} stroke="#C9BDBD" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101010',
                      borderColor: '#B88970',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#B88970" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Admin Activities */}
        <div className="bg-kd-surface border border-kd-rosegold/25 rounded-2xl p-5">
          <h3 className="font-serif text-lg font-semibold text-white mb-4">Recent Studio Activity</h3>
          {activityLogs.length === 0 ? (
            <p className="text-xs text-kd-muted py-8 text-center">
              Administrative actions (status changes, catalogue edits, payments) will appear here.
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activityLogs.slice(0, 12).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-kd-black border border-kd-rosegold/15 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-semibold text-kd-pink">{log.action}</div>
                    <div className="text-xs text-kd-muted mt-0.5">{log.details}</div>
                  </div>
                  <span className="text-[10px] text-kd-rosegold whitespace-nowrap">{log.entityType}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
