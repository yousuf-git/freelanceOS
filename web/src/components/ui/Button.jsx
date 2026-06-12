import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-teal-700 hover:bg-teal-800 text-white',
    secondary: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    danger: 'border border-red-200 text-red-600 hover:bg-red-50',
    'danger-solid': 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-slate-100 text-slate-600',
    link: 'text-teal-700 hover:underline p-0 h-auto',
  };

  const sizes = {
    xs: 'h-7 px-2.5 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
