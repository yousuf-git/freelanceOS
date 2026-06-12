import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { loginSchema } from '../../lib/validators';
import { useLogin } from '../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    try { await mutateAsync(data); navigate('/dashboard'); } catch (_) {}
  };

  return (
    <div className="min-h-screen flex bg-[#faf8f3] text-[#1c1916]">
      {/* ── LEFT: ink plate with live ledger clipping ── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-1/2 flex-shrink-0 bg-[#1c1916] text-[#faf8f3] flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#faf8f3 0 1px,transparent 1px 34px)' }} />
        <Link to="/" className="relative z-10 flex items-baseline gap-1.5">
          <span className="font-serif text-2xl font-semibold">freelance</span>
          <span className="font-serif text-2xl font-semibold italic text-[#5eead4]">OS</span>
        </Link>

        <div className="relative z-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a8276] mb-6">Welcome back to the desk</p>
          <h2 className="font-serif text-[clamp(36px,4vw,56px)] leading-[0.98] tracking-tight">
            Your net income,<br /><em className="text-[#5eead4] font-light">where you left it.</em>
          </h2>

          {/* ledger clipping */}
          <div className="mt-10 border border-[#3a352e] bg-[#231f1b] max-w-sm">
            <div className="px-4 py-2.5 border-b border-[#3a352e] flex justify-between font-mono text-[9px] uppercase tracking-[0.24em] text-[#8a8276]">
              <span>This month</span><span className="text-[#5eead4]">● live</span>
            </div>
            <div className="p-4 font-mono text-[11px] space-y-2">
              <div className="flex justify-between"><span className="text-[#8a8276]">Client paid</span><span className="text-[#cfc7b6]">$500.00</span></div>
              <div className="flex justify-between"><span className="text-[#8a8276]">Upwork −10%</span><span className="text-[#f0a39a]">−$50.00</span></div>
              <div className="flex justify-between"><span className="text-[#8a8276]">FBR set-aside</span><span className="text-[#e6b873]">−₨11,260</span></div>
              <div className="flex justify-between pt-2 border-t border-[#3a352e] font-bold"><span className="text-[#5eead4]">Net kept</span><span className="text-[#5eead4]">₨1,13,840</span></div>
            </div>
          </div>
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

          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#938b7f] mb-3">Sign in</p>
          <h1 className="font-serif text-4xl tracking-tight mb-8">Welcome back.</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
            <AuthField label="Email" error={errors.email?.message}>
              <input type="email" placeholder="you@studio.com" {...register('email')}
                className="auth-input" />
            </AuthField>
            <AuthField label="Password" error={errors.password?.message}>
              <input type="password" placeholder="••••••••" {...register('password')}
                className="auth-input" />
            </AuthField>
            <button disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1c1916] hover:bg-[#0f766e] text-[#faf8f3] py-3.5 text-sm font-medium transition-colors disabled:opacity-50">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </button>
          </form>

          <p className="text-center text-sm text-[#5c554c] mt-7">
            No account yet?{' '}
            <Link to="/register" className="text-[#0f766e] font-medium link-ink">Open your ledger</Link>
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
