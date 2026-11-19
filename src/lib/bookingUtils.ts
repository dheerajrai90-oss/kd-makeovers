import { BusinessSettings } from '@/src/types';

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatTime12h(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function makeSlotKey(date: string, time: string): string {
  return `${date}_${time.replace(':', '-')}`;
}

export function computeOccupiedSlotKeys(
  date: string,
  startTime: string,
  durationMinutes: number,
  slotInterval = 30
): string[] {
  const start = timeToMinutes(startTime);
  const blocks = Math.max(1, Math.ceil(durationMinutes / slotInterval));
  const keys: string[] = [];
  for (let i = 0; i < blocks; i++) {
    keys.push(makeSlotKey(date, minutesToTime(start + i * slotInterval)));
  }
  return keys;
}

export function generateAvailableSlotsForDate(
  date: string,
  durationMinutes: number,
  settings: BusinessSettings,
  bookedSlotKeys: Set<string>
): { time: string; label: string; available: boolean; reason?: string }[] {
  if (!date) return [];

  const parsedDate = new Date(`${date}T00:00:00`);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[parsedDate.getDay()];

  if (settings.holidays?.includes(date)) {
    return [];
  }
  if (settings.workingDays && settings.workingDays.length > 0 && !settings.workingDays.includes(dayName)) {
    return [];
  }

  const openMin = timeToMinutes(settings.openingTime || '10:00');
  const closeMin = timeToMinutes(settings.closingTime || '20:30');
  const breakStartMin = settings.breakStart ? timeToMinutes(settings.breakStart) : -1;
  const breakEndMin = settings.breakEnd ? timeToMinutes(settings.breakEnd) : -1;

  const step = Math.min(30, settings.defaultSlotDuration || 30);
  const slots: { time: string; label: string; available: boolean; reason?: string }[] = [];

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let t = openMin; t + durationMinutes <= closeMin; t += step) {
    const timeStr = minutesToTime(t);
    const slotEnd = t + durationMinutes;

    // Check past time if today
    if (date === todayStr && t <= currentMinutes + 15) {
      slots.push({ time: timeStr, label: formatTime12h(timeStr), available: false, reason: 'Past' });
      continue;
    }

    // Check break overlap
    if (breakStartMin >= 0 && breakEndMin > breakStartMin) {
      const overlapsBreak = t < breakEndMin && slotEnd > breakStartMin;
      if (overlapsBreak) {
        slots.push({ time: timeStr, label: formatTime12h(timeStr), available: false, reason: 'Break' });
        continue;
      }
    }

    // Check booked slots overlap
    const requiredKeys = computeOccupiedSlotKeys(date, timeStr, durationMinutes, 30);
    const hasConflict = requiredKeys.some((k) => bookedSlotKeys.has(k));

    slots.push({
      time: timeStr,
      label: formatTime12h(timeStr),
      available: !hasConflict,
      reason: hasConflict ? 'Booked' : undefined,
    });
  }

  return slots;
}

export function generateBookingCode(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `KDM-${year}-${suffix}`;
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export async function createTrackingHash(bookingCode: string, phone: string): Promise<string> {
  const normalized = `${bookingCode.trim().toUpperCase()}::${normalizePhone(phone)}`;
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 40);
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const cleanNum = whatsappNumber.replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(message)}`;
}
