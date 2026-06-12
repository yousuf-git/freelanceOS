import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between py-3 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors',
            page <= 1 && 'opacity-40 pointer-events-none'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-3 text-sm text-slate-600">{page} / {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            'p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors',
            page >= totalPages && 'opacity-40 pointer-events-none'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
