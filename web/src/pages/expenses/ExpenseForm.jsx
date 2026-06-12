import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { expenseSchema } from '../../lib/validators';
import { useCreateExpense } from '../../hooks/useExpenses';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { SUPPORTED_CURRENCIES, majorToMinor } from '../../lib/money';
import { todayISO } from '../../lib/dates';
import { CATEGORY_LABELS } from '../../lib/utils';

const CATEGORIES = ['software', 'hardware', 'internet', 'coworking', 'marketing', 'fees', 'travel', 'other'];

export default function ExpenseForm({ onSuccess }) {
  const { mutateAsync, isPending } = useCreateExpense();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      currency: 'USD',
      incurredAt: todayISO().split('T')[0],
      isBusiness: true,
      isDeductible: true,
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        amountMinor: majorToMinor(data.amount, data.currency),
        forexRate: data.forexRate ? Number(data.forexRate) : null,
        incurredAt: new Date(data.incurredAt).toISOString(),
      };
      delete payload.amount;
      await mutateAsync(payload);
      onSuccess?.();
    } catch (_) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Title *" placeholder="Adobe Creative Cloud" error={errors.title?.message} {...register('title')} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Category *" error={errors.category?.message} {...register('category')}>
          <option value="">Select category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </Select>
        <Input label="Date *" type="date" error={errors.incurredAt?.message} {...register('incurredAt')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Amount *" type="number" step="0.01" placeholder="54.99" error={errors.amount?.message} {...register('amount')} />
        <Select label="Currency *" error={errors.currency?.message} {...register('currency')}>
          {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>
      <Input label="Forex Rate (optional)" type="number" step="0.0001" placeholder="Leave blank for auto" {...register('forexRate')} />
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="rounded border-slate-300 text-teal-600" {...register('isBusiness')} />
          Business expense
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="rounded border-slate-300 text-teal-600" {...register('isDeductible')} />
          Tax deductible
        </label>
      </div>
      <Input label="Note" placeholder="Optional context" {...register('note')} />
      <div className="flex justify-end">
        <Button type="submit" loading={isPending}>Add Expense</Button>
      </div>
    </form>
  );
}
