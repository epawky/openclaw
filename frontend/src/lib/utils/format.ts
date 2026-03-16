import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format currency values
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercent(
  value: number,
  options?: { decimals?: number; showSign?: boolean }
): string {
  const { decimals = 1, showSign = false } = options || {};
  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatCompact(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

/**
 * Format a number with locale-specific separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date string or Date object
 */
export function formatDate(
  date: string | Date,
  formatStr: string = 'MMM d, yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Format a date for display with time
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format days remaining (for inventory)
 */
export function formatDaysRemaining(days: number): string {
  if (days < 0) return 'Out of stock';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} weeks`;
  return `${Math.round(days / 30)} months`;
}

/**
 * Get delta display with arrow and formatting
 */
export function formatDelta(
  current: number,
  previous: number,
  type: 'percent' | 'absolute' = 'percent'
): { value: string; isPositive: boolean; isZero: boolean } {
  if (previous === 0) {
    return { value: 'N/A', isPositive: true, isZero: true };
  }

  const delta =
    type === 'percent'
      ? ((current - previous) / previous) * 100
      : current - previous;

  const isPositive = delta >= 0;
  const isZero = Math.abs(delta) < 0.01;

  const formatted =
    type === 'percent' ? formatPercent(delta, { showSign: true }) : formatCompact(delta);

  return { value: formatted, isPositive, isZero };
}
