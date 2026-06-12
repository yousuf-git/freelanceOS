import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settingsSchema } from '../../lib/validators';
import { useAccountSettings, useUpdateAccountSettings, useAccountants, useInviteAccountant, useRevokeAccountant } from '../../hooks/useAccount';
import { usePlatforms, useCreatePlatform, useDeletePlatform } from '../../hooks/usePlatforms';
import { Card, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { SUPPORTED_CURRENCIES } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { REGIME_LABELS } from '../../lib/utils';
import { Plus, Trash2, UserPlus, Copy, Check } from 'lucide-react';

function PlatformFeeModel({ platform }) {
  const { feeModel, feeConfig } = platform;
  if (feeModel === 'none') return <span className="text-xs text-slate-400">No fee</span>;
  if (feeModel === 'flat') return <span className="text-xs font-mono">{feeConfig.percent}%</span>;
  if (feeModel === 'sliding') {
    return (
      <span className="text-xs font-mono">
        {feeConfig.tiers?.map(t => t.percent + '%').join(' → ')}
      </span>
    );
  }
  return <span className="text-xs text-slate-400">{feeModel}</span>;
}

export default function SettingsPage() {
  const { data: settings, isLoading: loadingSettings } = useAccountSettings();
  const updateSettings = useUpdateAccountSettings();
  const { data: platformsData } = usePlatforms({ limit: 50 });
  const deletePlatform = useDeletePlatform();
  const { data: accountantsData } = useAccountants();
  const inviteAccountant = useInviteAccountant();
  const revokeAccountant = useRevokeAccountant();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedToken, setCopiedToken] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema),
    values: settings ? {
      baseCurrency: settings.baseCurrency,
      taxRegime: settings.taxRegime,
      dangerZoneThreshold: (settings.dangerZoneThresholdMinor / 100).toFixed(0),
      fiscalYearStartMonth: settings.fiscalYearStartMonth,
    } : undefined,
  });

  const onSubmit = async (data) => {
    await updateSettings.mutateAsync({
      baseCurrency: data.baseCurrency,
      taxRegime: data.taxRegime,
      dangerZoneThresholdMinor: Number(data.dangerZoneThreshold) * 100,
      fiscalYearStartMonth: Number(data.fiscalYearStartMonth),
    });
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await inviteAccountant.mutateAsync({ email: inviteEmail });
    setInviteEmail('');
    setShowInvite(false);
  };

  const copyToken = (token) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (loadingSettings) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      {/* Account Settings */}
      <Card>
        <CardTitle className="mb-4">Account Settings</CardTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Base Currency" error={errors.baseCurrency?.message} {...register('baseCurrency')}>
              {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Select label="Tax Regime" error={errors.taxRegime?.message} {...register('taxRegime')}>
              {Object.entries(REGIME_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Danger Zone Threshold (PKR)"
              type="number"
              placeholder="500000"
              error={errors.dangerZoneThreshold?.message}
              {...register('dangerZoneThreshold')}
            />
            <Select label="Fiscal Year Start Month" error={errors.fiscalYearStartMonth?.message} {...register('fiscalYearStartMonth')}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Month {i + 1}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={updateSettings.isPending}>Save Settings</Button>
          </div>
        </form>
      </Card>

      {/* Platforms */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Platform Fee Configurations</CardTitle>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 text-xs text-slate-500">Platform</th>
              <th className="text-left py-2 text-xs text-slate-500">Model</th>
              <th className="text-left py-2 text-xs text-slate-500">Fee</th>
              <th className="text-center py-2 text-xs text-slate-500">System</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {platformsData?.data?.map(p => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2.5 font-medium text-slate-900">{p.name}</td>
                <td className="py-2.5">
                  <Badge>{p.feeModel}</Badge>
                </td>
                <td className="py-2.5">
                  <PlatformFeeModel platform={p} />
                </td>
                <td className="py-2.5 text-center">
                  {p.isSystemDefault && <Badge variant="info">Default</Badge>}
                </td>
                <td className="py-2.5">
                  {!p.isSystemDefault && (
                    <button
                      onClick={() => deletePlatform.mutate(p.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Accountants */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Accountant Access</CardTitle>
          <Button size="sm" variant="secondary" onClick={() => setShowInvite(true)}>
            <UserPlus className="h-4 w-4" /> Invite
          </Button>
        </div>
        {accountantsData?.data?.length === 0 ? (
          <p className="text-sm text-slate-400">No accountants invited yet.</p>
        ) : (
          <div className="space-y-2">
            {accountantsData?.data?.map(act => (
              <div key={act.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{act.email}</p>
                  <p className="text-xs text-slate-400">Invited {formatDate(act.invitedAt)}</p>
                </div>
                <Badge variant={act.status === 'active' ? 'success' : 'warning'}>{act.status}</Badge>
                {act.token && (
                  <button
                    onClick={() => copyToken(act.token)}
                    className="p-1.5 rounded hover:bg-white transition-colors text-slate-400 hover:text-teal-600"
                    title="Copy invite token"
                  >
                    {copiedToken === act.token ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
                <button
                  onClick={() => revokeAccountant.mutate(act.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Accountant" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">They'll get read-only access to your books for tax filing.</p>
          <Input
            label="Accountant Email"
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="cpa@taxfirm.pk"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button size="sm" onClick={handleInvite} loading={inviteAccountant.isPending}>Send Invite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
