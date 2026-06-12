import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal, Kicker, Rule, Counter } from '../../components/public/primitives';

const VALUES = [
  { k: 'Honest by default', t: 'The net number wins', d: 'Most tools flatter you with gross revenue. We make the real, after-everything figure the largest thing on the screen — even when it stings.' },
  { k: 'Frozen history', t: "Numbers that don't drift", d: 'A payment’s forex rate is captured the day it lands and never silently revised. Your past stays exactly as it happened.' },
  { k: 'Regional first', t: 'Built for here, not ported', d: 'FBR slabs, Upwork→PKR conversions, the way a Karachi designer actually invoices a London client. Not a US tool with a currency dropdown bolted on.' },
  { k: 'Quietly precise', t: 'Calm, not loud', d: 'This is a money tool for an anxious user. Colour means something — green is money kept, amber is attention, red is danger. Nothing decorative.' },
];

const TEAM = [
  { i: 'HA', n: 'Hassaan Adil', r: 'Founder · ex-freelancer', b: 'Spent six years on Upwork never quite knowing what he kept. Built the first version for himself.' },
  { i: 'SK', n: 'Sara Khan', r: 'Product & Tax', b: 'Chartered accountant turned product lead. Owns the slab engine and the accountant view.' },
  { i: 'RM', n: 'Rehan Malik', r: 'Engineering', b: 'Built the real-time ledger and the forex-freezing pipeline. Believes spreadsheets are a bug.' },
];

const TIMELINE = [
  ['2024', 'A spreadsheet gets out of hand', 'A single freelancer’s tax-tracking sheet grows to forty tabs. Something has to give.'],
  ['2025', 'freelanceOS, version zero', 'The gross-to-net engine and FBR slabs ship to a private group of twelve freelancers in Lahore.'],
  ['2026', 'Multi-currency & real-time', 'Forex-freezing, the 90-day forecast, and the accountant view arrive. The journal you’re reading launches.'],
];

export default function AboutPage() {
  return (
    <>
      {/* hero */}
      <section className="pt-28 pb-16 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="border-y border-[#1c1916] py-2 mb-12 flex justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">The masthead</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">About</span>
          </div>
          <div className="grid lg:grid-cols-[1fr_0.7fr] gap-12 items-end">
            <h1 className="font-serif opt-display text-[clamp(40px,6.5vw,84px)] leading-[0.95] tracking-[-0.02em]">
              We built the tool we<br />needed at <em className="text-[#0f766e] font-light">3am</em> before<br />a tax deadline.
            </h1>
            <p className="dropcap text-[16px] text-[#3a352e] leading-[1.7]">
              freelanceOS began as one freelancer's refusal to keep guessing. Every platform showed gross. Every bank showed a number in the wrong currency. No one showed what was actually kept — or owed. So we wrote it down, in plain ink.
            </p>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="px-5 sm:px-8 py-20 border-t border-[#e2dccf]">
        <div className="max-w-[1280px] mx-auto">
          <Reveal><Kicker className="mb-12">What we hold to</Kicker></Reveal>
          <div className="grid md:grid-cols-2 gap-x-14 gap-y-12">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={i * 70} className="flex gap-6">
                <span className="font-serif text-4xl text-[#0f766e] leading-none pt-1">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#938b7f] mb-2">{v.k}</p>
                  <h3 className="font-serif text-2xl text-[#1c1916] mb-2 leading-snug">{v.t}</h3>
                  <p className="text-[15px] text-[#5c554c] leading-relaxed max-w-md">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="px-5 sm:px-8 py-20 bg-[#f3efe6] border-y border-[#e2dccf]">
        <div className="max-w-[1280px] mx-auto">
          <Reveal><Kicker className="mb-12">How we got here</Kicker></Reveal>
          <div className="space-y-px">
            {TIMELINE.map(([y, t, d], i) => (
              <Reveal key={y} delay={i * 80} className="grid md:grid-cols-[140px_1fr] gap-4 md:gap-10 py-7 border-t border-[#1c1916] items-baseline">
                <span className="font-serif text-3xl text-[#0f766e]">{y}</span>
                <div className="max-w-2xl">
                  <h3 className="font-serif text-2xl text-[#1c1916] mb-1.5">{t}</h3>
                  <p className="text-[15px] text-[#5c554c] leading-relaxed">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* team */}
      <section className="px-5 sm:px-8 py-20">
        <div className="max-w-[1280px] mx-auto">
          <Reveal><Kicker className="mb-12">The desk</Kicker></Reveal>
          <div className="grid md:grid-cols-3 gap-px bg-[#e2dccf] border border-[#e2dccf]">
            {TEAM.map((m, i) => (
              <Reveal key={m.n} delay={i * 80} className="bg-[#faf8f3] p-8">
                <div className="w-14 h-14 rounded-full bg-[#1c1916] text-[#faf8f3] flex items-center justify-center font-serif text-xl mb-5">{m.i}</div>
                <h3 className="font-serif text-2xl text-[#1c1916]">{m.n}</h3>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0f766e] mt-1 mb-3">{m.r}</p>
                <p className="text-[14px] text-[#5c554c] leading-relaxed">{m.b}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="px-5 sm:px-8 py-20 bg-[#1c1916] text-[#faf8f3]">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { node: <Counter to={2400} suffix="+" />, c: 'Freelancers on the ledger' },
            { node: <Counter to={11} />, c: 'Currencies supported' },
            { node: <Counter to={3} />, c: 'Tax regimes built in' },
            { node: '₨1.2B+', c: 'Net income tracked' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 70}>
              <p className="font-serif text-[clamp(40px,5.5vw,68px)] leading-none tabular-nums">{s.node}</p>
              <div className="w-10 h-px bg-[#0f766e] my-4" />
              <p className="text-[13px] text-[#a89f92]">{s.c}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="px-5 sm:px-8 py-24 text-center">
        <Reveal>
          <h2 className="font-serif text-[clamp(34px,5vw,60px)] leading-tight tracking-tight">Keep your own ledger.</h2>
          <Link to="/register" className="group inline-flex items-center gap-2 bg-[#1c1916] hover:bg-[#0f766e] text-[#faf8f3] px-8 py-4 mt-8 text-base font-medium transition-colors">
            Start free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
