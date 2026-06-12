import { useState } from 'react';
import { Reveal, Kicker, FaqItem } from '../../components/public/primitives';

const TOPICS = ['General', 'Sales / Bureau plan', 'Student rate', 'Press', 'Bug report'];

const FAQS = [
  { q: 'How fast do you reply?', a: 'Within one business day, usually much less. Sales and student-rate requests are handled by a human, not a queue.' },
  { q: 'Can I migrate my spreadsheet?', a: 'Yes. Send us your current sheet from the form and we’ll help you map it onto your ledger during onboarding.' },
  { q: 'Do you offer demos for teams?', a: 'For The Bureau plan we’ll walk your studio through a shared-books setup live. Pick “Sales / Bureau plan” above.' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: 'General', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState({});

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'Tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'A valid email, please.';
    if (form.message.trim().length < 10) errs.message = 'A line or two more.';
    setErr(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setSent(true); }, 1800);
    }
  };

  return (
    <>
      <section className="pt-28 pb-10 px-5 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="border-y border-[#1c1916] py-2 mb-12 flex justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em]">Correspondence</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c]">Contact</span>
          </div>
          <h1 className="font-serif opt-display text-[clamp(40px,6.5vw,82px)] leading-[0.95] tracking-[-0.02em] max-w-3xl">
            Write to the <em className="text-[#0f766e] font-light">desk.</em>
          </h1>
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-20">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-[1fr_0.7fr] gap-12 lg:gap-20 border-t border-[#e2dccf] pt-12">
          {/* form */}
          <div>
            {sent ? (
              <Reveal className="border border-[#0f766e] bg-[#fffdf8] p-10">
                <p className="font-serif text-3xl text-[#0f766e] mb-3">✦ Filed.</p>
                <p className="text-[#5c554c] leading-relaxed">Thank you, {form.name.split(' ')[0]}. We’ll reply to <span className="font-mono text-[#1c1916]">{form.email}</span> within a business day.</p>
              </Reveal>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-7">
                <Field label="Your name" err={err.name}>
                  <input value={form.name} onChange={set('name')} placeholder="Ahsan Raza"
                    className="w-full bg-transparent border-b border-[#d4ccbb] py-2.5 text-lg text-[#1c1916] placeholder-[#bcb3a3] focus:outline-none focus:border-[#0f766e] transition-colors" />
                </Field>
                <Field label="Email" err={err.email}>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@studio.com"
                    className="w-full bg-transparent border-b border-[#d4ccbb] py-2.5 text-lg text-[#1c1916] placeholder-[#bcb3a3] focus:outline-none focus:border-[#0f766e] transition-colors" />
                </Field>
                <Field label="Topic">
                  <div className="flex flex-wrap gap-2 pt-1">
                    {TOPICS.map(t => (
                      <button key={t} type="button" onClick={() => setForm(f => ({ ...f, topic: t }))}
                        className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider border transition-colors ${form.topic === t ? 'bg-[#1c1916] text-[#faf8f3] border-[#1c1916]' : 'border-[#d4ccbb] text-[#5c554c] hover:border-[#1c1916]'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Message" err={err.message}>
                  <textarea value={form.message} onChange={set('message')} rows={4} placeholder="What can we help with?"
                    className="w-full bg-transparent border-b border-[#d4ccbb] py-2.5 text-lg text-[#1c1916] placeholder-[#bcb3a3] focus:outline-none focus:border-[#0f766e] transition-colors resize-none" />
                </Field>
                <button disabled={loading} className="bg-[#1c1916] hover:bg-[#0f766e] text-[#faf8f3] px-8 py-3.5 text-sm font-medium transition-colors disabled:opacity-75 disabled:cursor-not-allowed">
                  {loading ? (
                    <span className="flex items-center gap-2.5">
                      <span className="w-4 h-4 border-2 border-[#faf8f3]/40 border-t-[#faf8f3] rounded-full animate-spin inline-block" />
                      Sending…
                    </span>
                  ) : 'Send to the desk'}
                </button>
              </form>
            )}
          </div>

          {/* details */}
          <div className="space-y-10">
            <div>
              <Kicker className="mb-4">Hours</Kicker>
              <div className="font-mono text-sm text-[#5c554c] space-y-1.5">
                <div className="flex justify-between"><span>Mon – Fri</span><span className="text-[#1c1916]">09:00 – 18:00 PKT</span></div>
                <div className="flex justify-between"><span>Saturday</span><span className="text-[#1c1916]">11:00 – 15:00 PKT</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="text-[#938b7f]">Closed</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* before you write */}
      <section className="px-5 sm:px-8 py-20 bg-[#f3efe6] border-t border-[#e2dccf]">
        <div className="max-w-3xl mx-auto">
          <Reveal><Kicker className="mb-8">Before you write</Kicker></Reveal>
          <div className="border-t border-[#1c1916]">
            {FAQS.map((f, i) => <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />)}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, err, children }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#938b7f]">{label}</label>
      <div className="mt-1">{children}</div>
      {err && <p className="font-mono text-[11px] text-[#b91c1c] mt-1.5">{err}</p>}
    </div>
  );
}
