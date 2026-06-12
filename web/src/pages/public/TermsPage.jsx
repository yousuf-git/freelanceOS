const sections = [
  {
    title: 'The service',
    body: [
      'freelanceOS is a financial record-keeping tool for freelancers. It helps you track invoices, payments, expenses, and tax estimates.',
      'freelanceOS does not process payments, hold funds, file tax returns, or provide legally binding financial advice. All tax figures are estimates based on the slab configuration you set.',
    ],
  },
  {
    title: 'Your account',
    body: [
      'You are responsible for keeping your credentials secure. Enable a strong password and do not share your account with others — use the accountant invite feature instead.',
      'You may invite one or more accountants as read-only collaborators. You remain responsible for all activity under your account.',
      'Each account represents one freelancer\'s books. Creating accounts to impersonate others or to aggregate data for third-party resale is prohibited.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'Use the service for your own legitimate freelance financial management.',
      'Do not attempt to access other users\' data, probe the API beyond normal use, or automate requests in a way that degrades service for others.',
      'All financial data you enter remains yours. We do not use your income figures or client data for any purpose other than operating your account.',
    ],
  },
  {
    title: 'Data and exports',
    body: [
      'You can export your data at any time. PDF reports and CSV exports are generated on demand.',
      'We retain backups for 30 days. After account deletion, your data is irrecoverably removed.',
    ],
  },
  {
    title: 'Uptime and liability',
    body: [
      'We aim for high availability but do not guarantee uninterrupted service. We are not liable for losses arising from service downtime, data inaccuracies, or tax under/over-estimates.',
      'The limitation of liability is the amount you paid us in the 30 days preceding the claim, or USD 50, whichever is higher.',
    ],
  },
  {
    title: 'Changes',
    body: [
      'We will notify you by email at least 14 days before any material change to these terms. Continued use after the effective date constitutes acceptance.',
    ],
  },
  {
    title: 'Governing law',
    body: [
      'These terms are governed by the laws of Pakistan. Disputes are subject to the exclusive jurisdiction of courts in Lahore.',
    ],
  },
  {
    title: 'Contact',
    body: ['Terms questions: desk@freelanceos.app'],
  },
];

export default function TermsPage() {
  return (
    <>
      <section className="pt-28 pb-10 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="border-y border-[#1c1916] py-2 mb-12 flex justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">Legal</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">Last updated Jun 2026</span>
          </div>
          <h1 className="font-serif text-[clamp(36px,5.5vw,72px)] leading-[0.95] tracking-[-0.02em] max-w-2xl">
            Terms of <em className="text-[#0f766e] font-light">Service</em>
          </h1>
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-24 border-t border-[#e2dccf]">
        <div className="max-w-[720px] mx-auto pt-12 space-y-10">
          {sections.map(s => (
            <div key={s.title}>
              <h2 className="font-serif text-[22px] text-[#1c1916] mb-4 tracking-tight">{s.title}</h2>
              <ul className="space-y-3">
                {s.body.map((b, i) => (
                  <li key={i} className="flex gap-2 text-[15px] text-[#5c554c] leading-relaxed">
                    <span className="text-[#0f766e] mt-1.5 flex-shrink-0">—</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
