import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { Reveal, Kicker, FaqItem } from '../../components/public/primitives';

const PLANS = [
  {
    id: 'free', name: 'The Ledger', tag: 'Free, forever',
    price: { m: 0, y: 0 },
    blurb: 'The core engine for one freelancer keeping honest books.',
    feats: ['Unlimited invoices & payments', 'Gross-to-net on every payment', 'FBR / IT / NBR tax engine', 'Up to 3 currencies', 'Demo account & seed data'],
    cta: 'Start free', accent: false,
  },
  {
    id: 'pro', name: 'The Press', tag: 'Most chosen',
    price: { m: 900, y: 9000 },
    blurb: 'For the freelancer running a real, multi-currency practice.',
    feats: ['Everything in The Ledger', 'All 11 currencies + manual rates', '90-day cash-flow forecast', 'Overdue aging & reminder sequences', 'Accountant read-only invite', 'Annual PDF export'],
    cta: 'Start 14-day trial', accent: true,
  },
  {
    id: 'studio', name: 'The Bureau', tag: 'Small teams',
    price: { m: 2400, y: 24000 },
    blurb: 'Shared books for a small studio or a freelancer-plus-CA.',
    feats: ['Everything in The Press', 'Up to 5 seats', 'Multiple base currencies', 'Priority forex refresh', 'Dedicated onboarding'],
    cta: 'Talk to us', accent: false,
  },
];

const MATRIX = [
  ['Invoices & payments', true, true, true],
  ['Gross-to-net engine', true, true, true],
  ['Tax engine (FBR/IT/NBR)', true, true, true],
  ['Currencies', '3', '11', '11'],
  ['Cash-flow forecast', false, true, true],
  ['Overdue aging & reminders', false, true, true],
  ['Accountant read-only', false, true, true],
  ['Annual PDF export', false, true, true],
  ['Seats', '1', '1', '5'],
  ['Priority forex refresh', false, false, true],
];

const FAQS = [
  { q: 'Is the free plan a trial?', a: 'No — The Ledger is free indefinitely. It has everything a single freelancer needs to track net income and tax. Paid plans add forecasting, receivables automation, and the accountant view.' },
  { q: 'What currency is billing in?', a: 'Prices shown are in PKR. We bill in your local currency at checkout. Annual billing saves roughly two months versus monthly.' },
  { q: 'Can I downgrade or cancel?', a: 'Any time, from settings. Your data and frozen history remain intact on the free plan — you never lose the ledger you built.' },
  { q: 'Do you offer a student or early-career rate?', a: 'Yes. If you’re just starting out, write to us from the contact page and we’ll sort you out.' },
];

function Cell({ v }) {
  if (v === true)  return <Check className="h-4 w-4 text-[#0f766e] mx-auto" />;
  if (v === false) return <Minus className="h-4 w-4 text-[#cfc7b6] mx-auto" />;
  return <span className="font-mono text-sm text-[#1c1916]">{v}</span>;
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const fmt = n => n === 0 ? 'Free' : `₨${(yearly ? n : n).toLocaleString('en-IN')}`;

  return (
    <>
      {/* hero */}
      <section className="pt-28 pb-12 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="border-y border-[#1c1916] py-2 mb-12 flex justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">The rate card</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">Pricing</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <Kicker className="mb-6">Plain pricing, like everything else</Kicker>
              <h1 className="font-serif opt-display text-[clamp(40px,6.5vw,82px)] leading-[0.95] tracking-[-0.02em]">
                Pay for the press,<br /><em className="text-[#0f766e] font-light">not the paper.</em>
              </h1>
            </div>
            {/* billing toggle */}
            <div className="inline-flex items-center gap-1 border border-[#d4ccbb] p-1 self-start">
              {[['Monthly', false], ['Yearly · save 17%', true]].map(([l, v]) => (
                <button key={String(v)} onClick={() => setYearly(v)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${yearly === v ? 'bg-[#1c1916] text-[#faf8f3]' : 'text-[#5c554c] hover:text-[#1c1916]'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* plans */}
      <section className="px-5 sm:px-8 pb-16">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-3 gap-px bg-[#e2dccf] border border-[#1c1916]">
          {PLANS.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}
              className={`flex flex-col p-8 ${p.accent ? 'bg-[#1c1916] text-[#faf8f3]' : 'bg-[#faf8f3]'}`}>
              <div className="flex items-baseline justify-between">
                <h2 className={`font-serif text-3xl ${p.accent ? 'text-[#faf8f3]' : 'text-[#1c1916]'}`}>{p.name}</h2>
                <span className={`font-mono text-[9px] uppercase tracking-[0.2em] ${p.accent ? 'text-[#5eead4]' : 'text-[#0f766e]'}`}>{p.tag}</span>
              </div>
              <p className={`text-sm mt-3 leading-relaxed ${p.accent ? 'text-[#a89f92]' : 'text-[#5c554c]'}`}>{p.blurb}</p>

              <div className="mt-7 mb-6">
                <span className="font-serif text-[52px] leading-none tabular-nums">{fmt(p.price[yearly ? 'y' : 'm'])}</span>
                {p.price.m > 0 && <span className={`font-mono text-xs ml-2 ${p.accent ? 'text-[#a89f92]' : 'text-[#938b7f]'}`}>/ {yearly ? 'year' : 'month'}</span>}
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {p.feats.map(f => (
                  <li key={f} className="flex items-baseline gap-3 text-sm">
                    <Check className={`h-4 w-4 flex-shrink-0 ${p.accent ? 'text-[#5eead4]' : 'text-[#0f766e]'}`} />
                    <span className={p.accent ? 'text-[#e7e1d6]' : 'text-[#3a352e]'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link to={p.id === 'studio' ? '/contact' : '/register'}
                className={`group inline-flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${p.accent ? 'bg-[#faf8f3] text-[#1c1916] hover:bg-[#0f766e] hover:text-[#faf8f3]' : 'bg-[#1c1916] text-[#faf8f3] hover:bg-[#0f766e]'}`}>
                {p.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* comparison matrix */}
      <section className="px-5 sm:px-8 py-16 border-t border-[#e2dccf]">
        <div className="max-w-[1280px] mx-auto">
          <Reveal><Kicker className="mb-10">Line by line</Kicker></Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-[#1c1916]">
                  <th className="text-left py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#938b7f]">Feature</th>
                  {['The Ledger', 'The Press', 'The Bureau'].map(h => (
                    <th key={h} className="py-4 font-serif text-lg text-[#1c1916] text-center">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row, i) => (
                  <tr key={i} className="border-b border-dotted border-[#e2dccf]">
                    <td className="py-3.5 text-sm text-[#3a352e]">{row[0]}</td>
                    <td className="py-3.5 text-center"><Cell v={row[1]} /></td>
                    <td className="py-3.5 text-center bg-[#f3efe6]"><Cell v={row[2]} /></td>
                    <td className="py-3.5 text-center"><Cell v={row[3]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* faq */}
      <section className="px-5 sm:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <Reveal><Kicker className="mb-8">Before you commit</Kicker></Reveal>
          <div className="border-t border-[#1c1916]">
            {FAQS.map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />)}
          </div>
        </div>
      </section>
    </>
  );
}
