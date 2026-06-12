import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal, Kicker, InteractiveLedger } from '../../components/public/primitives';

const CHAPTERS = [
  {
    n: '01', tag: 'Income', t: 'Gross resolved to net',
    points: ['Per-payment fee deduction (Upwork / Fiverr / custom)', 'Forex frozen at the date of payment', 'Net shown in your base currency, gross muted', 'Partial payments and refunds handled cleanly'],
  },
  {
    n: '02', tag: 'Tax', t: 'A self-recomputing engine',
    points: ['FBR TY 2024-25 slabs seeded by default', 'India IT & Bangladesh NBR one-click presets', 'Annualised projection on every entry', 'Quarterly set-aside, advisory not filing-grade'],
  },
  {
    n: '03', tag: 'Currency', t: 'Multi-currency, honestly',
    points: ['Invoice in USD / GBP / EUR / CAD / AUD and more', 'One base currency per account (PKR default)', 'Manual-rate fallback when forex is unavailable', 'History never silently revalues'],
  },
  {
    n: '04', tag: 'Forecast', t: 'Cash flow, ninety days out',
    points: ['Projection from outstanding invoices + expenses', 'Danger windows flagged before you reach them', 'Live redraw over WebSocket on every change', 'Area timeline with a danger threshold line'],
  },
  {
    n: '05', tag: 'Receivables', t: 'Overdue, aged and chased',
    points: ['30 / 60 / 90+ day aging buckets', 'Automated reminder sequences', 'Per-client reliability scores', 'One-glance outstanding total'],
  },
  {
    n: '06', tag: 'Sharing', t: 'Your accountant, read-only',
    points: ['Invite a CA by email, scoped to your account', 'Read-only — every write control hidden, not disabled', 'Annual tax-ready PDF export', 'Persistent “accountant view” banner'],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* hero */}
      <section className="pt-28 pb-14 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="border-y border-[#1c1916] py-2 mb-12 flex justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">The full index</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">Features</span>
          </div>
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            <div>
              <Kicker className="mb-6">Everything, in one ledger</Kicker>
              <h1 className="font-serif opt-display text-[clamp(38px,6vw,80px)] leading-[0.95] tracking-[-0.02em]">
                Six chapters of<br /><em className="text-[#0f766e] font-light">a freelancer's</em> books.
              </h1>
              <p className="text-[17px] text-[#3a352e] leading-[1.7] mt-7 max-w-lg">
                From the moment a client pays to the quarter you file, every number is handled once and handled right. Try the engine — the figures on the right are live.
              </p>
            </div>
            <div className="ink-rise"><InteractiveLedger /></div>
          </div>
        </div>
      </section>

      {/* chapters */}
      <section className="px-5 sm:px-8 pb-12">
        <div className="max-w-[1280px] mx-auto">
          {CHAPTERS.map((c, i) => (
            <Reveal key={c.n} className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-14 py-12 border-t border-[#1c1916] items-start">
              <div>
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-6xl text-[#0f766e] leading-none">{c.n}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#938b7f]">{c.tag}</span>
                </div>
                <h2 className="font-serif text-[clamp(28px,3.4vw,44px)] leading-[1.02] tracking-tight mt-5">{c.t}</h2>
              </div>
              <ul className="lg:pt-4">
                {c.points.map(p => (
                  <li key={p} className="flex items-baseline gap-4 py-3 border-b border-dotted border-[#e2dccf] text-[15px] text-[#3a352e]">
                    <span className="font-mono text-[#0f766e] text-xs">✦</span>{p}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      {/* cta band */}
      <section className="px-5 sm:px-8 py-24 bg-[#1c1916] text-[#faf8f3] text-center">
        <Reveal>
          <h2 className="font-serif text-[clamp(34px,5vw,60px)] leading-tight tracking-tight">
            Read it once.<br /><em className="text-[#5eead4] font-light">Trust it after.</em>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
            <Link to="/register" className="group inline-flex items-center gap-2 bg-[#faf8f3] text-[#1c1916] hover:bg-[#0f766e] hover:text-[#faf8f3] px-8 py-4 text-base font-medium transition-colors">
              Start free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 border border-[#3a352e] hover:border-[#faf8f3] px-8 py-4 text-base transition-colors">
              See pricing
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
