import { cn } from '../../lib/utils';

export function Card({ children, className, interactive = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 p-6',
        interactive && 'hover:shadow-sm transition-shadow cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-base font-semibold text-slate-900', className)}>
      {children}
    </h3>
  );
}
