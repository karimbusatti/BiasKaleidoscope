import { cn } from '@/lib/utils';

const colorClasses: Record<'green' | 'amber' | 'red', string> = {
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-rose-100 text-rose-700 border-rose-200'
};

export function StatusBadge({ status }: { status: 'green' | 'amber' | 'red' }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium', colorClasses[status])}>
      {status.toUpperCase()}
    </span>
  );
}
