import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

export const Input = forwardRef(function Input({
  label,
  error,
  prefix,
  suffix,
  className,
  containerClassName,
  ...props
}, ref) {
  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-slate-500 select-none">{prefix}</span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
            'disabled:bg-slate-50 disabled:text-slate-400',
            error && 'border-red-400 focus:ring-red-400',
            prefix && 'pl-8',
            suffix && 'pr-8',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-sm text-slate-500 select-none">{suffix}</span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

export const MoneyInput = forwardRef(function MoneyInput({ currency, label, error, className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="relative flex items-center">
        <span className="absolute left-3 text-sm font-medium text-slate-500 select-none">{currency}</span>
        <input
          ref={ref}
          type="number"
          step="0.01"
          className={cn(
            'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pl-12 text-sm text-right font-mono text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
            error && 'border-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
