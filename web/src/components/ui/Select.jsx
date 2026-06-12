import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

export const Select = forwardRef(function Select({
  label,
  error,
  children,
  className,
  containerClassName,
  ...props
}, ref) {
  return (
    <div className={cn('flex flex-col gap-1', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
          'disabled:bg-slate-50',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
