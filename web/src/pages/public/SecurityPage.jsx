const sections = [
  {
    title: 'How your data is protected',
    body: [
      'All traffic encrypted in transit via TLS 1.2+. No plaintext API communication.',
      'Passwords: bcrypt with cost factor 12. Plaintext passwords are never stored or logged.',
      'JWT access tokens expire in 15 minutes. Refresh tokens expire in 7 days and are rotated on use. Revoked on logout.',
      'MongoDB Atlas: encryption at rest (AES-256). Network access restricted to the API server IP.',
      'PDF exports stored on AWS S3 with server-side encryption (SSE-S3). Access via pre-signed URLs with short TTLs.',
      'Rate limiting on authentication endpoints (login, register, token refresh) to limit brute-force exposure.',
    ],
  },
  {
    title: 'Access control',
    body: [
      'Two roles: freelancer (full CRUD on their own data) and accountant (read-only, scoped to one freelancer account).',
      'Every API request is validated against the authenticated user\'s accountId. No cross-account data access is possible regardless of role.',
      'Accountant invites are single-use tokenised links. Accepting the invite invalidates the token.',
    ],
  },
  {
    title: 'Responsible disclosure',
    body: [
      'If you find a security vulnerability in freelanceOS, email desk@freelanceos.app with subject line "Security disclosure".',
      'Please include: a description of the vulnerability, steps to reproduce, and potential impact.',
      'We aim to acknowledge within 48 hours and resolve confirmed issues within 30 days. We will not take legal action against researchers who follow responsible disclosure principles.',
      'We do not run a bug bounty programme at this time.',
    ],
  },
  {
    title: 'What we do not do',
    body: [
      'We do not process, hold, or move funds. There is no payment data or card data stored on our servers.',
      'We do not have access to your banking credentials or platform API keys.',
      'We do not use third-party analytics SDKs or ad trackers that could exfiltrate your data.',
    ],
  },
];

export default function SecurityPage() {
  return (
    <>
      <section className="pt-28 pb-10 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="border-y border-[#1c1916] py-2 mb-12 flex justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">Legal</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">Last updated Jun 2026</span>
          </div>
          <h1 className="font-serif text-[clamp(36px,5.5vw,72px)] leading-[0.95] tracking-[-0.02em] max-w-2xl">
            Security <em className="text-[#0f766e] font-light">Overview</em>
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
