# freelanceOS — Frontend Design

> Stack (from TRD): React 18 + Vite, Tailwind CSS, React Router v6, TanStack Query, Zustand, React Hook Form + Zod, Recharts, socket.io-client, Axios.

## Design Philosophy

**Calm financial confidence.** This is a money tool for an anxious user — a freelancer who never knows what they really earned or what they owe in tax. The UI must read as *trustworthy, precise, and quietly reassuring*: dense data presented without clutter, generous whitespace around the numbers that matter, and color used sparingly and meaningfully (green = real money in hand, amber = attention, red = danger only). It is a dashboard-first product, not a marketing site. Aesthetic: clinical precision with warm approachability — fintech that doesn't feel cold or intimidating to a solo freelancer. Gross-vs-net is the emotional core of the product, so every screen makes the *net* (real) number the visual hero and the gross a muted secondary.

## Color System

### Primary Palette
- **Primary:** `#0F766E` (teal-700) — primary CTAs, active nav, key links. Trust + money without cliché corporate blue.
- **Secondary:** `#0E7490` (cyan-700) — secondary actions, info accents, chart series 2.
- **Accent:** `#D97706` (amber-600) — highlights, "set aside for tax" callouts, badges needing attention.

### Neutral Palette
- **Background:** `#F8FAFC` (slate-50) — app canvas.
- **Surface:** `#FFFFFF` — cards, modals, tables.
- **Surface-alt:** `#F1F5F9` (slate-100) — zebra rows, inset panels.
- **Border:** `#E2E8F0` (slate-200) — 1px dividers, input borders.
- **Text Primary:** `#0F172A` (slate-900) — numbers, headings.
- **Text Secondary:** `#64748B` (slate-500) — labels, captions, gross/muted figures.

### Semantic Colors
- **Success:** `#16A34A` (green-600) — net received, paid invoices, healthy balance.
- **Warning:** `#D97706` (amber-600) — overdue 30d, approaching danger zone, manual-rate flag.
- **Error:** `#DC2626` (red-600) — overdue 90+, danger-zone balance, destructive actions.
- **Info:** `#0E7490` (cyan-700) — neutral system notices, dummy-data banner.

### Gradients
- **Hero balance card:** `linear-gradient(135deg, #0F766E 0%, #0E7490 100%)` — top dashboard net-balance card only. Used once per screen, never decoratively.

## Typography

### Fonts
- **Display / Headings:** `Satoshi` (or `Sora` fallback) — geometric, confident, modern; gives the product character without feeling playful. Self-hosted.
- **Body:** `Inter` — justified exception: at dense financial data + small sizes, Inter's high legibility and tabular figures are the right tool, not a generic default.
- **Mono / Numbers:** `JetBrains Mono` — all money figures and IDs use tabular mono so columns of numbers align perfectly. **Critical for a finance app** — amounts must right-align with fixed-width digits.

> Rule: every monetary amount renders in mono with thousands separators and the currency code/symbol; gross in `text-secondary`, net in `text-primary`/`success`.

### Scale
| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-xs` | 12px | 400 | captions, table meta, currency codes |
| `text-sm` | 14px | 400 | body small, helper text, secondary figures |
| `text-base` | 16px | 400 | body default |
| `text-lg` | 18px | 500 | emphasized body, card labels |
| `text-xl` | 20px | 600 | section headings |
| `text-2xl` | 24px | 700 | page headings |
| `text-3xl` | 30px | 700 | hero net figure (mono) |
| `text-4xl` | 36px | 700 | dashboard balance display |

## Spacing & Layout
- **Base unit:** 4px.
- **Content max-width:** 1440px (data-dense dashboard benefits from width).
- **Layout pattern:** persistent left **sidebar nav** (icon + label) + top bar (account/currency selector, accountant-account switcher, notifications) + main content grid. Cards on a 12-col responsive grid; tables full-bleed within content.
- **Border radius:** 8px moderate for cards/inputs/buttons; pill (`9999px`) for status badges and aging chips; 12px for modals.
- **Density:** compact tables (40px rows) — freelancers scan many invoices/payments.

## Motion & Interaction
- **Principle:** functional feedback only — no decorative animation. Motion confirms state changes (a payment landed, tax updated live) and guides attention to danger.
- **Duration:** 150ms micro (hover, button press), 250ms transitions (modal/drawer, tab switch), 400ms for real-time value updates (number count-up + brief highlight pulse on `tax:updated` / `payment:created`).
- **Easing:** `ease-out` entrances, `ease-in` exits, `cubic-bezier(0.2,0,0,1)` for value pulses.
- **Key interactions:** real-time toast + soft pulse when socket events arrive; danger-zone rows glow red on the cash-flow timeline; manual-forex fallback slides in inline (not a blocking modal); skeleton loaders for tables/charts.

## Component Tone
- **Buttons:** solid teal primary (white text), 8px radius, subtle press-scale (0.98); secondary = outline; destructive = red outline → solid on confirm.
- **Cards:** white, 1px slate-200 border, no shadow at rest, `shadow-sm` on hover for interactive cards. The hero net-balance card uses the teal gradient.
- **Forms:** boxed inputs, 1px border, teal focus ring; money inputs are mono, right-aligned, with a currency-code prefix selector; inline Zod validation messages in error red below field.
- **Navigation:** persistent sidebar; active item = teal filled pill bg + white icon/label; sections: Dashboard, Clients, Invoices, Payments, Expenses, Tax, Cash Flow, Reports, Settings.
- **Data tables:** zebra rows (surface-alt), sticky header, compact density, mono right-aligned money columns, status as pill badges, aging chips colored by bucket (current=slate, d30=amber, d60=orange, d90plus=red). Sortable headers; server pagination footer.
- **Badges / status:** pill chips — `paid`=green, `sent`=cyan, `partially_paid`=teal, `overdue`=red, `draft`=slate, `void`=slate-300.
- **Charts (Recharts):** muted gridlines, teal/cyan/amber series; gross vs net as paired bars; cash-flow timeline as area + danger threshold reference line; tooltips show mono base-currency figures.
- **Accountant mode:** read-only views render with all write controls hidden (not just disabled) and a persistent "Read-only — Accountant view of {freelancerName}" top banner.

## Dark / Light Mode
**Light only in v1.** Financial dashboards are used in daytime/office contexts; a single polished light theme ships faster and avoids doubling chart/contrast QA. Dark mode is a post-v1 nice-to-have. (Tailwind configured with CSS variables so a dark theme can be added without refactor.)

---

## Data-Service Layer (CRITICAL — build target)

The frontend is built and demoable **independently of the backend** via a service layer with a dummy-data toggle. Frontend and backend are developed in parallel; the service layer is the seam.

### Toggle
- **Env var:** `VITE_USE_DUMMY_DATA` — **default `"true"`**.
- When `"true"`: services return realistic mock data from local fixtures (no network).
- When `"false"`: services call the real REST API (`VITE_API_BASE_URL`) via the Axios instance.
- **Both paths return identical shapes** — exactly the TRD response `data`/`meta` shapes. Components never know which path served them.

### Structure
```
client/src/services/
├── http.js          # axios instance: baseURL=VITE_API_BASE_URL, JWT bearer + refresh interceptor
├── socket.js        # socket.io-client; NO-OP / scripted-emit stub when dummy mode
├── index.js         # picks real vs dummy per VITE_USE_DUMMY_DATA, exports unified API
├── real/            # one module per resource — calls http.js, returns res.data
│   ├── auth.js  clients.js  invoices.js  payments.js  expenses.js
│   ├── tax.js   cashflow.js reports.js   dashboard.js platforms.js
│   ├── overdue.js  reminders.js  forex.js  account.js  accountants.js
└── dummy/
    ├── (same filenames, same exported fn signatures)
    └── fixtures/    # mock datasets sized for realistic dashboards
```

### Contract rules
1. **One module per TRD resource**, mirrored in `real/` and `dummy/` with identical function names and signatures.
2. Every function resolves to the **exact `data` (and `meta`) shape** from the TRD — same field names, types, money-as-minor-units, ISO dates, ObjectId hex strings.
3. `index.js` exports the chosen implementation:
   ```js
   const useDummy = import.meta.env.VITE_USE_DUMMY_DATA !== 'false';
   export const clients = useDummy ? dummyClients : realClients;
   ```
4. **React Query hooks** (`hooks/`) and components import only from `services/index.js` — never from `real/` or `dummy/` directly, and never call Axios directly.
5. **Errors:** dummy modules can simulate TRD error envelopes (e.g. throw a `424 FOREX_UNAVAILABLE`-shaped error) so the manual-forex fallback UI is buildable without a backend.
6. **Real-time:** in dummy mode `socket.js` may emit scripted events (e.g. a fake `payment:created` after a mock POST) so live-update UI is testable offline; in real mode it connects with the JWT handshake and joins `account:<accountId>`.
7. **Mutations:** dummy mutations update in-memory fixtures so create/edit/delete feels real within a session; identical return shapes to real.

### Fixture realism
Mock data must look like a real Pakistani freelancer's books: base currency PKR; clients billing in USD/GBP/EUR; Upwork sliding + Fiverr 20% fees; partially-paid and overdue invoices across aging buckets; mixed deductible/business expenses; a populated tax-liability estimate; a cash-flow timeline that includes at least one danger window — so every screen and chart renders with meaningful, non-empty data on first load.

### Banner
When `VITE_USE_DUMMY_DATA` is true, render a dismissible info-colored top banner: "Demo data — not connected to live API." So no one mistakes mock figures for real finances.
