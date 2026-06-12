import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { useCashflowTimeline } from '../../hooks/useCashflow';
import { Card, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatMoney, majorToMinor } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { AlertTriangle, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';

function EventTypeIcon({ type }) {
  if (type === 'confirmed_income') return <ArrowUp className="h-3.5 w-3.5 text-green-600" />;
  if (type === 'expected_income') return <ArrowUp className="h-3.5 w-3.5 text-teal-500" />;
  return <ArrowDown className="h-3.5 w-3.5 text-red-500" />;
}

const CONFIDENCE_LABELS = {
  confirmed: 'bg-green-100 text-green-700',
  expected: 'bg-teal-100 text-teal-700',
  scheduled: 'bg-slate-100 text-slate-600',
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow text-sm">
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      <p className="font-mono text-teal-700">{formatMoney(payload[0].value * 100, 'PKR', { compact: true })}</p>
    </div>
  );
}

export default function CashflowPage() {
  const today = new Date().toISOString().split('T')[0];
  const future = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(future);
  const [openingBalance, setOpeningBalance] = useState('5000000');

  const { data, isLoading } = useCashflowTimeline({
    from,
    to,
    openingBalanceMinor: openingBalance ? Number(openingBalance) * 100 : undefined,
  });

  const chartData = data?.balancePoints?.map(bp => ({
    date: bp.date,
    balance: Math.round(bp.projectedBalanceMinor / 100),
    inDanger: bp.inDanger,
  })) || [];

  const dangerThreshold = data ? Math.round(data.dangerZoneThresholdMinor / 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Cash Flow</h1>
      </div>

      {/* Controls */}
      <Card className="p-4 flex items-center gap-4 flex-wrap">
        <Input label="From" type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-36" containerClassName="flex-row items-center gap-2" />
        <Input label="To" type="date" value={to} onChange={e => setTo(e.target.value)} className="w-36" containerClassName="flex-row items-center gap-2" />
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-500">Opening balance (PKR, paisa)</label>
          <input
            type="number"
            value={openingBalance}
            onChange={e => setOpeningBalance(e.target.value)}
            className="w-36 text-sm border border-slate-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </Card>

      {/* Danger windows */}
      {data?.dangerWindows?.length > 0 && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Cash flow danger detected</p>
            {data.dangerWindows.map((w, i) => (
              <p key={i} className="text-sm text-red-700 mt-1">
                {w.from} → {w.to}: min balance {formatMoney(w.minBalanceMinor, 'PKR', { compact: true })} (below threshold)
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardTitle className="mb-4">Projected Balance Timeline</CardTitle>
        {isLoading ? (
          <div className="h-64 bg-slate-50 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F766E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={v => `${(v / 10000).toFixed(0)}L`}
                tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48}
              />
              <Tooltip content={<CustomTooltip />} />
              {dangerThreshold > 0 && (
                <ReferenceLine
                  y={dangerThreshold}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{ value: 'Danger', fontSize: 11, fill: '#EF4444', position: 'insideTopRight' }}
                />
              )}
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#0F766E"
                strokeWidth={2}
                fill="url(#balanceGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Events */}
      <Card>
        <CardTitle className="mb-4">Upcoming Events</CardTitle>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="space-y-2">
            {data?.events?.map((evt, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <EventTypeIcon type={evt.type} />
                <div className="flex-1">
                  <p className="text-sm text-slate-800">{evt.label}</p>
                  <p className="text-xs text-slate-400">{evt.date}</p>
                </div>
                <span className={cn(
                  'text-sm font-mono font-semibold',
                  evt.amountBaseMinor > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {evt.amountBaseMinor > 0 ? '+' : ''}{formatMoney(evt.amountBaseMinor, 'PKR', { compact: true })}
                </span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', CONFIDENCE_LABELS[evt.confidence] || 'bg-slate-100 text-slate-500')}>
                  {evt.confidence}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
