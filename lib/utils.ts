import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { PropertyRoomInventory, PropertyRoomSummary } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as VND currency
 * @param value - The value to format (any currency will be treated as VND equivalent)
 * @param compact - Use compact notation (e.g., ₫45M instead of ₫45,000,000)
 */
export function formatVND(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `₫${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `₫${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `₫${(value / 1_000).toFixed(0)}K`;
    }
    return `₫${value.toLocaleString('en-US')}`;
  }
  return `₫${value.toLocaleString('en-US')}`;
}

/**
 * Format relative time in compact form (e.g., "12m", "3h", "2d")
 */
export function formatSyncAge(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}

/**
 * Get dynamic rolling dates for the next N days
 */
export function getRollingDates(days: number = 14): Array<{
  date: string;
  dayName: string;
  dayNum: number;
  monthShort: string;
  isWeekend: boolean;
  isToday: boolean;
}> {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      isToday: i === 0,
    };
  });
}

/**
 * Compute summary metrics from a property's room inventory.
 */
export function computeRoomSummary(rooms: PropertyRoomInventory[] | undefined): PropertyRoomSummary {
  const list = rooms ?? [];
  const validRooms = list.filter((r) => r.quantity > 0);
  const totalInventory = validRooms.reduce((s, r) => s + (r.quantity || 0), 0);
  const totalSleeps = validRooms.reduce((s, r) => s + (r.quantity || 0) * (r.capacity || 0), 0);
  const prices = validRooms.map((r) => r.sellingPrice).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgCapacity = totalInventory > 0 ? Number((totalSleeps / totalInventory).toFixed(1)) : 0;
  return {
    roomTypeCount: list.length,
    totalInventory,
    minPrice,
    maxPrice,
    avgCapacity,
    totalSleeps,
  };
}

export interface RoomRowValidation {
  hasErrors: boolean;
  errors: { rowIndex: number; field: string; message: string }[];
  warnings: string[];
}

/**
 * Validate the room inventory rows entered in Add Property / Edit Property.
 */
export function validateRoomInventory(rooms: Pick<PropertyRoomInventory, 'name' | 'quantity' | 'sellingPrice' | 'beds' | 'capacity'>[]): RoomRowValidation {
  const errors: RoomRowValidation['errors'] = [];
  const warnings: string[] = [];

  rooms.forEach((r, i) => {
    if (!r.name || !r.name.trim()) {
      errors.push({ rowIndex: i, field: 'name', message: 'Room name is required' });
    }
    if (!r.quantity || r.quantity < 1) {
      errors.push({ rowIndex: i, field: 'quantity', message: 'Quantity must be at least 1' });
    }
    if (r.sellingPrice == null || r.sellingPrice < 0) {
      errors.push({ rowIndex: i, field: 'sellingPrice', message: 'Selling price must be 0 or higher' });
    }
    if (!r.beds || r.beds < 1) {
      errors.push({ rowIndex: i, field: 'beds', message: 'Beds must be at least 1' });
    }
    if (!r.capacity || r.capacity < 1) {
      errors.push({ rowIndex: i, field: 'capacity', message: 'Capacity must be at least 1' });
    }
  });

  if (rooms.length === 0) warnings.push('No room types defined — property will have zero sellable inventory');
  const names = rooms.map((r) => (r.name || '').trim().toLowerCase()).filter(Boolean);
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupes.length) warnings.push(`Duplicate room name: ${[...new Set(dupes)].join(', ')}`);
  const zeroPriced = rooms.filter((r) => (r.sellingPrice ?? 0) === 0).length;
  if (zeroPriced > 0) warnings.push(`${zeroPriced} room type(s) have a selling price of 0`);

  return { hasErrors: errors.length > 0, errors, warnings };
}
