import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUp, ArrowRight } from 'lucide-react';

const NAV = [
  { to: '/about',    label: 'About' },
  { to: '/features', label: 'Features' },
  { to: '/pricing',  label: 'Pricing' },
  { to: '/blog',     label: 'Journal' },
  { to: '/contact',  label: 'Contact' },
];

// ── Wordmark ────────────────────────────────────────────────────
function Wordmark({ onClick }) {
  return (
    <Link to="/" onClick={onClick} className="group flex items-baseline gap-1.5 select-none">
      <span className="font-serif text-[22px] font-semibold tracking-tight text-[#1c1916] leading-none">freelance</span>
      <span className="font-serif text-[22px] font-semibold tracking-tight text-[#0f766e] leading-none italic">OS</span>
    </Link>
  );
}

// ── Header: editorial masthead, hides on scroll-down ────────────
function Header() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid]   = useState(false);
  const [menu, setMenu]     = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 8);
      setHidden(y > 120 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menu]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'} ${solid ? 'bg-[#faf8f3]/90 backdrop-blur-md border-b border-[#e2dccf]' : 'border-b border-transparent'}`}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
          <Wordmark />

          <nav className="hidden md:flex items-center gap-7">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to}
                className={({ isActive }) =>
                  `link-ink text-[13px] tracking-wide transition-colors ${isActive ? 'text-[#0f766e]' : 'text-[#5c554c] hover:text-[#1c1916]'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-5">
            <Link to="/login" className="text-[13px] text-[#5c554c] hover:text-[#1c1916] link-ink transition-colors">Sign in</Link>
            <Link to="/register"
              className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-[#faf8f3] bg-[#1c1916] hover:bg-[#0f766e] px-4 py-2 transition-colors">
              Start free
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* mobile toggle */}
          <button onClick={() => setMenu(m => !m)} className="md:hidden flex flex-col gap-1.5 p-2 -mr-2" aria-label="Menu">
            <span className={`block w-6 h-px bg-[#1c1916] transition-transform ${menu ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-6 h-px bg-[#1c1916] transition-opacity ${menu ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-[#1c1916] transition-transform ${menu ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {/* mobile full-screen overlay */}
      <div className={`fixed inset-0 z-30 bg-[#faf8f3] transition-opacity duration-300 md:hidden ${menu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="h-full flex flex-col justify-center px-8 gap-1">
          {NAV.map((n, i) => (
            <NavLink key={n.to} to={n.to} onClick={() => setMenu(false)}
              className="font-serif text-4xl text-[#1c1916] py-2 border-b border-[#e2dccf]"
              style={{ transitionDelay: `${i * 40}ms` }}>
              <span className="font-mono text-xs text-[#0f766e] align-top mr-3">0{i + 1}</span>{n.label}
            </NavLink>
          ))}
          <div className="flex gap-3 mt-8">
            <Link to="/login" onClick={() => setMenu(false)} className="flex-1 text-center border border-[#d4ccbb] py-3 text-sm text-[#1c1916]">Sign in</Link>
            <Link to="/register" onClick={() => setMenu(false)} className="flex-1 text-center bg-[#1c1916] text-[#faf8f3] py-3 text-sm">Start free</Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Footer: full sitemap + newsletter ───────────────────────────
function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const submit = (e) => {
    e.preventDefault();
    if (ok) { setSent(true); setEmail(''); }
  };

  return (
    <footer className="relative z-10 border-t border-[#e2dccf] bg-[#f3efe6]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 py-16">
        {/* top: big statement + newsletter */}
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-12 pb-14 border-b border-[#e2dccf]">
          <div>
            <Wordmark />
            <p className="font-serif text-3xl md:text-4xl text-[#1c1916] leading-[1.1] mt-6 max-w-md">
              The freelancer's ledger, <em className="text-[#0f766e]">in plain ink.</em>
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#5c554c] mb-4">The dispatch — monthly</p>
            <p className="text-sm text-[#5c554c] mb-4 leading-relaxed">Freelance tax deadlines, forex notes, and product updates. No spam, ever.</p>
            {sent ? (
              <p className="font-mono text-sm text-[#0f766e]">✦ Subscribed. Watch your inbox.</p>
            ) : (
              <form onSubmit={submit} className="flex border border-[#d4ccbb]">
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className="flex-1 px-3 py-2.5 bg-transparent text-sm text-[#1c1916] placeholder-[#938b7f] focus:outline-none"
                />
                <button className="px-4 bg-[#1c1916] text-[#faf8f3] text-sm disabled:opacity-40" disabled={!ok}>Join</button>
              </form>
            )}
          </div>
        </div>

        {/* sitemap */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {[
            { h: 'Product', links: [['Features', '/features'], ['Pricing', '/pricing'], ['Sign in', '/login'], ['Start free', '/register']] },
            { h: 'Company', links: [['About', '/about'], ['Journal', '/blog'], ['Contact', '/contact']] },
            { h: 'Built for', links: [['Pakistan · FBR', '/features'], ['India · IT', '/features'], ['Bangladesh · NBR', '/features']] },
            { h: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms'], ['Security', '/security']] },
          ].map(col => (
            <div key={col.h}>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#938b7f] mb-4">{col.h}</p>
              <ul className="space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}><Link to={to} className="text-sm text-[#5c554c] hover:text-[#0f766e] link-ink transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* baseline */}
        <div className="pt-8 border-t border-[#e2dccf]">
          <p className="font-mono text-[11px] text-[#938b7f]">© {new Date().getFullYear()} freelanceOS</p>
        </div>
      </div>
    </footer>
  );
}

// ── Go-to-top ───────────────────────────────────────────────────
function GoToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 700);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-40 w-11 h-11 flex items-center justify-center bg-[#1c1916] text-[#faf8f3] hover:bg-[#0f766e] transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      aria-label="Back to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}

// ── Layout ──────────────────────────────────────────────────────
export default function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="paper-grain min-h-screen bg-[#faf8f3] text-[#1c1916] antialiased selection:bg-[#0f766e] selection:text-[#faf8f3]">
      <Header />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Footer />
      <GoToTop />
    </div>
  );
}
