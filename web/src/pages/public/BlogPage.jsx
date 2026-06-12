import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal, Kicker } from '../../components/public/primitives';

const POSTS = [
  { id: 1, slug: "fbr-quarterly-advance-tax", cat: "Tax", title: "The freelancer's guide to FBR quarterly advance tax", excerpt: "When the quarters fall, how the slabs apply to foreign income, and the exact figure to set aside each time a payment lands.", date: "Jun 2, 2026", read: "8 min", featured: true },
  { id: 2, slug: "freeze-usd-pkr-rate", cat: "Forex", title: "Why your USD→PKR rate should be frozen, not floating", excerpt: "The case against revaluing your past. How freezing the rate at payment keeps your books — and your tax — honest.", date: "May 21, 2026", read: "5 min" },
  { id: 3, slug: "upwork-sliding-fee-decoded", cat: "Platforms", title: "Upwork's sliding fee, decoded", excerpt: "The 10%→5% threshold, when it resets, and what it really costs you across a year of one big client.", date: "May 9, 2026", read: "6 min" },
  { id: 4, slug: "90-day-cashflow-forecast", cat: "Cash flow", title: "Reading a 90-day forecast before it reads you", excerpt: "Danger windows are predictable. Here's how to spot the week your balance dips and invoice around it.", date: "Apr 28, 2026", read: "7 min" },
  { id: 5, slug: "india-it-vs-pakistan-fbr", cat: "Tax", title: "India IT vs Pakistan FBR: a side-by-side for cross-border freelancers", excerpt: "Two regimes, one freelancer. What changes when you switch presets, and what stays the same.", date: "Apr 14, 2026", read: "9 min" },
  { id: 6, slug: "invite-accountant-read-only", cat: "Practice", title: "Inviting your accountant without handing over the keys", excerpt: "How read-only access works, what your CA actually sees, and why hiding write controls beats disabling them.", date: "Apr 1, 2026", read: "4 min" },
];

const CATS = ['All', 'Tax', 'Forex', 'Platforms', 'Cash flow', 'Practice'];

export default function BlogPage() {
  const [cat, setCat] = useState('All');
  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured && (cat === 'All' || p.cat === cat));
  const showFeatured = cat === 'All' || featured.cat === cat;

  return (
    <>
      {/* masthead */}
      <section className="pt-28 pb-10 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="border-y border-[#1c1916] py-2 mb-10 flex justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">The Journal</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">Dispatches on freelance money</span>
          </div>
          <h1 className="font-serif opt-display text-[clamp(40px,6.5vw,84px)] leading-[0.95] tracking-[-0.02em] max-w-4xl">
            Notes from the<br /><em className="text-[#0f766e] font-light">margins</em> of the ledger.
          </h1>
        </div>
      </section>

      {/* featured */}
      {showFeatured && (
        <section className="px-5 sm:px-8 pb-12">
          <div className="max-w-[1280px] mx-auto">
            <Reveal className="grid lg:grid-cols-2 gap-8 lg:gap-12 border-t border-[#1c1916] pt-10 items-center">
              <div className="aspect-[4/3] bg-[#1c1916] relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#0f766e 0 1px,transparent 1px 22px)' }} />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-mono text-[42px] leading-none text-[#5eead4]">₨</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#a89f92] mt-3">Featured · {featured.cat}</p>
                </div>
              </div>
              <div>
                <Kicker className="mb-4">Editor's pick</Kicker>
                <h2 className="font-serif text-[clamp(28px,3.6vw,48px)] leading-[1.05] tracking-tight text-[#1c1916] mb-4">{featured.title}</h2>
                <p className="text-[16px] text-[#5c554c] leading-relaxed mb-6 max-w-xl">{featured.excerpt}</p>
                <div className="flex items-center gap-4 font-mono text-[11px] text-[#938b7f] mb-6">
                  <span>{featured.date}</span><span>·</span><span>{featured.read} read</span>
                </div>
                <Link to={`/blog/${featured.slug}`} className="group inline-flex items-center gap-2 text-sm font-medium text-[#1c1916] link-ink">
                  Read the dispatch <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* category tabs */}
      <section className="px-5 sm:px-8 pb-8">
        <div className="max-w-[1280px] mx-auto flex flex-wrap gap-2 border-t border-[#e2dccf] pt-8">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] border transition-colors ${cat === c ? 'bg-[#1c1916] text-[#faf8f3] border-[#1c1916]' : 'border-[#d4ccbb] text-[#5c554c] hover:text-[#1c1916] hover:border-[#1c1916]'}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* grid */}
      <section className="px-5 sm:px-8 pb-16">
        <div className="max-w-[1280px] mx-auto">
          {rest.length === 0 ? (
            <p className="font-serif text-2xl text-[#938b7f] py-16 text-center">No dispatches in this column — yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e2dccf] border border-[#e2dccf]">
              {rest.map((p, i) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="block">
                  <Reveal delay={(i % 3) * 70} as="article"
                    className="bg-[#faf8f3] p-7 flex flex-col group hover:bg-[#fffdf8] transition-colors h-full">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0f766e] mb-4">{p.cat}</span>
                    <h3 className="font-serif text-2xl leading-snug text-[#1c1916] mb-3 group-hover:text-[#0f766e] transition-colors">{p.title}</h3>
                    <p className="text-[14px] text-[#5c554c] leading-relaxed mb-6 flex-1">{p.excerpt}</p>
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#938b7f] pt-4 border-t border-dotted border-[#e2dccf]">
                      <span>{p.date}</span><span>{p.read}</span>
                    </div>
                  </Reveal>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* pagination (static) */}
      <section className="px-5 sm:px-8 pb-16">
        <div className="max-w-[1280px] mx-auto flex items-center justify-center gap-2">
          {['‹', '1', '2', '3', '›'].map((p, i) => (
            <button key={i} className={`w-9 h-9 font-mono text-sm border transition-colors ${p === '1' ? 'bg-[#1c1916] text-[#faf8f3] border-[#1c1916]' : 'border-[#d4ccbb] text-[#5c554c] hover:border-[#1c1916] hover:text-[#1c1916]'}`}>{p}</button>
          ))}
        </div>
      </section>

      {/* newsletter */}
      <section className="px-5 sm:px-8 py-20 bg-[#1c1916] text-[#faf8f3]">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <h2 className="font-serif text-[clamp(30px,4vw,52px)] leading-tight tracking-tight">
            The dispatch lands<br /><em className="text-[#5eead4] font-light">once a month.</em>
          </h2>
          <Newsletter />
        </div>
      </section>
    </>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return sent ? (
    <p className="font-mono text-[#5eead4]">✦ Subscribed. The next issue is yours.</p>
  ) : (
    <form onSubmit={e => { e.preventDefault(); if (ok) { setSent(true); setEmail(''); } }} className="flex border border-[#3a352e]">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@studio.com"
        className="flex-1 px-4 py-3.5 bg-transparent text-[#faf8f3] placeholder-[#6b6356] focus:outline-none" />
      <button disabled={!ok} className="px-6 bg-[#faf8f3] text-[#1c1916] font-medium disabled:opacity-40">Subscribe</button>
    </form>
  );
}
