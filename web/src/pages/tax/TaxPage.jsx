import { useState } from 'react';
import { useTaxConfig, useTaxPresets, useTaxLiability, useUpdateTaxConfig } from '../../hooks/useTax';
import { Card, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatMoney } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { REGIME_LABELS, cn } from '../../lib/utils';
import useUIStore from '../../store/uiStore';
import { Calculator, AlertCircle, TrendingDown, Percent } from 'lucide-react';

function TaxMeter({ used, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-500">
        <span>Taxable income used</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-teal-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function TaxPage() {
  const { activeFiscalYear, setActiveFiscalYear } = useUIStore();
  const { data: config, isLoading: loadingConfig } = useTaxConfig();
  const { data: presets } = useTaxPresets();
  const { data: liability, isLoading: loadingLiability } = useTaxLiability(activeFiscalYear);
  const updateConfig = useUpdateTaxConfig();
  const [selectedPreset, setSelectedPreset] = useState('');

  const handlePresetApply = () => {
    const preset = presets?.find(p => p.regime === selectedPreset);
    if (!preset) return;
    updateConfig.mutate({
      regime: preset.regime,
      currency: preset.currency,
      fiscalYearStartMonth: config?.fiscalYearStartMonth || 7,
      slabs: preset.slabs,
    });
  };

  if (loadingConfig) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Tax</h1>
        <div className="flex items-center gap-2">
          <Select value={activeFiscalYear} onChange={e => setActiveFiscalYear(Number(e.target.value))} className="w-28">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>FY {y}</option>)}
          </Select>
        </div>
      </div>

      {/* Liability cards */}
      {loadingLiability ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : liability && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500">Gross Income</span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-900">{formatMoney(liability.grossIncomeBaseMinor, 'PKR', { compact: true })}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-xs text-slate-500">Deductions</span>
              </div>
              <p className="text-xl font-bold font-mono text-green-600">{formatMoney(liability.deductibleExpensesBaseMinor, 'PKR', { compact: true })}</p>
              <p className="text-xs text-slate-400 mt-0.5">Expenses</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-slate-500">Taxable Income</span>
              </div>
              <p className="text-xl font-bold font-mono text-amber-700">{formatMoney(liability.taxableIncomeBaseMinor, 'PKR', { compact: true })}</p>
            </Card>
            <Card className="border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-xs text-amber-700">Estimated Tax</span>
              </div>
              <p className="text-xl font-bold font-mono text-amber-900">{formatMoney(liability.estimatedTaxBaseMinor, 'PKR', { compact: true })}</p>
              <p className="text-xs text-amber-600 mt-0.5">Effective rate: {liability.effectiveRate?.toFixed(1)}%</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardTitle className="mb-4">Quarterly Set-Aside</CardTitle>
              <p className="text-3xl font-bold font-mono text-amber-700 mb-2">
                {formatMoney(liability.quarterlySetAsideBaseMinor, 'PKR', { compact: true })}
              </p>
              <p className="text-sm text-slate-500">Reserve per quarter to cover annual tax bill.</p>
              <p className="text-xs text-slate-400 mt-3">As of {formatDate(liability.asOf)}</p>
            </Card>
            <Card>
              <CardTitle className="mb-4">Tax Breakdown</CardTitle>
              <div className="space-y-2 text-sm">
                {[
                  ['Gross income', liability.grossIncomeBaseMinor],
                  ['Platform fees', -liability.platformFeesBaseMinor],
                  ['Net income', liability.netIncomeBaseMinor],
                  ['Deductible expenses', -liability.deductibleExpensesBaseMinor],
                  ['Taxable income', liability.taxableIncomeBaseMinor],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-slate-500">{label}</span>
                    <span className={cn('font-mono', val < 0 ? 'text-green-600' : 'text-slate-700')}>
                      {val < 0 ? '−' : ''}{formatMoney(Math.abs(val), 'PKR', { compact: true })}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-slate-100 pt-2 font-semibold">
                  <span>Estimated tax</span>
                  <span className="font-mono text-amber-700">{formatMoney(liability.estimatedTaxBaseMinor, 'PKR', { compact: true })}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Slab config */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle>Tax Configuration</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">
              Regime: <span className="font-medium">{REGIME_LABELS[config?.regime] || config?.regime}</span>
              {' · '}FY starts month {config?.fiscalYearStartMonth}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPreset} onChange={e => setSelectedPreset(e.target.value)} className="w-48">
              <option value="">Apply preset…</option>
              {presets?.map(p => <option key={p.regime} value={p.regime}>{p.label}</option>)}
            </Select>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePresetApply}
              disabled={!selectedPreset}
              loading={updateConfig.isPending}
            >
              Apply
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs text-slate-500">Income band (up to)</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500">Rate</th>
                <th className="text-right py-2 px-3 text-xs text-slate-500">Fixed addition</th>
              </tr>
            </thead>
            <tbody>
              {config?.slabs?.map((slab, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-2 px-3 font-mono text-slate-700">
                    {slab.uptoMinor == null ? '∞ (top band)' : formatMoney(slab.uptoMinor, config.currency, { compact: true })}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-amber-700 font-semibold">{slab.rate}%</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-500">
                    {slab.fixedMinor > 0 ? formatMoney(slab.fixedMinor, config.currency, { compact: true }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
