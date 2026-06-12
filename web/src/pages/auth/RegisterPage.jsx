import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { registerSchema } from '../../lib/validators';
import { useRegister } from '../../hooks/useAuth';
import { SUPPORTED_CURRENCIES } from '../../lib/money';

const PERKS = [
  'Gross-to-net on every payment',
  'FBR / India IT / Bangladesh NBR tax engine',
  'Multi-currency, frozen at payment',
  '90-day cash-flow forecast',
  'Accountant read-only invite',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useRegister();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { baseCurrency: 'PKR' },
  });

  const onSubmit = async (data) => {
    try { await mutateAsync(data); navigate('/dashboard'); } catch (_) {}
  };

  return (
    <div className="min-h-screen flex bg-[#faf8f3] text-[#1c1916]">
      {/* ── LEFT: editorial value plate ── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-1/2 flex-shrink-0 bg-[#1c1916] text-[#faf8f3] flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#faf8f3 0 1px,transparent 1px 34px)' }} />
        <Link to="/" className="relative z-10 flex items-baseline gap-1.5">
          <span className="font-serif text-2xl font-semibold">freelance</span>
          <span className="font-serif text-2xl font-semibold italic text-[#5eead4]">OS</span>
        </Link>

        <div className="relative z-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a8276] mb-6">Open your ledger</p>
          <h2 className="font-serif text-[clamp(36px,4vw,56px)] leading-[0.98] tracking-tight mb-10">
            Set up your<br /><em className="text-[#5eead4] font-light">financial OS.</em>
          </h2>
          <ul className="space-y-3.5 max-w-sm">
            {PERKS.map(p => (
              <li key={p} className="flex items-baseline gap-3 text-[15px] text-[#e7e1d6]">
                <Check className="h-4 w-4 text-[#5eead4] flex-shrink-0 translate-y-0.5" />{p}
              </li>
            ))}
          </ul>
          <p className="font-mono text-[11px] text-[#8a8276] mt-10">Free · no card · first invoice in under 10 minutes</p>
        </div>

        <p className="relative z-10 font-mono text-[11px] text-[#6b6356]">© {new Date().getFullYear()} freelanceOS · Lahore</p>
      </div>

      {/* ── RIGHT: form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-baseline gap-1.5 mb-10 lg:hidden">
            <span className="font-serif text-2xl font-semibold">freelance</span>
            <span className="font-serif text-2xl font-semibold italic text-[#0f766e]">OS</span>
          </Link>

          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#938b7f] mb-3">Create account</p>
          <h1 className="font-serif text-4xl tracking-tight mb-8">Start your ledger.</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <AuthField label="Full name" error={errors.name?.message}>
              <input placeholder="Ahsan Raza" {...register('name')} className="auth-input" />
            </AuthField>
            <AuthField label="Email" error={errors.email?.message}>
              <input type="email" placeholder="you@studio.com" {...register('email')} className="auth-input" />
            </AuthField>
            <AuthField label="Password" error={errors.password?.message}>
              <input type="password" placeholder="Min. 8 characters" {...register('password')} className="auth-input" />
            </AuthField>
            <AuthField label="Base currency" error={errors.baseCurrency?.message}>
              <select {...register('baseCurrency')} className="auth-input appearance-none cursor-pointer">
                {SUPPORTED_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </AuthField>
            <button disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1c1916] hover:bg-[#0f766e] text-[#faf8f3] py-3.5 text-sm font-medium transition-colors disabled:opacity-50">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />} Create account
            </button>
          </form>

          <p className="text-center text-sm text-[#5c554c] mt-7">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0f766e] font-medium link-ink">Sign in</Link>
          </p>
          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#938b7f] hover:text-[#1c1916] transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back to home
            </Link>
          </div>
        </div>
      </div>

      <style>{`.auth-input{width:100%;background:transparent;border:0;border-bottom:1px solid #d4ccbb;padding:10px 0;font-size:18px;color:#1c1916;transition:border-color .2s}.auth-input::placeholder{color:#bcb3a3}.auth-input:focus{outline:0;border-color:#0f766e}`}</style>
    </div>
  );
}

function AuthField({ label, error, children }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#938b7f]">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="font-mono text-[11px] text-[#b91c1c] mt-1.5">{error}</p>}
    </div>
  );
}
