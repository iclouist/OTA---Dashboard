import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
