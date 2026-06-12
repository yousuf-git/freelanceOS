import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDashboardSummary, useDashboardTrends } from '../../hooks/useDashboard';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { formatMoney, formatPKR } from '../../lib/money';
import { monthLabel } from '../../lib/dates';
import { PLATFORM_COLORS } from '../../lib/utils';
import useUIStore from '../../store/uiStore';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const PERIOD_OPTIONS = [
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

function MoneyCard({ label, value, currency = 'PKR', variant = 'default', sub, icon: Icon }) {
  const colorMap = {
    default: 'text-slate-900',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    teal: 'text-teal-700',
  };
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-500">{label}</span>
        {Icon && <Icon className={cn('h-4 w-4', colorMap[variant])} />}
      </div>
      <p className={cn('text-2xl font-bold font-mono', colorMap[variant])}>
        {formatMoney(value, currency, { compact: true })}
      </p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </Card>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-sm">
      <p className="font-medium text-slate-700 mb-1">{monthLabel(label)}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {formatPKR(p.value, true)}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { dashboardPeriod, setDashboardPeriod } = useUIStore();
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary(dashboardPeriod);
  const { data: trends, isLoading: loadingTrends } = useDashboardTrends(12);

  const trendData = trends?.series?.map(s => ({
    period: s.period,
    Gross: Math.round(s.grossBaseMinor / 100),
    Net: Math.round(s.netBaseMinor / 100),
    Expenses: Math.round(s.expensesBaseMinor / 100),
  })) || [];

  const pieData = summary?.byClient?.filter(c => c.netBaseMinor > 0).map((c, i) => ({
    name: c.name,
    value: c.netBaseMinor,
    fill: PLATFORM_COLORS[i % PLATFORM_COLORS.length],
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Income Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {summary ? `${summary.rangeFrom} → ${summary.rangeTo}` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {PERIOD_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setDashboardPeriod(value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                dashboardPeriod === value
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {loadingSummary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-teal-600 to-cyan-700 border-0 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-teal-100">Net Received</span>
              <DollarSign className="h-4 w-4 text-teal-200" />
            </div>
            <p className="text-3xl font-bold font-mono text-white">
              {formatMoney(summary?.netReceivedBaseMinor, 'PKR', { compact: true })}
            </p>
            <p className="text-xs text-teal-200 mt-1">
              Gross: {formatMoney(summary?.grossInvoicedBaseMinor, 'PKR', { compact: true })}
            </p>
          </Card>

          <MoneyCard
            label="Platform Fees"
            value={summary?.platformFeesBaseMinor}
            variant="warning"
            sub="Deducted from gross"
            icon={TrendingDown}
          />
          <MoneyCard
            label="Outstanding"
            value={summary?.outstandingBaseMinor}
            variant="default"
            sub="Invoices not yet paid"
            icon={ArrowUpRight}
          />
          <MoneyCard
            label="Overdue"
            value={summary?.overdueBaseMinor}
            variant={summary?.overdueBaseMinor > 0 ? 'danger' : 'success'}
            sub="Past due date"
            icon={AlertTriangle}
          />
        </div>
      )}

      {/* Tax callout */}
      {!loadingSummary && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-amber-200 bg-amber-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Estimated Tax</p>
                <p className="text-2xl font-bold font-mono text-amber-900">
                  {formatPKR(summary.estimatedTaxBaseMinor, true)}
                </p>
                <p className="text-xs text-amber-600 mt-1">Running FY liability</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Quarterly Set-Aside</p>
                <p className="text-xl font-bold font-mono text-amber-800">
                  {formatPKR(summary.quarterlySetAsideBaseMinor, true)}
                </p>
                <p className="text-xs text-amber-600 mt-1">Reserve per quarter</p>
              </div>
            </div>
          </Card>
          <Card>
            <CardTitle>Expenses this period</CardTitle>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {formatPKR(summary.expensesBaseMinor, true)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Business expenses logged</p>
          </Card>
        </div>
      )}

      {/* Trend chart */}
      <Card>
        <CardHeader>
          <CardTitle>12-Month Income Trend</CardTitle>
          {trends && (
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>Avg: <span className="font-mono font-semibold text-slate-700">{formatPKR(trends.averageNetBaseMinor, true)}</span></span>
              <span>Best: <span className="font-mono font-semibold text-green-600">{trends.bestMonth?.period}</span></span>
            </div>
          )}
        </CardHeader>
        {loadingTrends ? (
          <div className="h-64 bg-slate-50 rounded-lg animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData} barGap={2}>
              <XAxis dataKey="period" tickFormatter={monthLabel} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={v => `${(v / 10000).toFixed(0)}L`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Gross" fill="#CBD5E1" radius={[2, 2, 0, 0]} name="Gross" />
              <Bar dataKey="Net" fill="#0F766E" radius={[2, 2, 0, 0]} name="Net" />
              <Bar dataKey="Expenses" fill="#D97706" radius={[2, 2, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* By client + By platform */}
      {!loadingSummary && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardTitle className="mb-4">By Client</CardTitle>
            <div className="space-y-2">
              {summary.byClient.map(c => {
                const pct = summary.netReceivedBaseMinor
                  ? Math.round((c.netBaseMinor / summary.netReceivedBaseMinor) * 100)
                  : 0;
                return (
                  <div key={c.clientId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700 truncate">{c.name}</span>
                        <span className="text-sm font-mono font-semibold text-green-600 ml-2">
                          {formatPKR(c.netBaseMinor, true)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">By Currency</CardTitle>
            {summary.byCurrency.length > 0 ? (
              <div className="space-y-3">
                {summary.byCurrency.map(c => (
                  <div key={c.currency} className="flex items-center justify-between">
                    <Badge variant="default">{c.currency}</Badge>
                    <span className="text-sm font-mono text-slate-700">
                      {formatMoney(c.grossMinor, c.currency, { compact: true })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No data for this period</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
