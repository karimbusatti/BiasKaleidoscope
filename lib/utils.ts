import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

export const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
};
