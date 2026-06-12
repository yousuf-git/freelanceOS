import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { invoiceSchema } from '../../lib/validators';
import { useCreateInvoice } from '../../hooks/useInvoices';
import { useClients } from '../../hooks/useClients';
import { usePlatforms } from '../../hooks/usePlatforms';
import { Input, MoneyInput } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { SUPPORTED_CURRENCIES, majorToMinor } from '../../lib/money';
import { todayISO, addDaysISO } from '../../lib/dates';
import { Plus, Trash2 } from 'lucide-react';

export default function InvoiceForm({ onSuccess }) {
  const { mutateAsync, isPending } = useCreateInvoice();
  const { data: clientsData } = useClients({ limit: 100 });
  const { data: platformsData } = usePlatforms({ limit: 50 });

  const today = todayISO();
  const in30 = addDaysISO(today, 30);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      currency: 'USD',
      issueDate: today,
      dueDate: in30,
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
      status: 'draft',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const currency = watch('currency');

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        lineItems: data.lineItems.map(li => ({
          description: li.description,
          quantity: Number(li.quantity),
          unitPriceMinor: majorToMinor(li.unitPrice, data.currency),
        })),
        taxOnInvoiceMinor: majorToMinor(data.taxOnInvoice || 0, data.currency),
      };
      delete payload.taxOnInvoice;
      await mutateAsync(payload);
      onSuccess?.();
    } catch (_) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Select label="Client *" error={errors.clientId?.message} {...register('clientId')}>
          <option value="">Select client</option>
          {clientsData?.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Platform *" error={errors.platformId?.message} {...register('platformId')}>
          <option value="">Select platform</option>
          {platformsData?.data?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Select label="Currency *" error={errors.currency?.message} {...register('currency')}>
          {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Issue Date *" type="date" error={errors.issueDate?.message} {...register('issueDate')} />
        <Input label="Due Date *" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
      </div>

      {/* Line Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-700">Line Items *</label>
          <Button type="button" variant="ghost" size="xs" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
            <Plus className="h-3.5 w-3.5" /> Add Line
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-6">
                <Input
                  placeholder="Description"
                  error={errors.lineItems?.[i]?.description?.message}
                  {...register(`lineItems.${i}.description`)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  step="0.01"
                  error={errors.lineItems?.[i]?.quantity?.message}
                  {...register(`lineItems.${i}.quantity`)}
                />
              </div>
              <div className="col-span-3">
                <MoneyInput
                  currency={currency}
                  placeholder="0.00"
                  error={errors.lineItems?.[i]?.unitPrice?.message}
                  {...register(`lineItems.${i}.unitPrice`)}
                />
              </div>
              <div className="col-span-1 pt-1">
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(i)} className="p-2 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {errors.lineItems?.message && <p className="text-xs text-red-600 mt-1">{errors.lineItems.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MoneyInput label="Tax on Invoice" currency={currency} placeholder="0.00" {...register('taxOnInvoice')} />
        <Select label="Status" {...register('status')}>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
        </Select>
      </div>

      <Input label="Notes" as="textarea" placeholder="Thank you for your business!" {...register('notes')} />

      <div className="flex justify-end gap-3">
        <Button type="submit" loading={isPending}>Create Invoice</Button>
      </div>
    </form>
  );
}
