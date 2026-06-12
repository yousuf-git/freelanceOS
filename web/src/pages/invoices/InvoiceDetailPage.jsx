import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, FileX, Trash2, Download, CreditCard, Bell } from 'lucide-react';
import { useInvoice, useSendInvoice, useVoidInvoice, useDeleteInvoice, useGenerateInvoicePdf } from '../../hooks/useInvoices';
import { usePayments, useDeletePayment } from '../../hooks/usePayments';
import { useReminders, useCreateReminder, useUpdateReminder } from '../../hooks/useOverdue';
import { useClients } from '../../hooks/useClients';
import { usePlatforms } from '../../hooks/usePlatforms';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatMoney } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { STATUS_LABELS, cn } from '../../lib/utils';
import PaymentForm from '../payments/PaymentForm';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const { data: paymentsData } = usePayments({ invoiceId: id });
  const { data: remindersData } = useReminders(id);
  const sendInvoice = useSendInvoice();
  const voidInvoice = useVoidInvoice();
  const deleteInvoice = useDeleteInvoice();
  const generatePdf = useGenerateInvoicePdf();
  const deletePayment = useDeletePayment();
  const createReminder = useCreateReminder(id);
  const updateReminder = useUpdateReminder();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const { data: clientsData } = useClients({ limit: 100 });
  const { data: platformsData } = usePlatforms({ limit: 50 });

  if (isLoading) return <div><Skeleton className="h-64 w-full" /></div>;
  if (!invoice) return <p className="text-slate-500">Invoice not found.</p>;

  const clientName = clientsData?.data?.find(c => c.id === invoice.clientId)?.name || invoice.clientId;
  const platformName = platformsData?.data?.find(p => p.id === invoice.platformId)?.name || invoice.platformId;
  const canRecord = ['sent', 'partially_paid', 'overdue'].includes(invoice.status);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/invoices" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-slate-900 font-mono">{invoice.number}</h1>
        <Badge variant={invoice.status}>{STATUS_LABELS[invoice.status]}</Badge>
        <div className="ml-auto flex items-center gap-2">
          {invoice.status === 'draft' && (
            <Button variant="secondary" size="sm" onClick={() => sendInvoice.mutate(id)} loading={sendInvoice.isPending}>
              <Send className="h-4 w-4" /> Send
            </Button>
          )}
          {canRecord && (
            <Button size="sm" onClick={() => setShowPaymentModal(true)}>
              <CreditCard className="h-4 w-4" /> Record Payment
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => generatePdf.mutate(id)} loading={generatePdf.isPending}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          {['sent', 'draft'].includes(invoice.status) && invoice.amountPaidMinor === 0 && (
            <Button variant="danger" size="sm" onClick={() => voidInvoice.mutate(id)}>
              <FileX className="h-4 w-4" /> Void
            </Button>
          )}
          {invoice.status === 'draft' && (
            <Button variant="danger" size="sm" onClick={async () => { await deleteInvoice.mutateAsync(id); navigate('/invoices'); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Invoice detail */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-sm text-slate-500">Bill to</p>
                <p className="font-semibold text-slate-900">{clientName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Platform</p>
                <p className="font-medium text-slate-700">{platformName}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-5 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Issue Date</p>
                <p className="font-medium">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Due Date</p>
                <p className={cn('font-medium', invoice.overdueDays > 0 && 'text-red-600')}>
                  {formatDate(invoice.dueDate)}
                  {invoice.overdueDays > 0 && ` (+${invoice.overdueDays}d)`}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Currency</p>
                <Badge>{invoice.currency}</Badge>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs text-slate-500">Description</th>
                  <th className="text-right py-2 text-xs text-slate-500">Qty</th>
                  <th className="text-right py-2 text-xs text-slate-500">Unit Price</th>
                  <th className="text-right py-2 text-xs text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((li, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-700">{li.description}</td>
                    <td className="py-2.5 text-right font-mono">{li.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-slate-500">{formatMoney(li.unitPriceMinor, invoice.currency)}</td>
                    <td className="py-2.5 text-right font-mono font-semibold">{formatMoney(li.amountMinor, invoice.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col items-end gap-1 text-sm">
              <div className="flex justify-between w-48">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-mono">{formatMoney(invoice.subtotalMinor, invoice.currency)}</span>
              </div>
              {invoice.taxOnInvoiceMinor > 0 && (
                <div className="flex justify-between w-48">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-mono">{formatMoney(invoice.taxOnInvoiceMinor, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between w-48 pt-1 border-t border-slate-100">
                <span className="font-semibold">Total</span>
                <span className="font-mono font-bold text-slate-900">{formatMoney(invoice.totalMinor, invoice.currency)}</span>
              </div>
              {invoice.amountPaidMinor > 0 && (
                <div className="flex justify-between w-48 text-green-600">
                  <span>Paid</span>
                  <span className="font-mono">−{formatMoney(invoice.amountPaidMinor, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between w-48 pt-1">
                <span className="font-semibold text-base">Due</span>
                <span className={cn('font-mono font-bold text-base', invoice.amountDueMinor === 0 ? 'text-green-600' : 'text-slate-900')}>
                  {invoice.amountDueMinor === 0 ? 'PAID' : formatMoney(invoice.amountDueMinor, invoice.currency)}
                </span>
              </div>
            </div>

            {invoice.notes && (
              <p className="mt-4 text-sm text-slate-500 border-t border-slate-100 pt-3">{invoice.notes}</p>
            )}
          </Card>
        </div>

        {/* Payments + Reminders */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-4">Payments</CardTitle>
            {paymentsData?.data?.length === 0 && (
              <p className="text-sm text-slate-400">No payments recorded.</p>
            )}
            {paymentsData?.data?.map(pay => (
              <div key={pay.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 group">
                <div className="flex-1">
                  <p className="text-sm font-mono font-semibold text-green-600">
                    {formatMoney(pay.gross.amountMinor, pay.gross.currency)}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(pay.paidAt)}</p>
                  {pay.isManualRate && <span className="text-xs text-amber-600">Manual rate</span>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-mono">
                    Net: {formatMoney(pay.netReceived.baseAmountMinor, 'PKR', { compact: true })}
                  </p>
                  <p className="text-xs text-slate-400">Fee: {formatMoney(pay.platformFeeMinor, pay.gross.currency)}</p>
                </div>
                <button
                  onClick={() => deletePayment.mutate(pay.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </Card>

          {/* Reminders */}
          {invoice.status === 'overdue' && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Reminders</CardTitle>
                <Button size="xs" variant="secondary" onClick={() => createReminder.mutate({})} loading={createReminder.isPending}>
                  <Bell className="h-3.5 w-3.5" /> Add
                </Button>
              </div>
              {remindersData?.data?.length === 0 && (
                <p className="text-sm text-slate-400">No reminders yet.</p>
              )}
              {remindersData?.data?.map(rem => (
                <div key={rem.id} className="py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Step {rem.sequenceStep} · {rem.channel}</span>
                    {rem.status === 'pending' ? (
                      <button
                        onClick={() => updateReminder.mutate({ id: rem.id, status: 'sent' })}
                        className="text-xs text-teal-600 hover:underline"
                      >
                        Mark sent
                      </button>
                    ) : (
                      <Badge variant={rem.status === 'sent' ? 'success' : 'default'}>{rem.status}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{rem.suggestedAction}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment">
        <PaymentForm invoice={invoice} onSuccess={() => setShowPaymentModal(false)} />
      </Modal>
    </div>
  );
}
