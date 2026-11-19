import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore';
import {
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  Gem,
  Image as ImageIcon,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
  Tag,
  Users,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { db, logout, signInWithGoogle } from '@/src/firebase';
import { useSalon } from '@/src/context/SalonContext';
import {
  ActivityLog,
  AppNotification,
  Appointment,
  PaymentRecord,
  Review,
  ServiceCategory,
  UserProfile,
} from '@/src/types';
import { KDLogo } from '../KDLogo';
import AdminOverview from './AdminOverview';
import AdminBookings from './AdminBookings';
import AdminCatalog from './AdminCatalog';
import AdminCRMAndPayments from './AdminCRMAndPayments';

type AdminTab =
  | 'dashboard'
  | 'bookings'
  | 'calendar'
  | 'customers'
  | 'services'
  | 'packages'
  | 'gallery'
  | 'offers'
  | 'payments'
  | 'reports'
  | 'settings';

const ADMIN_NAV: { id: AdminTab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'packages', label: 'Packages', icon: Gem },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'offers', label: 'Offers', icon: Tag },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, isAdmin, services, packages, gallery, offers, settings } = useSalon();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubs = [
      onSnapshot(query(collection(db, 'appointments'), orderBy('createdAt', 'desc')), (s) =>
        setAppointments(s.docs.map((d) => ({ id: d.id, ...d.data() } as Appointment)))
      ),
      onSnapshot(collection(db, 'userProfiles'), (s) =>
        setCustomers(s.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile)))
      ),
      onSnapshot(query(collection(db, 'payments'), orderBy('createdAt', 'desc')), (s) =>
        setPayments(s.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentRecord)))
      ),
      onSnapshot(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), (s) =>
        setAllReviews(s.docs.map((d) => ({ id: d.id, ...d.data() } as Review)))
      ),
      onSnapshot(collection(db, 'serviceCategories'), (s) =>
        setServiceCategories(s.docs.map((d) => ({ id: d.id, ...d.data() } as ServiceCategory)))
      ),
      onSnapshot(
        query(
          collection(db, 'notifications'),
          where('recipientRole', '==', 'admin'),
          orderBy('createdAt', 'desc')
        ),
        (s) => setNotifications(s.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification)))
      ),
      onSnapshot(query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc')), (s) =>
        setActivityLogs(s.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog)))
      ),
    ];

    return () => unsubs.forEach((u) => u());
  }, [isAdmin]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const logAdminActivity = async (
    action: string,
    entityType: string,
    entityId: string,
    details: string
  ) => {
    if (!user) return;
    await addDoc(collection(db, 'activityLogs'), {
      actorUid: user.uid,
      actorEmail: user.email || '',
      action,
      entityType,
      entityId,
      details,
      createdAt: serverTimestamp(),
    }).catch(() => {});
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-kd-black text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-kd-surface border border-kd-rosegold/40 rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-5">
            <KDLogo
              logoUrl={settings.logoUrl}
              businessName={settings.businessName}
              tagline="Studio Administration"
              size="lg"
              showTagline={true}
            />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-2">
            Authorized Administrator Access
          </h1>
          <p className="text-sm text-kd-muted mb-6 leading-relaxed">
            {user
              ? 'The currently signed-in Google account does not have administrator privileges.'
              : 'Sign in with a verified KD Makeovers administrator Google account to manage bookings, services, and reports.'}
          </p>
          <div className="space-y-3">
            {user ? (
              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-3 rounded-xl bg-kd-pink text-kd-black font-semibold text-sm"
              >
                Sign Out &amp; Switch Account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle().catch(() => toast.error('Sign in failed'))}
                className="w-full py-3 rounded-xl bg-kd-pink text-kd-black font-semibold text-sm inline-flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In with Administrator Google Account
              </button>
            )}
            <Link
              to="/"
              className="w-full py-2.5 rounded-xl border border-kd-rosegold/30 text-xs text-kd-muted hover:text-white inline-flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Customer App
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kd-black text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-kd-surface border-r border-kd-rosegold/25 sticky top-0 h-screen">
        <div className="p-5 border-b border-kd-rosegold/20">
          <KDLogo
            logoUrl={settings.logoUrl}
            businessName={settings.businessName}
            tagline="Admin Suite"
            size="sm"
            showTagline={true}
          />
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-kd-pink text-kd-black font-semibold'
                    : 'text-kd-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-kd-rosegold/20 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-kd-rosegold/30 text-xs text-kd-pink hover:bg-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Customer Storefront
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-kd-muted hover:text-white"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 px-4 sm:px-6 border-b border-kd-rosegold/20 bg-kd-black/95 sticky top-0 z-40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-kd-pink border border-kd-rosegold/30"
              aria-label="Toggle Admin Menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-kd-muted">
              <BarChart3 className="w-4 h-4 text-kd-rosegold hidden sm:block" />
              <span>Admin</span>
              <span>/</span>
              <span className="text-white font-semibold capitalize">{activeTab}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="relative p-2.5 rounded-xl bg-kd-surface border border-kd-rosegold/30 text-kd-pink hover:border-kd-pink"
              aria-label="Admin Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-kd-pink text-kd-black text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto bg-kd-surface border border-kd-rosegold/40 rounded-2xl p-4 shadow-2xl z-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Studio Notifications</span>
                  <button
                    type="button"
                    onClick={() => setShowNotifPanel(false)}
                    className="text-xs text-kd-muted"
                  >
                    Close
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-kd-muted py-4 text-center">No notifications yet.</p>
                ) : (
                  notifications.slice(0, 15).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => n.id && updateDoc(doc(db, 'notifications', n.id), { read: true })}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs ${
                        n.read
                          ? 'bg-kd-black/50 border-white/5 text-kd-muted'
                          : 'bg-kd-black border-kd-pink/40 text-white'
                      }`}
                    >
                      <div className="font-semibold text-kd-pink">{n.title}</div>
                      <div className="mt-0.5 text-[11px]">{n.message}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </header>

        {/* Mobile Admin Nav Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-kd-surface border-b border-kd-rosegold/25 p-3 grid grid-cols-2 gap-1.5">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium ${
                    activeTab === item.id
                      ? 'bg-kd-pink text-kd-black font-semibold'
                      : 'text-kd-muted bg-kd-black/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Admin Module */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <AdminOverview
              appointments={appointments}
              customers={customers}
              payments={payments}
              activityLogs={activityLogs}
            />
          )}
          {(activeTab === 'bookings' || activeTab === 'calendar') && (
            <AdminBookings
              mode={activeTab === 'calendar' ? 'calendar' : 'list'}
              appointments={appointments}
              settings={settings}
              onLog={logAdminActivity}
            />
          )}
          {(activeTab === 'services' ||
            activeTab === 'packages' ||
            activeTab === 'gallery' ||
            activeTab === 'offers') && (
            <AdminCatalog
              section={activeTab}
              services={services}
              serviceCategories={serviceCategories}
              packages={packages}
              gallery={gallery}
              reviews={allReviews}
              offers={offers}
              onLog={logAdminActivity}
            />
          )}
          {(activeTab === 'customers' ||
            activeTab === 'payments' ||
            activeTab === 'reports' ||
            activeTab === 'settings') && (
            <AdminCRMAndPayments
              section={activeTab}
              customers={customers}
              appointments={appointments}
              payments={payments}
              settings={settings}
              onLog={logAdminActivity}
            />
          )}
        </main>
      </div>
    </div>
  );
}
