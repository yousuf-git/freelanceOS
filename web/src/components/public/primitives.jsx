import { useState, useEffect, useRef } from 'react';

/* ════════════════════════════════════════════════════════════════
   EDITORIAL PRINT primitives — shared across all public pages.
   Palette (arbitrary hex, kept consistent everywhere):
     paper #faf8f3 · paper-2 #f3efe6 · paper-3 #efeadf
     ink #1c1916 · ink-soft #5c554c · ink-faint #938b7f
     rule #e2dccf · rule-strong #d4ccbb
     teal #0f766e · cyan #0e7490 · amber #b45309 · red #b91c1c · green #15803d
   ════════════════════════════════════════════════════════════════ */

// ── Reveal on scroll ────────────────────────────────────────────
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

// ── Kicker: mono uppercase magazine label ───────────────────────
export function Kicker({ children, className = '', mark = true }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c] ${className}`}>
      {mark && <span className="text-[#0f766e]">✦</span>}
      {children}
    </span>
  );
}

// ── Hairline rule, optionally labelled ──────────────────────────
export function Rule({ label, className = '' }) {
  if (!label) return <hr className={`border-0 border-t border-[#e2dccf] ${className}`} />;
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <hr className="flex-1 border-0 border-t border-[#e2dccf]" />
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#938b7f] whitespace-nowrap">{label}</span>
      <hr className="flex-1 border-0 border-t border-[#e2dccf]" />
    </div>
  );
}

// ── Count-up number (mono) ──────────────────────────────────────
export function Counter({ to, prefix = '', suffix = '', decimals = 0, className = '' }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const dur = 1500, t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          setN((1 - Math.pow(1 - p, 3)) * to);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);
  const val = decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-IN');
  return <span ref={ref} className={className}>{prefix}{val}{suffix}</span>;
}

// ── FAQ item: editorial collapsible ─────────────────────────────
export function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#e2dccf]">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-baseline justify-between gap-6 py-6 text-left group">
        <span className="font-serif text-xl md:text-2xl text-[#1c1916] leading-snug group-hover:text-[#0f766e] transition-colors">{q}</span>
        <span className="font-mono text-2xl text-[#938b7f] leading-none flex-shrink-0 transition-transform" style={{ transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      <div className="grid transition-all duration-300" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <p className="text-[15px] text-[#5c554c] leading-relaxed pb-6 max-w-2xl">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   The signature INTERACTIVE LEDGER — gross → deductions → NET KEPT.
   Pure client-side: real FBR TY 2024-25 slabs, approx forex.
   ════════════════════════════════════════════════════════════════ */
export const RATES = { USD: 278, GBP: 354, EUR: 301 };
export const FEES  = { upwork: 0.10, fiverr: 0.20, direct: 0 };
const FBR = [
  { cap: 600_000,   rate: 0,     fix: 0 },
  { cap: 1_200_000, rate: 0.025, fix: 0 },
  { cap: 2_200_000, rate: 0.125, fix: 15_000 },
  { cap: 3_200_000, rate: 0.225, fix: 140_000 },
  { cap: Infinity,  rate: 0.275, fix: 365_000 },
];
export function calcFBR(annual) {
  let prev = 0;
  for (const s of FBR) {
    if (annual <= s.cap) return s.fix + (annual - prev) * s.rate;
    prev = s.cap;
  }
  return 0;
}
const SYM = { USD: '$', GBP: '£', EUR: '€' };

export function InteractiveLedger() {
  const [raw, setRaw]   = useState('5000');
  const [ccy, setCcy]   = useState('USD');
  const [plat, setPlat] = useState('upwork');

  const g    = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
  const fee  = g * FEES[plat];
  const net  = g - fee;
  const pkr  = net * RATES[ccy];
  const tax  = calcFBR(pkr * 12) / 4;
  const kept = pkr - tax / 3; // monthly view: quarterly aside spread

  const S  = SYM[ccy];
  const pf = v => `${S}${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const rp = v => '₨' + Math.round(v).toLocaleString('en-IN');
  const keptPct = g > 0 ? Math.max(8, Math.round((kept / (g * RATES[ccy])) * 100)) : 0;

  return (
    <div className="bg-[#fffdf8] border border-[#d4ccbb] shadow-[0_1px_0_#e2dccf,0_30px_60px_-30px_rgba(28,25,22,0.25)]">
      {/* masthead */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2dccf]">
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">The Ledger</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#0f766e]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-pulse" /> live
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* inputs */}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#938b7f] mb-2">Monthly gross</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#938b7f]">{S}</span>
              <input
                type="number" min="0" value={raw} onChange={e => setRaw(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 bg-[#faf8f3] border border-[#d4ccbb] font-mono text-sm text-[#1c1916] text-right tabular-nums focus:outline-none focus:border-[#0f766e] transition-colors"
              />
            </div>
            <div className="flex">
              {Object.keys(RATES).map((c, i) => (
                <button key={c} onClick={() => setCcy(c)}
                  className={`px-2.5 font-mono text-xs font-semibold border border-[#d4ccbb] transition-colors ${i > 0 ? '-ml-px' : ''} ${ccy === c ? 'bg-[#1c1916] text-[#faf8f3]' : 'bg-[#faf8f3] text-[#5c554c] hover:text-[#1c1916]'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#938b7f] mb-2">Platform</p>
          <div className="grid grid-cols-3">
            {[
              { id: 'upwork', label: 'Upwork', sub: '10%' },
              { id: 'fiverr', label: 'Fiverr', sub: '20%' },
              { id: 'direct', label: 'Direct', sub: '0%' },
            ].map((p, i) => (
              <button key={p.id} onClick={() => setPlat(p.id)}
                className={`py-2 border border-[#d4ccbb] transition-colors ${i > 0 ? '-ml-px' : ''} ${plat === p.id ? 'bg-[#0f766e] text-[#faf8f3]' : 'bg-[#faf8f3] text-[#5c554c] hover:text-[#1c1916]'}`}>
                <div className="text-xs font-medium">{p.label}</div>
                <div className={`font-mono text-[9px] mt-0.5 ${plat === p.id ? 'text-[#a7e8df]' : 'text-[#938b7f]'}`}>{p.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ledger lines */}
        <div className="font-mono text-xs space-y-0 pt-1">
          {[
            { l: `Gross (${ccy})`, v: pf(g), c: 'text-[#5c554c]' },
            { l: `Platform fee`,   v: fee > 0 ? `−${pf(fee)}` : '—', c: fee > 0 ? 'text-[#b91c1c]' : 'text-[#938b7f]' },
            { l: `Convert ×${RATES[ccy]}`, v: rp(net * RATES[ccy]), c: 'text-[#5c554c]' },
            { l: `FBR set-aside`,  v: `−${rp(tax / 3)}`, c: 'text-[#b45309]' },
          ].map(row => (
            <div key={row.l} className="flex items-baseline justify-between py-1.5 border-b border-dotted border-[#e2dccf]">
              <span className="text-[#938b7f]">{row.l}</span>
              <span className={`tabular-nums ${row.c}`}>{row.v}</span>
            </div>
          ))}
        </div>

        {/* NET KEPT — the hero figure */}
        <div className="pt-1">
          <div className="flex items-end justify-between mb-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#5c554c]">Net kept / mo</span>
            <span className="font-mono text-[28px] leading-none font-bold text-[#0f766e] tabular-nums">{rp(kept)}</span>
          </div>
          {/* kept-of-gross bar */}
          <div className="h-2 bg-[#efeadf] overflow-hidden">
            <div className="h-full bg-[#0f766e] transition-all duration-500" style={{ width: `${keptPct}%` }} />
          </div>
          <p className="font-mono text-[9px] text-[#938b7f] mt-1.5">{keptPct}% of gross reaches your account · FBR TY 2024-25</p>
        </div>
      </div>
    </div>
  );
}
