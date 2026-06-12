import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="paper-grain min-h-screen bg-[#faf8f3] text-[#1c1916] flex items-center justify-center px-6">
      <div className="relative z-10 max-w-lg w-full text-center">
        <Link to="/" className="inline-flex items-baseline gap-1.5 mb-16">
          <span className="font-serif text-2xl font-semibold">freelance</span>
          <span className="font-serif text-2xl font-semibold italic text-[#0f766e]">OS</span>
        </Link>

        {/* masthead rule */}
        <div className="flex items-center justify-between border-y border-[#1c1916] py-2 mb-12">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em]">Erratum</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">Page not found</span>
        </div>

        <p className="font-serif text-[clamp(96px,22vw,200px)] leading-none text-[#0f766e]">404</p>

        {/* ledger clipping */}
        <div className="bg-[#fffdf8] border border-[#d4ccbb] text-left max-w-xs mx-auto my-10 font-mono text-xs">
          <div className="px-4 py-2.5 border-b border-[#e2dccf] flex justify-between text-[#938b7f] uppercase tracking-[0.2em] text-[9px]">
            <span>This page</span><span className="text-[#b91c1c]">not_found</span>
          </div>
          <div className="p-4 space-y-1.5">
            <div className="flex justify-between"><span className="text-[#938b7f]">Balance</span><span className="text-[#5c554c]">₨0.00</span></div>
            <div className="flex justify-between"><span className="text-[#938b7f]">Status</span><span className="text-[#b91c1c]">404</span></div>
            <div className="flex justify-between pt-2 border-t border-dotted border-[#e2dccf]"><span className="text-[#0f766e]">Resolution</span><span className="text-[#0f766e]">go home ↗</span></div>
          </div>
        </div>

        <h1 className="font-serif text-3xl tracking-tight mb-3">This page isn't in the ledger.</h1>
        <p className="text-[15px] text-[#5c554c] mb-9 max-w-sm mx-auto leading-relaxed">
          The link may be outdated, or the entry was removed. Let's get you back to a page that balances.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="group inline-flex items-center gap-2 bg-[#1c1916] hover:bg-[#0f766e] text-[#faf8f3] px-7 py-3.5 text-sm font-medium transition-colors">
            Back to home <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/dashboard" className="inline-flex items-center gap-2 border border-[#d4ccbb] hover:border-[#1c1916] text-[#1c1916] px-7 py-3.5 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
