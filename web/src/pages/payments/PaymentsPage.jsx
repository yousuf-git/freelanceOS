import { useState } from 'react';
import { usePayments, useDeletePayment } from '../../hooks/usePayments';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatMoney } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePayments({ page, limit: 20 });
  const deletePayment = useDeletePayment();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Payments</h1>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Gross</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Platform Fee</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Net Received (PKR)</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Rate</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-4"><TableSkeleton rows={6} cols={5} /></td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No payments yet.</td></tr>
              ) : (
                data?.data?.map((pay, i) => (
                  <tr key={pay.id} className={cn('border-b border-slate-50 hover:bg-slate-50', i % 2 === 1 && 'bg-slate-50/50')}>
                    <td className="px-5 py-3 text-slate-600">{formatDate(pay.paidAt)}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {formatMoney(pay.gross.amountMinor, pay.gross.currency)}
                      {pay.isManualRate && (
                        <AlertTriangle className="inline h-3 w-3 text-amber-500 ml-1" title="Manual forex rate" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-600">
                      {pay.platformFeeMinor > 0 ? formatMoney(pay.platformFeeMinor, pay.gross.currency) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-green-600">
                      {formatMoney(pay.netReceived.baseAmountMinor, 'PKR', { compact: true })}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                      {pay.gross.forexRate !== 1 && `${pay.gross.currency}/PKR = ${pay.gross.forexRate}`}
                      <span className="ml-1 text-slate-300">({pay.gross.forexRateSource})</span>
                    </td>
                    <td className="px-4 py-3 group">
                      <button
                        onClick={() => deletePayment.mutate(pay.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5">
          <Pagination meta={data?.meta} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
