const sections = [
  {
    title: 'What we collect',
    body: [
      'Account data you provide: name, email address, password (bcrypt-hashed — we never store plaintext).',
      'Financial data you enter: clients, invoices, payments, expenses, platform configurations, tax settings. This data is yours; we process it only to provide the service.',
      'Technical data: IP address, browser type, timestamps of API requests. Used for security monitoring and abuse prevention.',
      'We do not collect payment card data. freelanceOS tracks money — it does not move money.',
    ],
  },
  {
    title: 'How we use it',
    body: [
      'To operate and improve the service: compute tax estimates, generate reports, power the cash-flow timeline.',
      'To send transactional emails: accountant invite links, password reset. No marketing unless you opt in.',
      'We do not sell, rent, or share your data with third parties for advertising.',
    ],
  },
  {
    title: 'Data storage and retention',
    body: [
      'Data is stored on MongoDB Atlas (AWS ap-south-1 region) with encryption at rest. PDF exports are stored on AWS S3 with server-side encryption.',
      'We retain your data for as long as your account is active. On account deletion, all personal and financial data is permanently removed within 30 days.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'Export: download a full export of your data at any time from Settings → Account.',
      'Correction: update any personal information directly from your account settings.',
      'Deletion: submit a deletion request from Settings or email desk@freelanceos.app. Processed within 30 days.',
      'For users in jurisdictions with applicable data protection laws (including Pakistan\'s PDPA, India\'s DPDP Act), you may also request access to a summary of processed data.',
    ],
  },
  {
    title: 'Cookies',
    body: [
      'We use only functional, first-party storage (localStorage for your session token). No advertising cookies, no third-party trackers.',
    ],
  },
  {
    title: 'Contact',
    body: ['Privacy questions: desk@freelanceos.app — we respond within two business days.'],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="pt-28 pb-10 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="border-y border-[#1c1916] py-2 mb-12 flex justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">Legal</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">Last updated Jun 2026</span>
          </div>
          <h1 className="font-serif text-[clamp(36px,5.5vw,72px)] leading-[0.95] tracking-[-0.02em] max-w-2xl">
            Privacy <em className="text-[#0f766e] font-light">Policy</em>
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
