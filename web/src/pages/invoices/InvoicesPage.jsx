import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Filter, Send, Trash2, X } from 'lucide-react';
import { useInvoices, useDeleteInvoice, useSendInvoice } from '../../hooks/useInvoices';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { formatMoney } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { STATUS_LABELS, STATUS_COLORS, AGING_LABELS, AGING_COLORS, cn } from '../../lib/utils';
import InvoiceForm from './InvoiceForm';

const STATUS_OPTS = ['', 'draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void'];

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [clientId] = useState(searchParams.get('clientId') || '');
  const [showCreate, setShowCreate] = useState(false);
  const deleteInvoice = useDeleteInvoice();
  const sendInvoice = useSendInvoice();

  const { data, isLoading } = useInvoices({
    page, limit: 20,
    status: status || undefined,
    clientId: clientId || undefined,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Invoice
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-3 flex items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <Select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="w-40"
        >
          <option value="">All statuses</option>
          {STATUS_OPTS.filter(Boolean).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </Select>
        {status && (
          <button onClick={() => setStatus('')} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Invoice</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Aging</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Total</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Due</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Amount Due</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-4"><TableSkeleton rows={6} cols={6} /></td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No invoices found.</td></tr>
              ) : (
                data?.data?.map((inv, i) => (
                  <tr
                    key={inv.id}
                    className={cn('border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors', i % 2 === 1 && 'bg-slate-50/50')}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <td className="px-5 py-3">
                      <p className="font-mono font-medium text-teal-700">{inv.number}</p>
                      <p className="text-xs text-slate-400">{formatDate(inv.issueDate)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={inv.status}>{STATUS_LABELS[inv.status]}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {inv.overdueDays > 0 ? (
                        <Badge variant={inv.agingBucket}>{AGING_LABELS[inv.agingBucket]} ({inv.overdueDays}d)</Badge>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {formatMoney(inv.totalMinor, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                      {inv.amountDueMinor > 0 ? formatMoney(inv.amountDueMinor, inv.currency) : <span className="text-green-600">Paid</span>}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => sendInvoice.mutate(inv.id)}
                            className="p-1.5 rounded hover:bg-teal-50 text-slate-300 hover:text-teal-600 transition-colors"
                            title="Send"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => deleteInvoice.mutate(inv.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Invoice" size="lg">
        <InvoiceForm onSuccess={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
