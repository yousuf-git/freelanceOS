import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, FileText, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useClient, useClientNotes, useAddClientNote, useDeleteClientNote } from '../../hooks/useClients';
import { useInvoices } from '../../hooks/useInvoices';
import { Card, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatMoney } from '../../lib/money';
import { formatDate, formatRelative } from '../../lib/dates';
import { getReliabilityBg, STATUS_LABELS, STATUS_COLORS, cn } from '../../lib/utils';

export default function ClientDetailPage() {
  const { id } = useParams();
  const { data: client, isLoading } = useClient(id);
  const { data: notesData } = useClientNotes(id);
  const { data: invoicesData } = useInvoices({ clientId: id, limit: 50 });
  const addNote = useAddClientNote(id);
  const deleteNote = useDeleteClientNote(id);
  const [noteBody, setNoteBody] = useState('');

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-32 w-full" /></div>;
  if (!client) return <p className="text-slate-500">Client not found.</p>;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteBody.trim()) return;
    await addNote.mutateAsync({ body: noteBody });
    setNoteBody('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/clients" className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium', getReliabilityBg(client.reliabilityScore))}>
          <Star className="h-3.5 w-3.5" /> {client.reliabilityScore}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Info */}
        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-4">Details</CardTitle>
            <div className="space-y-2 text-sm">
              {client.email && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-900">{client.email}</span>
                </div>
              )}
              {client.company && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Company</span>
                  <span className="text-slate-900">{client.company}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Currency</span>
                <Badge>{client.billingCurrency}</Badge>
              </div>
              {client.contractTerms && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Terms</span>
                  <span className="text-slate-700 text-right max-w-[160px]">{client.contractTerms}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Client since</span>
                <span className="text-slate-700">{formatDate(client.createdAt)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Financials</CardTitle>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Invoiced</span>
                <span className="font-mono text-slate-700">{formatMoney(client.stats?.totalInvoicedBaseMinor, 'PKR', { compact: true })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Received</span>
                <span className="font-mono font-semibold text-green-600">{formatMoney(client.stats?.totalReceivedBaseMinor, 'PKR', { compact: true })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Overdue invoices</span>
                {client.stats?.overdueCount > 0
                  ? <Badge variant="danger">{client.stats.overdueCount}</Badge>
                  : <span className="text-green-600 text-xs">None</span>
                }
              </div>
            </div>
          </Card>
        </div>

        {/* Invoices */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-0">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <CardTitle>Invoices</CardTitle>
              <Link to={`/invoices?clientId=${id}`}>
                <Button variant="ghost" size="sm"><FileText className="h-4 w-4" /> View all</Button>
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-slate-500">Number</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Status</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Amount</th>
                  <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Due</th>
                </tr>
              </thead>
              <tbody>
                {invoicesData?.data?.slice(0, 6).map(inv => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-2.5">
                      <Link to={`/invoices/${inv.id}`} className="font-mono text-teal-700 hover:underline">{inv.number}</Link>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={inv.status}>{STATUS_LABELS[inv.status]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                      {formatMoney(inv.totalMinor, inv.currency)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-500">
                      {formatDate(inv.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Notes */}
          <Card>
            <CardTitle className="mb-4">Notes</CardTitle>
            <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
              <input
                value={noteBody}
                onChange={e => setNoteBody(e.target.value)}
                placeholder="Add a note about this client…"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Button type="submit" size="sm" loading={addNote.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </form>
            <div className="space-y-3">
              {notesData?.data?.length === 0 && (
                <p className="text-sm text-slate-400">No notes yet.</p>
              )}
              {notesData?.data?.map(note => (
                <div key={note.id} className="flex gap-3 group">
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{note.body}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatRelative(note.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => deleteNote.mutate(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
