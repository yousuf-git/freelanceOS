import { useState } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useExpenses, useDeleteExpense, useExpenseCategorySummary } from '../../hooks/useExpenses';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { formatMoney } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { CATEGORY_LABELS, PLATFORM_COLORS, cn } from '../../lib/utils';
import ExpenseForm from './ExpenseForm';

const CATEGORY_OPTS = ['', 'software', 'hardware', 'internet', 'coworking', 'marketing', 'fees', 'travel', 'other'];

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [isBusiness, setIsBusiness] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const deleteExpense = useDeleteExpense();

  const { data, isLoading } = useExpenses({ page, limit: 20, category: category || undefined, isBusiness: isBusiness || undefined });
  const { data: summary } = useExpenseCategorySummary();

  const pieData = summary?.byCategory?.map((c, i) => ({
    name: CATEGORY_LABELS[c.category] || c.category,
    value: c.deductibleBaseMinor,
    fill: PLATFORM_COLORS[i % PLATFORM_COLORS.length],
  })) || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Add Expense</Button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardTitle className="mb-4">By Category (Deductible)</CardTitle>
            <div className="space-y-2">
              {summary.byCategory.map((c, i) => {
                const pct = summary.deductibleBaseMinor ? Math.round((c.deductibleBaseMinor / summary.deductibleBaseMinor) * 100) : 0;
                return (
                  <div key={c.category} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-slate-600">{CATEGORY_LABELS[c.category]}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PLATFORM_COLORS[i % PLATFORM_COLORS.length] }} />
                    </div>
                    <span className="text-xs font-mono text-slate-600 w-28 text-right">{formatMoney(c.deductibleBaseMinor, 'PKR', { compact: true })}</span>
                    <span className="text-xs text-slate-400 w-6">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <CardTitle className="mb-3">Totals</CardTitle>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total expenses</span>
                <span className="font-mono font-semibold">{formatMoney(summary.totalBaseMinor, 'PKR', { compact: true })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deductible</span>
                <span className="font-mono font-semibold text-green-600">{formatMoney(summary.deductibleBaseMinor, 'PKR', { compact: true })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Non-deductible</span>
                <span className="font-mono text-slate-500">{formatMoney(summary.totalBaseMinor - summary.deductibleBaseMinor, 'PKR', { compact: true })}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-3 flex items-center gap-3 flex-wrap">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="w-36">
          <option value="">All categories</option>
          {CATEGORY_OPTS.filter(Boolean).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </Select>
        <Select value={isBusiness} onChange={e => { setIsBusiness(e.target.value); setPage(1); }} className="w-36">
          <option value="">All types</option>
          <option value="true">Business</option>
          <option value="false">Personal</option>
        </Select>
        {(category || isBusiness) && (
          <button onClick={() => { setCategory(''); setIsBusiness(''); }} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase">Expense</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase">PKR Equiv</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-4"><TableSkeleton rows={5} cols={6} /></td></tr>
              ) : data?.data?.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No expenses yet.</td></tr>
              ) : (
                data?.data?.map((exp, i) => (
                  <tr key={exp.id} className={cn('border-b border-slate-50 hover:bg-slate-50', i % 2 === 1 && 'bg-slate-50/50')}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{exp.title}</p>
                      {exp.note && <p className="text-xs text-slate-400">{exp.note}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{CATEGORY_LABELS[exp.category]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {formatMoney(exp.amount.amountMinor, exp.amount.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                      {exp.amount.currency !== 'PKR' && formatMoney(exp.amount.baseAmountMinor, 'PKR', { compact: true })}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(exp.incurredAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {exp.isBusiness ? <Badge variant="teal">Business</Badge> : <Badge>Personal</Badge>}
                        {exp.isDeductible && <Badge variant="success">Deductible</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 group">
                      <button
                        onClick={() => deleteExpense.mutate(exp.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
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

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Expense">
        <ExpenseForm onSuccess={() => setShowCreate(false)} />
      </Modal>
    </div>
  );
}
