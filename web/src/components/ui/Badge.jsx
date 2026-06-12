import { cn } from '../../lib/utils';

export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-cyan-100 text-cyan-700',
    teal: 'bg-teal-100 text-teal-700',
    paid: 'bg-green-100 text-green-700',
    sent: 'bg-cyan-100 text-cyan-700',
    partially_paid: 'bg-teal-100 text-teal-700',
    overdue: 'bg-red-100 text-red-700',
    draft: 'bg-slate-100 text-slate-600',
    void: 'bg-slate-200 text-slate-500',
    current: 'bg-slate-100 text-slate-600',
    d30: 'bg-amber-100 text-amber-700',
    d60: 'bg-orange-100 text-orange-700',
    d90plus: 'bg-red-100 text-red-700',
  };
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variants[variant] || variants.default,
      className
    )}>
      {children}
    </span>
  );
}
