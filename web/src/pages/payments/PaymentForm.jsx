import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema } from '../../lib/validators';
import { useCreatePayment } from '../../hooks/usePayments';
import { Input, MoneyInput } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatMoney, majorToMinor } from '../../lib/money';
import { todayISO } from '../../lib/dates';
import { AlertTriangle } from 'lucide-react';

export default function PaymentForm({ invoice, onSuccess }) {
  const { mutateAsync, isPending } = useCreatePayment();
  const [forexError, setForexError] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: invoice?.id || '',
      paidAt: new Date().toISOString().split('T')[0],
      currency: invoice?.currency || 'USD',
      grossAmount: invoice ? (invoice.amountDueMinor / 100).toFixed(2) : '',
    },
  });

  const currency = watch('currency') || invoice?.currency || 'USD';

  const onSubmit = async (data) => {
    setForexError(false);
    try {
      const payload = {
        invoiceId: data.invoiceId,
        paidAt: new Date(data.paidAt).toISOString(),
        grossAmountMinor: majorToMinor(data.grossAmount, data.currency),
        currency: data.currency,
        forexRate: data.forexRate ? Number(data.forexRate) : null,
        platformFeeOverrideMinor: data.platformFeeOverride
          ? majorToMinor(data.platformFeeOverride, data.currency)
          : null,
        note: data.note || '',
      };
      await mutateAsync(payload);
      onSuccess?.();
    } catch (err) {
      if (err.code === 'FOREX_UNAVAILABLE' || err.status === 424) {
        setForexError(true);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {invoice && (
        <div className="bg-slate-50 rounded-lg p-3 text-sm">
          <span className="font-mono font-medium text-slate-700">{invoice.number}</span>
          <span className="text-slate-400 mx-2">·</span>
          <span className="text-slate-600">Due: {formatMoney(invoice.amountDueMinor, invoice.currency)}</span>
        </div>
      )}

      {forexError && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Forex rate unavailable</p>
            <p className="text-xs text-amber-700">Enter the exchange rate manually below to complete this payment.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <MoneyInput
          label={`Gross Amount (${currency})`}
          currency={currency}
          error={errors.grossAmount?.message}
          {...register('grossAmount')}
        />
        <Input
          label="Payment Date *"
          type="date"
          error={errors.paidAt?.message}
          {...register('paidAt')}
        />
      </div>

      {forexError && (
        <Input
          label="Forex Rate (manual) *"
          type="number"
          step="0.0001"
          placeholder="e.g. 282.00 for USD→PKR"
          error={errors.forexRate?.message}
          {...register('forexRate')}
        />
      )}

      <Input
        label="Platform Fee Override (optional)"
        type="number"
        step="0.01"
        placeholder="Leave blank to auto-compute"
        {...register('platformFeeOverride')}
      />

      <Input
        label="Note (optional)"
        placeholder="Milestone 1, partial payment…"
        {...register('note')}
      />

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={isPending}>Record Payment</Button>
      </div>
    </form>
  );
}
