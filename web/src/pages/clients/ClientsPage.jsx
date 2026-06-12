import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Star, Trash2 } from 'lucide-react';
import { useClients, useDeleteClient } from '../../hooks/useClients';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { formatMoney } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { getReliabilityBg, cn } from '../../lib/utils';
import ClientForm from './ClientForm';

export default function ClientsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const deleteClient = useDeleteClient();

  const { data, isLoading } = useClients({ page, limit: 20, search: search || undefined });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Client
        </Button>
      </div>

      {/* Search */}
      <Card className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search clients…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Currency</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Total Invoiced</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Total Received</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Reliability</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Overdue</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-4"><TableSkeleton rows={5} cols={6} /></td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No clients yet. Add your first client.</td></tr>
              ) : (
                data?.data?.map((client, i) => (
                  <tr
                    key={client.id}
                    className={cn('border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors', i % 2 === 1 && 'bg-slate-50/50')}
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-400">{client.company || client.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{client.billingCurrency}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      {formatMoney(client.stats?.totalInvoicedBaseMinor, 'PKR', { compact: true })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-green-600 font-semibold">
                      {formatMoney(client.stats?.totalReceivedBaseMinor, 'PKR', { compact: true })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', getReliabilityBg(client.reliabilityScore))}>
                        <Star className="h-3 w-3" />{client.reliabilityScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {client.stats?.overdueCount > 0 ? (
                        <Badge variant="danger">{client.stats.overdueCount}</Badge>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => deleteClient.mutate(client.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Client">
        <ClientForm onSuccess={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
