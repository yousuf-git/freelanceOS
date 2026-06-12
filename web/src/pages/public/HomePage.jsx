import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal, Kicker, Rule, Counter, FaqItem, InteractiveLedger } from '../../components/public/primitives';

// ── proof strip items ──
const PROOF = [
  'Multi-currency invoicing', 'FBR · IT · NBR tax engine', 'Upwork sliding fee',
  'Fiverr 20% deduction', '90-day cash flow', 'Forex frozen at payment',
  'Overdue aging buckets', 'Accountant read-only', 'PKR · USD · GBP · EUR',
];

const FAQS = [
  { q: 'Does freelanceOS touch my money or connect to Upwork?', a: 'No. It never moves money and has no API link to Upwork, Fiverr, or your bank. You record payments manually; freelanceOS does the math — fees, forex, tax — and shows you the real number.' },
  { q: 'Which tax regimes are built in?', a: 'Pakistan FBR (TY 2024-25) is seeded by default. India IT and Bangladesh NBR are one-click presets, and custom slab sets are supported. All figures are advisory estimates, not filing-grade returns.' },
  { q: 'How does multi-currency actually work?', a: "Each account has one base currency (PKR by default). Invoices are issued in the client's currency. When you record a payment, the forex rate is fetched and frozen permanently on that record — past numbers never silently change." },
  { q: 'What can my accountant see?', a: 'Invite your CA by email and they get a read-only view scoped to your account: invoices, income, expenses, tax summaries, plus annual PDF export. They cannot edit anything.' },
  { q: 'Is there really a free plan?', a: 'Yes. The core ledger is free with no card required, and you can explore a fully populated demo account before recording a single real invoice.' },
];

export default function HomePage() {
  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="pt-24 pb-10 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* masthead rule */}
          <div className="flex items-center justify-between border-y border-[#1c1916] py-2 mb-12">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#1c1916]">Issue 01</span>
            <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">For the self-employed of South Asia</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#1c1916]">Summer 2026</span>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-start">
            {/* headline */}
            <div className="ink-rise">
              <Kicker className="mb-6">Solving the gross–net problem</Kicker>
              <h1 className="font-serif opt-display text-[#1c1916] leading-[0.92] tracking-[-0.02em] text-[clamp(46px,7vw,92px)]">
                The freelancer's<br />
                ledger,{' '}
                <em className="text-[#0f766e] font-light">re&shy;imagined</em>
                <span className="text-[#b45309]">.</span>
              </h1>
              <p className="font-serif italic text-[clamp(20px,2.4vw,28px)] text-[#5c554c] mt-6 leading-snug max-w-xl">
                — in plain ink.
              </p>

              <p className="dropcap text-[17px] text-[#3a352e] leading-[1.7] mt-8 max-w-xl">
                You earned five thousand dollars. So why does your account show so much less? freelanceOS reads every payment the way you actually live it — minus the platform's cut, converted at the rate that day, with the tax already set aside. The <em className="font-serif">net</em> number, finally, without a spreadsheet.
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-9">
                <Link to="/register"
                  className="group inline-flex items-center gap-2 bg-[#1c1916] hover:bg-[#0f766e] text-[#faf8f3] px-7 py-3.5 text-sm font-medium transition-colors">
                  Start your ledger — free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/features" className="inline-flex items-center gap-2 text-sm text-[#1c1916] link-ink">
                  Read how it works
                </Link>
              </div>

              {/* trust line */}
              <p className="font-mono text-[11px] text-[#938b7f] mt-7 tracking-wide">
                No card · FBR TY 2024-25 · Demo data on first run
              </p>
            </div>

            {/* interactive ledger + marginalia */}
            <div className="relative ink-rise" style={{ animationDelay: '160ms' }}>
              <span className="hidden lg:block absolute -left-14 top-32 font-serif italic text-sm text-[#938b7f] -rotate-90 origin-left whitespace-nowrap">try it — drag the numbers</span>
              <InteractiveLedger />
              <p className="font-mono text-[10px] text-[#938b7f] mt-3 text-right">fig. 1 — gross resolved to net, live</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PROOF STRIP ═══════════ */}
      <section className="border-y border-[#e2dccf] bg-[#f3efe6] overflow-hidden py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...PROOF, ...PROOF].map((p, i) => (
            <span key={i} className="flex items-center gap-4 px-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[#5c554c]">
              {p}<span className="text-[#0f766e]">✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES — alternating editorial spreads ═══════════ */}
      <section className="px-5 sm:px-8 py-24">
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <div className="max-w-3xl mb-16">
              <Kicker className="mb-5">The columns</Kicker>
              <h2 className="font-serif text-[clamp(34px,5vw,60px)] leading-[1.0] tracking-tight text-[#1c1916]">
                Everything a one-person<br /><em className="text-[#0f766e] font-light">finance department</em> needs.
              </h2>
            </div>
          </Reveal>

          <div className="space-y-px">
            <FeatureSpread
              n="01" title="Gross versus net, every payment"
              lede="The emotional core. The moment you record a payment, freelanceOS strips the platform fee, freezes the forex rate of that day, and shows the net in your base currency — large, in ink."
              flip={false}
            >
              <div className="grid sm:grid-cols-2 gap-px bg-[#e2dccf] border border-[#e2dccf]">
                {[
                  { ccy: 'USD', paid: '$500', plat: 'Upwork −10%', rate: '278.0', net: '₨1,25,100' },
                  { ccy: 'GBP', paid: '£600', plat: 'Fiverr −20%', rate: '354.2', net: '₨1,69,600' },
                ].map(r => (
                  <div key={r.ccy} className="bg-[#fffdf8] p-5 font-mono text-[11px] space-y-1.5">
                    <div className="flex justify-between text-[#938b7f]"><span>Client paid</span><span className="text-[#5c554c]">{r.paid}</span></div>
                    <div className="flex justify-between text-[#938b7f]"><span>{r.plat}</span><span className="text-[#b91c1c]">fee</span></div>
                    <div className="flex justify-between text-[#938b7f]"><span>Rate ×</span><span className="text-[#5c554c]">{r.rate}</span></div>
                    <div className="flex justify-between pt-2 border-t border-dotted border-[#e2dccf] font-semibold"><span className="text-[#0f766e]">Net kept</span><span className="text-[#0f766e]">{r.net}</span></div>
                  </div>
                ))}
              </div>
            </FeatureSpread>

            <FeatureSpread
              n="02" title="A tax engine that recomputes itself"
              lede="FBR, India IT, or Bangladesh NBR slabs, applied to your annualised income on every payment and expense. The quarterly set-aside is never a guess."
              flip
            >
              <div className="bg-[#fffdf8] border border-[#e2dccf] p-5 font-mono text-[11px]">
                {[
                  { r: '0 – 6,00,000', p: '0%', a: false },
                  { r: '6L – 12L', p: '2.5%', a: false },
                  { r: '12L – 22L', p: '12.5%', a: true },
                  { r: '22L – 32L', p: '22.5%', a: false },
                  { r: '32L +', p: '27.5%', a: false },
                ].map(s => (
                  <div key={s.r} className={`flex items-center justify-between py-2 border-b border-dotted border-[#e2dccf] last:border-0 ${s.a ? 'text-[#0f766e] font-semibold' : 'text-[#938b7f]'}`}>
                    <span>{s.r}{s.a && <span className="ml-2 text-[9px] uppercase tracking-wider text-[#b45309]">your band</span>}</span>
                    <span className="tabular-nums">{s.p}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 mt-1 border-t border-[#1c1916]">
                  <span className="text-[#5c554c] uppercase text-[9px] tracking-[0.2em] self-end">Set aside / quarter</span>
                  <span className="text-[20px] font-bold text-[#b45309]">₨6,960</span>
                </div>
              </div>
            </FeatureSpread>

            <FeatureSpread
              n="03" title="Currencies, frozen at the moment they land"
              lede="Invoice in any currency; read everything in PKR. The rate is captured the day a payment arrives and never silently revised — your history stays honest."
              flip={false}
            >
              <div className="grid grid-cols-3 gap-px bg-[#e2dccf] border border-[#e2dccf]">
                {[['USD', '278.00'], ['GBP', '354.20'], ['EUR', '301.40'], ['CAD', '203.10'], ['AUD', '184.50'], ['PKR', 'base']].map(([c, r]) => (
                  <div key={c} className="bg-[#fffdf8] px-4 py-3 font-mono text-[11px] flex flex-col">
                    <span className="text-[#1c1916] font-semibold">{c}</span>
                    <span className="text-[#938b7f] tabular-nums">{r}</span>
                  </div>
                ))}
              </div>
            </FeatureSpread>

            <FeatureSpread
              n="04" title="Ninety days of cash flow, danger marked"
              lede="Outstanding invoices and known expenses, projected forward. The week your balance dips gets marked in red — before you walk into it."
              flip
            >
              <div className="bg-[#fffdf8] border border-[#e2dccf] p-5">
                <div className="flex items-end gap-1.5 h-20">
                  {[78, 88, 70, 18, 12, 58, 74, 84].map((h, i) => {
                    const danger = h < 25;
                    return (
                      <div key={i} className="flex-1 flex items-end h-full">
                        <div className={`w-full ${danger ? 'bg-[#b91c1c]' : 'bg-[#0f766e]'}`} style={{ height: `${h}%` }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between font-mono text-[9px] text-[#938b7f] mt-2 pt-2 border-t border-dotted border-[#e2dccf]">
                  <span>Jun</span><span className="text-[#b91c1c]">danger · Jul 18–25</span><span>Sep</span>
                </div>
              </div>
            </FeatureSpread>

            <FeatureSpread
              n="05" title="Platform fees, modelled exactly"
              lede="Upwork's sliding 10%→5%, Fiverr's flat 20%, or a direct client at zero. Deducted automatically, never estimated by hand."
              flip={false}
            >
              <div className="bg-[#fffdf8] border border-[#e2dccf] p-5 space-y-3.5">
                {[['Upwork', '10→5%', 60], ['Fiverr', '20%', 100], ['Direct', '0%', 4]].map(([n, f, w]) => (
                  <div key={n}>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-[#1c1916]">{n}</span><span className="text-[#5c554c]">{f}</span>
                    </div>
                    <div className="h-1.5 bg-[#efeadf]"><div className="h-full bg-[#b45309]" style={{ width: `${w}%` }} /></div>
                  </div>
                ))}
              </div>
            </FeatureSpread>

            <FeatureSpread
              n="06" title="Overdue, aged and named"
              lede="30 / 60 / 90+ day buckets, reminder sequences, and a reliability score that quietly remembers which clients pay late."
              flip
            >
              <div className="grid grid-cols-3 gap-px bg-[#e2dccf] border border-[#e2dccf]">
                {[['30d', '1', '₨84k', '#b45309'], ['60d', '0', '—', '#938b7f'], ['90d+', '1', '₨1.35L', '#b91c1c']].map(([l, n, amt, col]) => (
                  <div key={l} className="bg-[#fffdf8] px-4 py-4 text-center">
                    <p className="font-mono text-3xl font-bold leading-none" style={{ color: col }}>{n}</p>
                    <p className="font-mono text-[10px] mt-1.5 text-[#5c554c]">{l}</p>
                    <p className="font-mono text-[9px] text-[#938b7f] mt-0.5">{amt}</p>
                  </div>
                ))}
              </div>
            </FeatureSpread>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="px-5 sm:px-8 py-20 bg-[#1c1916] text-[#faf8f3]">
        <div className="max-w-[1280px] mx-auto">
          <Reveal><Kicker className="mb-12 !text-[#a89f92]" mark={false}>By the numbers</Kicker></Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { node: <Counter to={2400} suffix="+" />, ctx: 'Freelancers keeping their ledger here' },
              { node: '₨1.2B+', ctx: 'Net income tracked across accounts' },
              { node: <Counter to={8400} suffix="+" />, ctx: 'Invoices issued and reconciled' },
              { node: <Counter to={3} />, ctx: 'Tax regimes — FBR, India IT, NBR' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <p className="font-serif text-[clamp(44px,6vw,72px)] leading-none text-[#faf8f3] tabular-nums">{s.node}</p>
                <div className="w-10 h-px bg-[#0f766e] my-4" />
                <p className="text-[13px] text-[#a89f92] leading-snug max-w-[200px]">{s.ctx}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="px-5 sm:px-8 py-24">
        <div className="max-w-[1280px] mx-auto">
          <Reveal><div className="mb-14"><Kicker className="mb-5">The method</Kicker>
            <h2 className="font-serif text-[clamp(34px,5vw,56px)] leading-[1.0] tracking-tight">Three movements,<br /><em className="text-[#0f766e] font-light">then it runs itself.</em></h2></div></Reveal>
          <div className="grid md:grid-cols-3 border-t border-[#1c1916]">
            {[
              { n: 'I', t: 'Set the stage once', d: 'Add clients with their billing currency and platform. Choose your base currency and tax regime. Ten minutes, never again.' },
              { n: 'II', t: 'Invoice, then record', d: "Issue in the client's currency. When they pay, record it — the fee comes off, the rate is frozen, the net lands in your base currency." },
              { n: 'III', t: 'Watch the ledger breathe', d: 'Every entry recomputes tax and redraws the 90-day forecast in real time. You just read the numbers.' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100} className={`p-8 border-b border-[#1c1916] md:border-b-0 ${i < 2 ? 'md:border-r border-[#e2dccf]' : ''}`}>
                <p className="font-serif text-6xl text-[#0f766e] leading-none mb-6">{s.n}</p>
                <h3 className="font-serif text-2xl text-[#1c1916] mb-3 leading-snug">{s.t}</h3>
                <p className="text-[15px] text-[#5c554c] leading-relaxed">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="px-5 sm:px-8 py-24 bg-[#f3efe6] border-y border-[#e2dccf]">
        <div className="max-w-[1280px] mx-auto">
          <Reveal><Kicker className="mb-10">Letters from the desk</Kicker></Reveal>
          <Reveal>
            <blockquote className="font-serif text-[clamp(24px,3.4vw,42px)] leading-[1.25] text-[#1c1916] max-w-4xl">
              <span className="text-[#0f766e]">“</span>I finally stopped guessing my tax bracket. The FBR slabs update on their own — I know exactly what to set aside each quarter, <em className="text-[#0f766e]">without ever opening a spreadsheet.</em><span className="text-[#0f766e]">”</span>
            </blockquote>
          </Reveal>
          <Reveal className="flex items-center gap-4 mt-8">
            <div className="w-11 h-11 rounded-full bg-[#0f766e] text-[#faf8f3] flex items-center justify-center font-serif text-lg">A</div>
            <div>
              <p className="font-medium text-[#1c1916]">Ahsan Raza</p>
              <p className="font-mono text-[11px] text-[#938b7f]">Full-stack dev · Upwork Top Rated · Lahore · ~$3,200/mo USD→PKR</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-px bg-[#e2dccf] border border-[#e2dccf] mt-14">
            {[
              { q: 'The gross-vs-net view showed me I was undercharging by 25% — I had never priced in Fiverr taking a fifth of every job.', n: 'Ayesha Malik', r: 'UI/UX Designer · Fiverr Pro · Karachi · ~£1,800/mo' },
              { q: 'The overdue tracker flagged a UK client sitting on €2,400 for three months. One reminder. Paid in 48 hours.', n: 'Zubair Ahmed', r: 'Backend Engineer · Direct EU clients · Islamabad · ~€2,100/mo' },
            ].map(t => (
              <Reveal key={t.n} className="bg-[#faf8f3] p-8">
                <p className="font-serif text-xl text-[#1c1916] leading-snug mb-6">“{t.q}”</p>
                <p className="font-medium text-[#1c1916] text-sm">{t.n}</p>
                <p className="font-mono text-[11px] text-[#938b7f] mt-0.5">{t.r}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="px-5 sm:px-8 py-28">
        <div className="max-w-[1280px] mx-auto text-center">
          <Reveal>
            <Kicker className="mb-6 justify-center flex">Last page</Kicker>
            <h2 className="font-serif text-[clamp(40px,7vw,84px)] leading-[0.95] tracking-tight text-[#1c1916]">
              Know what you<br /><em className="text-[#0f766e] font-light">actually kept.</em>
            </h2>
            <p className="text-[#5c554c] text-lg mt-6 max-w-md mx-auto leading-relaxed">
              Free to start, no card, with a fully-populated demo account waiting before your first real invoice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
              <Link to="/register" className="group inline-flex items-center gap-2 bg-[#1c1916] hover:bg-[#0f766e] text-[#faf8f3] px-8 py-4 text-base font-medium transition-colors">
                Open your ledger <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/features" className="inline-flex items-center gap-2 border border-[#d4ccbb] hover:border-[#1c1916] text-[#1c1916] px-8 py-4 text-base transition-colors">
                See every feature
              </Link>
            </div>
            <p className="font-mono text-[11px] text-[#938b7f] mt-7">First invoice in under ten minutes</p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="px-5 sm:px-8 pb-28">
        <div className="max-w-3xl mx-auto">
          <Reveal><div className="mb-8"><Kicker className="mb-5">In the margins</Kicker>
            <h2 className="font-serif text-[clamp(30px,4vw,48px)] leading-tight tracking-tight">Questions, answered.</h2></div></Reveal>
          <div className="border-t border-[#1c1916]">
            {FAQS.map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />)}
          </div>
        </div>
      </section>
    </>
  );
}

// ── alternating feature spread ──
function FeatureSpread({ n, title, lede, children, flip }) {
  return (
    <Reveal className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center py-12 border-t border-[#e2dccf]">
      <div className={flip ? 'lg:order-2' : ''}>
        <div className="flex items-baseline gap-4 mb-4">
          <span className="font-serif text-5xl text-[#0f766e] leading-none">{n}</span>
          <span className="h-px flex-1 bg-[#e2dccf]" />
        </div>
        <h3 className="font-serif text-[clamp(26px,3vw,38px)] leading-[1.05] text-[#1c1916] tracking-tight mb-4">{title}</h3>
        <p className="text-[16px] text-[#5c554c] leading-relaxed max-w-md">{lede}</p>
      </div>
      <div className={flip ? 'lg:order-1' : ''}>{children}</div>
    </Reveal>
  );
}
