import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema } from '../../lib/validators';
import { useCreateClient } from '../../hooks/useClients';
import { usePlatforms } from '../../hooks/usePlatforms';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { SUPPORTED_CURRENCIES } from '../../lib/money';

export default function ClientForm({ onSuccess, defaultValues }) {
  const { mutateAsync, isPending } = useCreateClient();
  const { data: platformsData } = usePlatforms({ limit: 50 });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: defaultValues || { billingCurrency: 'USD' },
  });

  const onSubmit = async (data) => {
    try {
      await mutateAsync(data);
      onSuccess?.();
    } catch (_) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name *" error={errors.name?.message} {...register('name')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Company" error={errors.company?.message} {...register('company')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Billing Currency *" error={errors.billingCurrency?.message} {...register('billingCurrency')}>
          {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select label="Default Platform" {...register('defaultPlatformId')}>
          <option value="">None</option>
          {platformsData?.data?.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </div>
      <Input label="Contract Terms" placeholder="Net-30, milestone-based" {...register('contractTerms')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isPending}>Create Client</Button>
      </div>
    </form>
  );
}
