import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Reveal, Kicker } from '../../components/public/primitives';

const POSTS = [
  {
    id: 1,
    slug: 'fbr-quarterly-advance-tax',
    cat: 'Tax',
    title: 'The freelancer’s guide to FBR quarterly advance tax',
    excerpt: 'When the quarters fall, how the slabs apply to foreign income, and the exact figure to set aside each time a payment lands.',
    date: 'Jun 2, 2026',
    read: '8 min',
    featured: true,
    content: [
      { type: 'p', text: 'FBR requires every taxpayer whose annual income exceeds PKR 600,000 to pay advance tax in four quarterly instalments. For freelancers, that deadline is easy to miss — there is no employer deducting it at source.' },
      { type: 'h2', text: 'The four quarters and their deadlines' },
      { type: 'ul', items: ['Q1 (July–September) — due 25 September', 'Q2 (October–December) — due 25 December', 'Q3 (January–March) — due 25 March', 'Q4 (April–June) — due 15 June'] },
      { type: 'p', text: 'Each instalment is one quarter of your estimated annual tax liability. Use last year’s assessed tax as your baseline if you don’t have a firm projection for the current year.' },
      { type: 'h2', text: 'How foreign income is treated' },
      { type: 'p', text: 'Foreign-source income is generally taxable in Pakistan for tax residents. However, under SRO 1006(I)/2021, freelancers who receive payment through official banking channels and are registered as filers can claim a reduced 1% final tax rate on foreign IT/IT-enabled services income. This is a flat final tax — advance tax on these amounts is adjusted accordingly.' },
      { type: 'blockquote', text: 'Practical rule: use 1% of gross foreign receipts as your advance tax estimate for tech-service income brought in through a bank or a platform like Upwork or Fiverr.' },
      { type: 'h2', text: 'The set-aside habit' },
      { type: 'p', text: 'The single most reliable way to avoid a lump-sum surprise in June is to transfer your tax estimate to a separate savings account the same day a payment lands. For most freelancers in the PKR 1.2M–4M income band, 15–20% covers the liability with a margin.' },
      { type: 'p', text: 'Track your running liability in your ledger. Every new payment should update the estimate — not just once a year at filing time.' },
    ],
  },
  {
    id: 2,
    slug: 'freeze-usd-pkr-rate',
    cat: 'Forex',
    title: 'Why your USD→PKR rate should be frozen, not floating',
    excerpt: 'The case against revaluing your past. How freezing the rate at payment keeps your books — and your tax — honest.',
    date: 'May 21, 2026',
    read: '5 min',
    content: [
      { type: 'p', text: 'The PKR/USD exchange rate has moved as much as 40% in a single calendar year. If your bookkeeping system revalues historical payments at the current rate, something quietly wrong happens: your income history changes without you receiving a single extra rupee.' },
      { type: 'h2', text: 'The revaluation problem' },
      { type: 'p', text: 'Suppose you received $1,000 in January at a rate of PKR 278, recording PKR 278,000 in income. By December the rate is PKR 310. A floating system revalues that old payment to PKR 310,000 — a PKR 32,000 increase in “income” that you never received. Your tax estimate climbs. Your profitability chart looks better than reality.' },
      { type: 'blockquote', text: 'Revaluing past payments is accounting fiction. You received PKR 278,000 in January. That is the fact. The December rate is irrelevant to January’s income.' },
      { type: 'h2', text: 'Why freezing matters for tax' },
      { type: 'p', text: 'FBR assesses income based on the amount received. The rate in force at the time of receipt — specifically the State Bank of Pakistan’s official rate on the payment date — is what determines your PKR income for that transaction. Freezing the rate at payment time keeps your records aligned with what you would present to a tax authority.' },
      { type: 'h2', text: 'How to do it in practice' },
      { type: 'p', text: 'When recording a payment, pull the day’s interbank or SBP rate. Enter it once, lock it, and never revisit it. If the rate was unavailable (weekend, holiday), use the next available official rate and note it. freelanceOS fetches and freezes this automatically at payment time — manual entry is only needed when the external rate API is unavailable.' },
    ],
  },
  {
    id: 3,
    slug: 'upwork-sliding-fee-decoded',
    cat: 'Platforms',
    title: 'Upwork’s sliding fee, decoded',
    excerpt: 'The 10%→5% threshold, when it resets, and what it really costs you across a year of one big client.',
    date: 'May 9, 2026',
    read: '6 min',
    content: [
      { type: 'p', text: 'Upwork’s service fee is not a flat 10%. It is a sliding scale that rewards long-term relationships — and penalises new ones. Understanding exactly where you stand with each client changes how you price and how you invoice.' },
      { type: 'h2', text: 'The three tiers' },
      { type: 'ul', items: ['20% on the first $500 billed to any client (new relationship)', '10% from $500.01 to $10,000 (established relationship)', '5% above $10,000 (mature relationship)'] },
      { type: 'p', text: 'These thresholds are per client relationship, not per contract or per year. They are cumulative and do not reset annually. If you’ve billed a client $9,800 over two years, your next $200 with them is still at 10% — after that, everything is at 5%.' },
      { type: 'h2', text: 'What it actually costs you across a year' },
      { type: 'p', text: 'Consider a freelancer billing $2,000 per month to a single established client. At the 5% tier: $1,200 in annual fees. If that same $24,000 were billed across four new clients ($6,000 each), every dollar sits in the 10% tier: $2,400 in fees. The difference — $1,200 — is a month’s work, surrendered in fees simply because of client concentration.' },
      { type: 'blockquote', text: 'The cheapest client you have on Upwork is the one you’ve worked with the longest.' },
      { type: 'h2', text: 'Sliding fee vs fixed-price contracts' },
      { type: 'p', text: 'Fixed-price milestones and hourly contracts are treated identically for fee calculation purposes — the milestone amount counts toward the lifetime billing total the same way an hourly bill does. Bonus payments are also included.' },
      { type: 'h2', text: 'Platform comparison in your books' },
      { type: 'p', text: 'Track effective fee rate per platform in your ledger, not the stated rate. If you’re at the 5% tier with your main Upwork client but paying 20% to Fiverr across multiple small gigs, the platform comparison report will surface that clearly. Net yield per platform — after fees and currency conversion — is the number that actually matters.' },
    ],
  },
  {
    id: 4,
    slug: '90-day-cashflow-forecast',
    cat: 'Cash flow',
    title: 'Reading a 90-day forecast before it reads you',
    excerpt: 'Danger windows are predictable. Here’s how to spot the week your balance dips and invoice around it.',
    date: 'Apr 28, 2026',
    read: '7 min',
    content: [
      { type: 'p', text: 'A cash-flow forecast is not a prediction — it is a map of what you’ve already committed to. Every outstanding invoice, every scheduled recurring expense, every known payment is already in the data. The question is just whether you’ve drawn the line.' },
      { type: 'h2', text: 'Three types of events on the timeline' },
      { type: 'ul', items: ['Confirmed income — payments already received, recorded in your ledger. These are certain.', 'Expected income — outstanding invoices with a due date. These are probable but not guaranteed.', 'Scheduled expenses — recurring costs (software, subscriptions, rent) with known dates. These are nearly certain.'] },
      { type: 'p', text: 'The forecast projects a running balance across all three. The opening balance is what you have now. Each event shifts the line up or down.' },
      { type: 'h2', text: 'Danger windows' },
      { type: 'p', text: 'A danger window is any period where the projected balance drops below your configured threshold. The threshold is personal — a freelancer with two dependants and a home office has a different floor than a solo developer in a shared flat. Set yours deliberately, then watch the forecast for dips.' },
      { type: 'blockquote', text: 'A danger window two months out is a scheduling problem. A danger window next week is a crisis. The same information, discovered at different times.' },
      { type: 'h2', text: 'Tactics for smoothing the line' },
      { type: 'p', text: 'Stagger invoice due dates instead of sending everything at the start of the month. If three clients all pay Net-30 from a July 1 invoice date, your August 1 looks flush and August 31 looks thin. Shifting one client to Net-15 and another to Net-45 flattens the curve.' },
      { type: 'p', text: 'Send reminders 7 days before due — not after. A polite note while an invoice is still current costs nothing and measurably improves payment timing.' },
      { type: 'p', text: 'For large projects, negotiate a 30–50% advance payment before work begins. This shifts a future expected payment into confirmed income and removes a large uncertainty from the forecast.' },
    ],
  },
  {
    id: 5,
    slug: 'india-it-vs-pakistan-fbr',
    cat: 'Tax',
    title: 'India IT vs Pakistan FBR: a side-by-side',
    excerpt: 'Two regimes, one freelancer. What changes when you switch presets, and what stays the same.',
    date: 'Apr 14, 2026',
    read: '9 min',
    content: [
      { type: 'p', text: 'Many South Asian freelancers earn from the same pool of international clients, but their tax obligations diverge sharply at the border. Here’s a direct comparison of the two most common regimes for tech freelancers in the region.' },
      { type: 'h2', text: 'Fiscal year' },
      { type: 'ul', items: ['Pakistan FBR: 1 July – 30 June. Filing deadline: 30 September (individual).', 'India IT: 1 April – 31 March. Filing deadline: 31 July (no audit required), 31 October (with audit).'] },
      { type: 'h2', text: 'Slabs (indicative, FY 2024–25)' },
      { type: 'p', text: 'Pakistan FBR (resident individual): 0% on first PKR 600,000; up to 35% on income exceeding PKR 6,000,000. Seven bands in between. The 1% final tax regime for IT-enabled services income brought through official banking channels significantly reduces effective rates for qualifying freelancers.' },
      { type: 'p', text: 'India IT (new regime, FY 2024–25): 0% on first INR 300,000; 5% up to 700,000; 10% up to 1,000,000; 15% up to 1,200,000; 20% up to 1,500,000; 30% above 1,500,000. Section 87A rebate eliminates tax for income under INR 700,000.' },
      { type: 'h2', text: 'Foreign income treatment' },
      { type: 'ul', items: ['FBR: Foreign-source income is taxable for tax residents. The 1% FTR for IT services income remitted through banking channels is the most favourable treatment available to Pakistani freelancers.', 'India IT: Global income is taxable for residents (183+ days in India). No blanket IT-sector exemption, though export of services is not subject to GST under the IGST Act LUT procedure.'] },
      { type: 'h2', text: 'Advance tax' },
      { type: 'ul', items: ['FBR: Quarterly, due dates in September, December, March, June.', 'India IT: Quarterly, due dates in June (15%), September (45%), December (75%), March (100% of liability).'] },
      { type: 'h2', text: 'Switching between presets' },
      { type: 'p', text: 'If you relocate and need to switch your tax regime preset in freelanceOS: export an annual summary PDF for your current fiscal year before switching. The slab calculation is applied to your existing payment history at the new regime’s rates when you update the setting. Always confirm your exact residency status with a qualified chartered accountant before switching — these summaries are estimates, not filing-grade advice.' },
    ],
  },
  {
    id: 6,
    slug: 'invite-accountant-read-only',
    cat: 'Practice',
    title: 'Inviting your accountant without handing over the keys',
    excerpt: 'How read-only access works, what your CA actually sees, and why hiding write controls beats disabling them.',
    date: 'Apr 1, 2026',
    read: '4 min',
    content: [
      { type: 'p', text: 'Your chartered accountant needs to see your income, expenses, and tax liability to do their job. They do not need to create invoices, delete payments, or change your tax slab configuration. The distinction matters more than it seems.' },
      { type: 'h2', text: 'What read-only access actually means' },
      { type: 'p', text: 'A read-only accountant role in freelanceOS can: view all clients, invoices, payments, expenses, and tax configuration; run reports for any fiscal year; export the annual tax-ready PDF. They cannot: create, edit, or delete any record; change account settings; invite additional users.' },
      { type: 'blockquote', text: 'Read-only is a server-enforced permission, not a UI trick. Write endpoints return 403 for accountant tokens regardless of what the interface shows.' },
      { type: 'h2', text: 'Multi-client accountants' },
      { type: 'p', text: 'A single accountant can serve multiple freelancer clients. Each invite is scoped to one account. When your CA logs in, they select which account to view — they cannot see across accounts simultaneously, and there is no data leakage between their clients.' },
      { type: 'h2', text: 'The right time to invite' },
      { type: 'p', text: 'The most useful time to grant access is not at filing time. It is whenever you want an outside eye on your books — mid-year, before making a large purchase, or when you receive a tax notice. An accountant who has been watching your ledger for six months will file a far more accurate return than one who receives a spreadsheet in September.' },
      { type: 'h2', text: 'Revoking access' },
      { type: 'p', text: 'Revocation is immediate. Their access tokens are invalidated server-side. You do not need to change your own password or any other credential.' },
    ],
  },
];

function renderBlock(block, idx) {
  switch (block.type) {
    case 'p':
      return (
        <p key={idx} className="text-[16px] text-[#5c554c] leading-[1.75] mb-5">
          {block.text}
        </p>
      );
    case 'h2':
      return (
        <h2 key={idx} className="font-serif text-[26px] text-[#1c1916] mt-10 mb-4 tracking-tight">
          {block.text}
        </h2>
      );
    case 'ul':
      return (
        <ul key={idx} className="space-y-2 mb-5 pl-0 list-none">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-[15px] text-[#5c554c]">
              <span className="text-[#0f766e] mt-1.5 flex-shrink-0">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'blockquote':
      return (
        <blockquote key={idx} className="border-l-4 border-[#0f766e] pl-6 my-8 font-serif text-[20px] text-[#1c1916] leading-snug italic">
          {block.text}
        </blockquote>
      );
    default:
      return null;
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#938b7f] mb-4">404</p>
        <h1 className="font-serif text-[clamp(32px,5vw,56px)] text-[#1c1916] mb-4 tracking-tight">
          Dispatch not found.
        </h1>
        <p className="text-[15px] text-[#5c554c] mb-8 max-w-sm">
          This issue may have moved or never existed. Return to the journal and browse from there.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#0f766e] hover:text-[#1c1916] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to The Journal
        </Link>
      </div>
    );
  }

  const others = POSTS.filter(p => p.slug !== slug).slice(0, 2);

  return (
    <>
      {/* masthead bar */}
      <section className="pt-28 pb-0 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="border-y border-[#1c1916] py-2 mb-10 flex justify-between">
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c] hover:text-[#1c1916] transition-colors"
            >
              <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
              The Journal
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">
              Dispatches on freelance money
            </span>
          </div>
        </div>
      </section>

      {/* article header */}
      <section className="px-5 sm:px-8 pb-10">
        <div className="max-w-[720px] mx-auto">
          <Reveal>
            <Kicker className="mb-5">{post.cat}</Kicker>
            <h1 className="font-serif text-[clamp(32px,5vw,52px)] leading-[1.04] tracking-[-0.02em] text-[#1c1916] mb-6">
              {post.title}
            </h1>
            <p className="text-[18px] text-[#5c554c] leading-relaxed mb-6 max-w-[600px]">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#938b7f] pb-8 border-b border-[#e2dccf]">
              <span>{post.date}</span>
              <span className="text-[#d4ccbb]">/</span>
              <span>{post.read} read</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* article body */}
      <article className="px-5 sm:px-8 pb-16">
        <div className="max-w-[720px] mx-auto">
          {post.content.map((block, idx) => renderBlock(block, idx))}
        </div>
      </article>

      {/* more dispatches */}
      <section className="px-5 sm:px-8 pb-20 border-t border-[#e2dccf]">
        <div className="max-w-[1280px] mx-auto pt-12">
          <div className="flex items-baseline justify-between mb-8">
            <Kicker mark={false}>More dispatches</Kicker>
            <Link
              to="/blog"
              className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#5c554c] hover:text-[#0f766e] transition-colors"
            >
              All issues
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-[#e2dccf] border border-[#e2dccf]">
            {others.map((p, i) => (
              <Reveal key={p.id} delay={i * 80} as="article">
                <Link
                  to={`/blog/${p.slug}`}
                  className="group flex flex-col h-full bg-[#faf8f3] p-7 hover:bg-[#fffdf8] transition-colors"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0f766e] mb-4">
                    {p.cat}
                  </span>
                  <h3 className="font-serif text-[22px] leading-snug text-[#1c1916] mb-3 group-hover:text-[#0f766e] transition-colors flex-1">
                    {p.title}
                  </h3>
                  <p className="text-[14px] text-[#5c554c] leading-relaxed mb-6">
                    {p.excerpt}
                  </p>
                  <div className="flex items-center justify-between font-mono text-[10px] text-[#938b7f] pt-4 border-t border-dotted border-[#e2dccf]">
                    <span>{p.date}</span>
                    <span className="inline-flex items-center gap-1 group-hover:text-[#0f766e] transition-colors">
                      {p.read} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
