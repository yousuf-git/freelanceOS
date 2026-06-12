import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { useAnnualSummary, useClientProfitability, usePlatformComparison, useGenerateAnnualPdf } from '../../hooks/useReports';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatMoney } from '../../lib/money';
import { monthLabel } from '../../lib/dates';
import { getReliabilityBg, PLATFORM_COLORS, cn } from '../../lib/utils';
import { Download, Star } from 'lucide-react';
import useUIStore from '../../store/uiStore';

function MonthlyChart({ data }) {
  const chartData = data?.byMonth?.map(m => ({
    month: m.month,
    Gross: Math.round(m.grossBaseMinor / 100),
    Net: Math.round(m.netBaseMinor / 100),
    Expenses: Math.round(m.expensesBaseMinor / 100),
  })) || [];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} barGap={2}>
        <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={v => `${(v / 10000).toFixed(0)}L`} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={44} />
        <Tooltip formatter={(v) => formatMoney(v * 100, 'PKR', { compact: true })} labelFormatter={monthLabel} />
        <Bar dataKey="Gross" fill="#CBD5E1" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Net" fill="#0F766E" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Expenses" fill="#D97706" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function ReportsPage() {
  const { activeFiscalYear, setActiveFiscalYear } = useUIStore();
  const { data: annual, isLoading: loadingAnnual } = useAnnualSummary(activeFiscalYear);
  const { data: clientProfit, isLoading: loadingClients } = useClientProfitability({ sort: '-netBaseMinor' });
  const { data: platformComp, isLoading: loadingPlatforms } = usePlatformComparison();
  const generatePdf = useGenerateAnnualPdf();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <div className="flex items-center gap-3">
          <Select value={activeFiscalYear} onChange={e => setActiveFiscalYear(Number(e.target.value))} className="w-28">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>FY {y}</option>)}
          </Select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => generatePdf.mutate({ fiscalYear: activeFiscalYear })}
            loading={generatePdf.isPending}
          >
            <Download className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Annual summary */}
      {loadingAnnual ? <Skeleton className="h-32 w-full" /> : annual && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Gross Invoiced', value: annual.grossInvoicedBaseMinor, variant: 'slate' },
              { label: 'Platform Fees', value: annual.platformFeesBaseMinor, variant: 'amber' },
              { label: 'Net Received', value: annual.netReceivedBaseMinor, variant: 'green' },
              { label: 'Deductible Expenses', value: annual.deductibleExpensesBaseMinor, variant: 'green' },
            ].map(({ label, value, variant }) => (
              <Card key={label}>
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className={cn('text-xl font-bold font-mono', variant === 'green' ? 'text-green-600' : variant === 'amber' ? 'text-amber-600' : 'text-slate-900')}>
                  {formatMoney(value, 'PKR', { compact: true })}
                </p>
              </Card>
            ))}
          </div>

          <Card>
            <CardTitle className="mb-4">Monthly Breakdown — FY {activeFiscalYear}</CardTitle>
            <MonthlyChart data={annual} />
          </Card>
        </>
      )}

      {/* Client profitability */}
      <Card>
        <CardTitle className="mb-4">Client Profitability</CardTitle>
        {loadingClients ? <Skeleton className="h-32 w-full" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs text-slate-500">Client</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500">Gross</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500">Fees</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500">Net</th>
                  <th className="text-center px-4 py-2 text-xs text-slate-500">Reliability</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500">Invoices</th>
                </tr>
              </thead>
              <tbody>
                {clientProfit?.clients?.map((c, i) => (
                  <tr key={c.clientId} className={cn('border-b border-slate-50 hover:bg-slate-50', i % 2 === 1 && 'bg-slate-50/50')}>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">{formatMoney(c.grossBaseMinor, 'PKR', { compact: true })}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-amber-600">{c.feesBaseMinor > 0 ? formatMoney(c.feesBaseMinor, 'PKR', { compact: true }) : '—'}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-600">{formatMoney(c.netBaseMinor, 'PKR', { compact: true })}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', getReliabilityBg(c.reliabilityScore))}>
                        <Star className="h-3 w-3" />{c.reliabilityScore}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{c.invoiceCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Platform comparison */}
      <Card>
        <CardTitle className="mb-4">Platform Comparison</CardTitle>
        {loadingPlatforms ? <Skeleton className="h-32 w-full" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 text-xs text-slate-500">Platform</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500">Gross</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500">Fees</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500">Net</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500">Eff. Rate</th>
                  <th className="text-right px-4 py-2 text-xs text-slate-500">Payments</th>
                </tr>
              </thead>
              <tbody>
                {platformComp?.platforms?.map((p, i) => (
                  <tr key={p.platformId} className={cn('border-b border-slate-50 hover:bg-slate-50', i % 2 === 1 && 'bg-slate-50/50')}>
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-slate-900">{p.name}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">{formatMoney(p.grossBaseMinor, 'PKR', { compact: true })}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-amber-600">{p.feesBaseMinor > 0 ? formatMoney(p.feesBaseMinor, 'PKR', { compact: true }) : '—'}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-green-600">{formatMoney(p.netBaseMinor, 'PKR', { compact: true })}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge variant={p.effectiveFeeRate > 15 ? 'danger' : p.effectiveFeeRate > 5 ? 'warning' : 'success'}>
                        {p.effectiveFeeRate.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-500">{p.paymentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
