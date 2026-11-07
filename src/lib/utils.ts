import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format Indian Rupee currency standard
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Human readable relative deadline
 */
export function formatDeadlineRelative(deadlineDateStr: string): { text: string; isUrgent: boolean } {
  const target = new Date(deadlineDateStr).getTime();
  const now = Date.now();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { text: 'Expired today', isUrgent: true };
  }
  if (diffDays === 1) {
    return { text: '1 day remaining', isUrgent: true };
  }
  if (diffDays <= 7) {
    return { text: `${diffDays} days remaining`, isUrgent: true };
  }
  return { text: `${diffDays} days remaining`, isUrgent: false };
}
