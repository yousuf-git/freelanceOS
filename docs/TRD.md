# freelanceOS — Technical Requirements

> This document is the **single source of truth** for the API contract. Frontend and backend are built in parallel from this file alone. Every endpoint, request shape, and response shape is exhaustive and precise. Where this doc and intuition disagree, this doc wins.

## Tech Stack

### Frontend
- **Framework:** React 18 + Vite — fast HMR, lean SPA build; dashboard is highly interactive.
- **Styling:** Tailwind CSS — utility-first, fast to build dense financial UI consistently.
- **Routing:** React Router v6 — client-side routing for the SPA dashboard.
- **State (server cache):** TanStack Query (React Query) — caching, refetch, mutation invalidation against the REST API.
- **State (client/UI):** Zustand — lightweight global UI state (auth user, active account, toasts).
- **Forms:** React Hook Form + Zod — typed validation; Zod schemas shared in shape with backend validation.
- **Charts:** Recharts — income trends, cash-flow timeline, breakdowns.
- **Real-time:** socket.io-client — live payment/invoice/tax/alert updates.
- **HTTP:** Axios — single configured instance with JWT interceptor + refresh.
- **Data layer:** Custom service layer with `VITE_USE_DUMMY_DATA` toggle (see FED.md). Dummy and real paths return identical shapes.

### Backend
- **Runtime:** Node.js 22 LTS — modern, stable, AWS-supported.
- **Framework:** Express.js — minimal, well-understood REST framework; fits the MERN brief.
- **Language:** JavaScript (ES modules). (Validation via Zod; no TS required by brief.)
- **Validation:** Zod — request body/query validation middleware; one schema per endpoint.
- **Auth:** Custom JWT — `jsonwebtoken` for access (15m) + refresh (7d) tokens; `bcrypt` for password hashing.
- **Real-time:** socket.io — server pushes scoped to per-account rooms.
- **PDF:** pdfkit (or puppeteer) — invoice & report PDF generation, uploaded to S3.
- **Scheduling:** node-cron — daily job to recompute overdue aging, reliability scores, danger-zone alerts.

### Database
- **Primary:** MongoDB (Atlas) — document model fits embedded line items, fee rules, and slab sets; flexible per-account config.
- **ODM:** Mongoose — schemas, validation, refs, middleware (app-level access control, hooks for recompute).
- **Cache:** none in v1 — recompute is cheap at single-user scale; forex rates cached in a small collection (see DBD).

### Infrastructure
- **Hosting:** AWS EC2 (API, Dockerized) + S3 (PDFs/exports) + MongoDB Atlas (DB) + CloudFront (frontend static).
- **Containerization:** Docker + docker-compose — reproducible API + local Mongo for dev.
- **CI/CD:** GitHub Actions — lint/test on PR; build image + deploy to EC2 on merge to `main`.
- **Repo:** single monorepo, two packages: `/client`, `/server`.

### External Services
- **Forex:** frankfurter.app (primary, keyless) → exchangerate-api.com (fallback) → manual entry. Rates cached per (base,quote,date).
- **File storage:** AWS S3 — generated PDFs (presigned download URLs).
- **Email (invites only, optional v1):** AWS SES — accountant invite links. If unconfigured, invite token is surfaced in-app.

## Architecture

A classic MERN SPA + REST API. The React SPA (served via CloudFront/S3) talks to the Express REST API over HTTPS with a JWT bearer token. The API layer validates (Zod) → authorizes (JWT + role/ownership middleware) → executes service logic → reads/writes MongoDB via Mongoose. A socket.io server runs alongside Express, sharing the JWT auth handshake; clients join a room keyed by their `accountId` and receive live events on financial changes. A node-cron worker (in-process) runs daily recomputes (aging, reliability, alerts). Forex lookups go through a `forexService` that tries cache → frankfurter → exchangerate-api → returns `needsManualRate: true`. PDF generation writes to S3 and returns a presigned URL.

**Components:**
- `client/` — React SPA (dashboard for freelancer + accountant read-only views).
- `server/` — Express REST API + socket.io + cron worker.
- MongoDB Atlas — primary store.
- S3 — PDF/export storage.
- Forex providers — external rate APIs.

## Project Structure

```
freelanceos/
├── client/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── routes/                 # route definitions, guards
│   │   ├── pages/                  # dashboard, clients, invoices, expenses, tax, cashflow, reports, settings, auth
│   │   ├── components/             # shared UI (tables, cards, charts, forms)
│   │   ├── services/               # DATA-SERVICE LAYER (see FED.md)
│   │   │   ├── http.js             # axios instance + JWT/refresh interceptor
│   │   │   ├── socket.js           # socket.io-client setup
│   │   │   ├── index.js            # exports real-or-dummy per VITE_USE_DUMMY_DATA
│   │   │   ├── real/               # real API impls (one file per resource)
│   │   │   └── dummy/              # mock impls + fixtures (identical shapes)
│   │   ├── store/                  # zustand stores (auth, ui)
│   │   ├── hooks/                  # react-query hooks wrapping services
│   │   ├── lib/                    # money, currency, date, validators (zod)
│   │   └── styles/
│   ├── .env                        # VITE_USE_DUMMY_DATA, VITE_API_BASE_URL, VITE_SOCKET_URL
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── index.js                # express + socket.io bootstrap
│   │   ├── config/                 # env, db, s3, cors
│   │   ├── middleware/             # auth, role, ownership, validate(zod), error
│   │   ├── models/                 # mongoose models (see DBD)
│   │   ├── routes/                 # express routers per resource
│   │   ├── controllers/            # request handlers
│   │   ├── services/               # business logic (tax, fee, forex, cashflow, reliability, pdf)
│   │   ├── validators/             # zod schemas per endpoint
│   │   ├── sockets/                # room mgmt + emit helpers
│   │   ├── jobs/                   # node-cron tasks
│   │   └── seed/                   # tax slab presets, platform presets
│   ├── Dockerfile
│   └── .env
├── docker-compose.yml
├── .github/workflows/ci-cd.yml
└── docs/
```

## API Strategy

- **Style:** REST/JSON over HTTPS.
- **Base path:** `/api/v1`. All endpoints below are relative to this base.
- **Auth:** `Authorization: Bearer <accessToken>`. Access token TTL 15m, refresh 7d. Refresh via `POST /auth/refresh`.
- **Roles:** `freelancer` (full), `accountant` (read-only, scoped). Write endpoints reject `accountant` with `403`.
- **Ownership:** every resource is scoped to `accountId` derived from the JWT (freelancer) or the invite link (accountant). Cross-account access → `404` (not `403`, to avoid leaking existence).
- **Versioning:** URI version (`/api/v1`).
- **Money:** all amounts are integer **minor units** + a `currency` (ISO-4217) sibling field. Never floats. `amountMinor: 150000, currency: "USD"` == $1,500.00.
- **Dates:** ISO-8601 UTC strings (`"2026-06-11T00:00:00.000Z"`).
- **IDs:** MongoDB ObjectId as 24-char hex string.
- **Pagination:** `?page=1&limit=20` → response includes `meta: { page, limit, total, totalPages }`.
- **Sorting/filtering:** documented per endpoint via query params.

### Standard Envelopes

**Success (single):**
```json
{ "data": { /* resource */ } }
```
**Success (list):**
```json
{ "data": [ /* resources */ ], "meta": { "page": 1, "limit": 20, "total": 57, "totalPages": 3 } }
```
**Error (all non-2xx):**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "human readable", "details": [ { "field": "amountMinor", "message": "Required" } ] } }
```
**Error codes:** `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `FOREX_UNAVAILABLE` (424), `RATE_LIMIT` (429), `INTERNAL` (500).

### Reusable Shapes

```jsonc
// Money — embedded everywhere money appears
Money = { "amountMinor": 150000, "currency": "USD" }

// MoneyConverted — money plus its base-currency equivalent
MoneyConverted = {
  "amountMinor": 150000, "currency": "USD",
  "baseAmountMinor": 41700000, "baseCurrency": "PKR",
  "forexRate": 278.00, "forexRateSource": "frankfurter" // frankfurter|exchangerate-api|manual
}

// User
User = {
  "id": "665f...", "email": "a@b.com", "name": "Asad K",
  "role": "freelancer", // freelancer|accountant
  "createdAt": "2026-06-01T00:00:00.000Z"
}

// Account settings (one per freelancer)
AccountSettings = {
  "id": "665f...", "baseCurrency": "PKR",
  "taxRegime": "PK_FBR", // PK_FBR|IN_IT|BD_NBR|CUSTOM
  "dangerZoneThresholdMinor": 5000000, "dangerZoneCurrency": "PKR",
  "fiscalYearStartMonth": 7 // 1-12
}
```

---

## API CONTRACT

> Every endpoint: method · path (relative to `/api/v1`) · auth · role · request · response. `🔒` = requires Bearer token. `F` = freelancer only. `F+A` = freelancer or accountant (read). Unless noted, list endpoints accept `?page&limit`.

### Auth — F-26

#### `POST /auth/register` — public
Req:
```json
{ "name": "Asad K", "email": "a@b.com", "password": "min8chars", "baseCurrency": "PKR" }
```
Res `201`:
```json
{ "data": {
  "user": { "id": "665f...", "email": "a@b.com", "name": "Asad K", "role": "freelancer", "createdAt": "2026-06-01T00:00:00.000Z" },
  "accessToken": "jwt...", "refreshToken": "jwt..."
} }
```
Errors: `409 CONFLICT` (email taken), `400 VALIDATION_ERROR`.

#### `POST /auth/login` — public
Req: `{ "email": "a@b.com", "password": "..." }`
Res `200`: same shape as register `data`.
Errors: `401 UNAUTHENTICATED` (bad creds).

#### `POST /auth/refresh` — public (refresh token in body)
Req: `{ "refreshToken": "jwt..." }`
Res `200`: `{ "data": { "accessToken": "jwt...", "refreshToken": "jwt..." } }`
Errors: `401 UNAUTHENTICATED` (expired/invalid).

#### `POST /auth/logout` — 🔒
Req: `{ "refreshToken": "jwt..." }` (invalidated server-side)
Res `204` (no body).

#### `GET /auth/me` — 🔒 F+A
Res `200`: `{ "data": { "user": User } }`

---

### Account Settings — F-28, F-07/A-07

#### `GET /account/settings` — 🔒 F+A
Res `200`: `{ "data": AccountSettings }`

#### `PATCH /account/settings` — 🔒 F
Req (any subset):
```json
{ "baseCurrency": "PKR", "taxRegime": "PK_FBR", "dangerZoneThresholdMinor": 5000000, "dangerZoneCurrency": "PKR", "fiscalYearStartMonth": 7 }
```
Res `200`: `{ "data": AccountSettings }`

---

### Platforms (fee engine) — F-08, F-09

```jsonc
Platform = {
  "id": "665f...", "name": "Upwork", "isSystemDefault": true,
  "feeModel": "sliding", // flat|sliding|fixed|none
  // flat: { percent } ; sliding: { tiers:[{ uptoLifetimeMinor, percent }] } ; fixed: { amountMinor, currency }
  "feeConfig": { "tiers": [ { "uptoLifetimeMinor": 50000000, "percent": 10 }, { "uptoLifetimeMinor": null, "percent": 5 } ] },
  "createdAt": "2026-06-01T00:00:00.000Z"
}
```
Seeded presets per account on register: Upwork (sliding 10%→5%), Fiverr (flat 20%), Direct (none).

#### `GET /platforms` — 🔒 F+A → `{ "data": [Platform], "meta": {...} }`
#### `POST /platforms` — 🔒 F
Req:
```json
{ "name": "Toptal", "feeModel": "flat", "feeConfig": { "percent": 0 } }
```
Res `201`: `{ "data": Platform }`
#### `GET /platforms/:id` — 🔒 F+A → `{ "data": Platform }`
#### `PATCH /platforms/:id` — 🔒 F (same fields as POST, partial) → `{ "data": Platform }`
#### `DELETE /platforms/:id` — 🔒 F → `204`. Errors: `409 CONFLICT` if referenced by clients/payments and `?force` not set.

---

### Clients — F-01, F-02, F-03

```jsonc
Client = {
  "id": "665f...", "name": "Acme Co", "email": "ops@acme.com", "company": "Acme Co",
  "billingCurrency": "USD", "defaultPlatformId": "665f...",
  "contractTerms": "Net-30, monthly retainer", "rateAgreement": { "amountMinor": 5000000, "currency": "USD", "unit": "month" }, // unit: hour|month|project
  "reliabilityScore": 82, // 0-100, computed
  "stats": { "totalInvoicedBaseMinor": 0, "totalReceivedBaseMinor": 0, "overdueCount": 0 },
  "createdAt": "2026-06-01T00:00:00.000Z"
}
ClientNote = { "id": "665f...", "clientId": "665f...", "body": "Call re: invoice #3", "createdAt": "..." }
```

#### `GET /clients` — 🔒 F+A
Query: `?page&limit&search=<name/email>&sort=name|reliability|-createdAt`
Res `200`: `{ "data": [Client], "meta": {...} }`
#### `POST /clients` — 🔒 F
Req:
```json
{ "name": "Acme Co", "email": "ops@acme.com", "company": "Acme Co", "billingCurrency": "USD",
  "defaultPlatformId": "665f...", "contractTerms": "Net-30",
  "rateAgreement": { "amountMinor": 5000000, "currency": "USD", "unit": "month" } }
```
Res `201`: `{ "data": Client }`
#### `GET /clients/:id` — 🔒 F+A → `{ "data": Client }`
#### `PATCH /clients/:id` — 🔒 F (partial) → `{ "data": Client }`
#### `DELETE /clients/:id` — 🔒 F → `204`. `409 CONFLICT` if invoices exist and `?force` not set.
#### `GET /clients/:id/notes` — 🔒 F+A → `{ "data": [ClientNote], "meta": {...} }`
#### `POST /clients/:id/notes` — 🔒 F → Req `{ "body": "..." }` → Res `201` `{ "data": ClientNote }`
#### `DELETE /clients/:id/notes/:noteId` — 🔒 F → `204`

---

### Invoices — F-04, F-05, F-06, F-07

```jsonc
InvoiceLineItem = { "description": "Landing page", "quantity": 1, "unitPriceMinor": 5000000, "amountMinor": 5000000 }
Invoice = {
  "id": "665f...", "number": "INV-2026-0007", "clientId": "665f...",
  "platformId": "665f...", "currency": "USD",
  "issueDate": "2026-06-01T00:00:00.000Z", "dueDate": "2026-07-01T00:00:00.000Z",
  "status": "sent", // draft|sent|partially_paid|paid|overdue|void
  "lineItems": [ InvoiceLineItem ],
  "subtotalMinor": 5000000, "taxOnInvoiceMinor": 0, "totalMinor": 5000000,
  "amountPaidMinor": 0, "amountDueMinor": 5000000,
  "notes": "Thanks!", "pdfUrl": null,
  "overdueDays": 0, "agingBucket": "current", // current|d30|d60|d90plus
  "createdAt": "...", "updatedAt": "..."
}
```
> `number` is auto-generated server-side (`INV-{fiscalYear}-{seq}`). Payment records (which carry forex + fee) live under the Payments resource and update `amountPaidMinor`/`status`.

#### `GET /invoices` — 🔒 F+A
Query: `?page&limit&status=&clientId=&platformId=&overdue=true&from=&to=&sort=-issueDate|dueDate`
Res `200`: `{ "data": [Invoice], "meta": {...} }`
#### `POST /invoices` — 🔒 F
Req:
```json
{ "clientId": "665f...", "platformId": "665f...", "currency": "USD",
  "issueDate": "2026-06-01T00:00:00.000Z", "dueDate": "2026-07-01T00:00:00.000Z",
  "lineItems": [ { "description": "Landing page", "quantity": 1, "unitPriceMinor": 5000000 } ],
  "taxOnInvoiceMinor": 0, "notes": "Thanks!", "status": "draft" }
```
Res `201`: `{ "data": Invoice }` (server computes `amountMinor` per line, subtotal, total, amountDue).
#### `GET /invoices/:id` — 🔒 F+A → `{ "data": Invoice }`
#### `PATCH /invoices/:id` — 🔒 F (partial; only `draft`/`sent` editable for line items) → `{ "data": Invoice }`
#### `POST /invoices/:id/send` — 🔒 F → transitions draft→sent → `{ "data": Invoice }`
#### `POST /invoices/:id/void` — 🔒 F → status→void → `{ "data": Invoice }`. `409` if `paid`.
#### `DELETE /invoices/:id` — 🔒 F → `204` (only `draft`). `409` otherwise.
#### `POST /invoices/:id/pdf` — 🔒 F → generates & uploads PDF → `{ "data": { "pdfUrl": "https://s3...presigned" } }`

---

### Payments — F-06, F-09, F-10

> Recording a payment is the core money event: it captures forex + platform fee, computes net received in base currency, updates the invoice, recomputes tax liability, and emits real-time events.

```jsonc
Payment = {
  "id": "665f...", "invoiceId": "665f...", "clientId": "665f...", "platformId": "665f...",
  "paidAt": "2026-06-20T00:00:00.000Z",
  "gross": MoneyConverted,                 // amount client paid, in invoice currency + base equiv
  "platformFeeMinor": 1500000, "platformFeeBaseMinor": 4170000, // fee in invoice ccy + base
  "netReceived": MoneyConverted,           // gross - fee, in invoice ccy + base equiv (baseAmountMinor = net in base)
  "isManualRate": false,
  "note": "Milestone 1", "createdAt": "..."
}
```

#### `GET /payments` — 🔒 F+A
Query: `?page&limit&clientId=&platformId=&invoiceId=&from=&to=&sort=-paidAt`
Res `200`: `{ "data": [Payment], "meta": {...} }`
#### `POST /payments` — 🔒 F
Req:
```json
{ "invoiceId": "665f...", "paidAt": "2026-06-20T00:00:00.000Z",
  "grossAmountMinor": 5000000, "currency": "USD",
  "forexRate": null,            // null => server fetches; number => manual override
  "platformFeeOverrideMinor": null // null => engine computes from platform.feeConfig; number => override (in invoice ccy)
}
```
Behavior: if `forexRate` is null, server resolves via forexService for (currency → baseCurrency) at `paidAt` date. If forex unavailable AND no rate supplied → `424 FOREX_UNAVAILABLE` with `{ "error": { "code": "FOREX_UNAVAILABLE", "message": "Provide forexRate manually", "details": [{ "field": "forexRate", "message": "required" }] } }`.
Res `201`: `{ "data": Payment }`
Side effects: invoice `amountPaidMinor`/`status` updated; tax liability recomputed; socket events `payment:created`, `invoice:updated`, `tax:updated` emitted.
#### `GET /payments/:id` — 🔒 F+A → `{ "data": Payment }`
#### `DELETE /payments/:id` — 🔒 F → `204`. Reverses invoice totals + recomputes tax. Emits same events.

---

### Forex — F-06, A-04

#### `GET /forex/rate` — 🔒 F
Query: `?base=PKR&quote=USD&date=2026-06-20` (date optional → latest)
Res `200`:
```json
{ "data": { "base": "PKR", "quote": "USD", "date": "2026-06-20", "rate": 278.00, "source": "frankfurter", "cached": true } }
```
Errors: `424 FOREX_UNAVAILABLE` → `{ "data": { "needsManualRate": true } }` style is **not** used; return the error envelope `{ "error": { "code": "FOREX_UNAVAILABLE", ... } }`. Client then prompts manual entry.

---

### Expenses — F-13, F-14

```jsonc
Expense = {
  "id": "665f...", "title": "Adobe CC", "category": "software", // software|hardware|internet|coworking|marketing|fees|travel|other
  "amount": MoneyConverted, "incurredAt": "2026-06-05T00:00:00.000Z",
  "isBusiness": true, "isDeductible": true, "note": "Annual plan", "createdAt": "..."
}
```
#### `GET /expenses` — 🔒 F+A
Query: `?page&limit&category=&isBusiness=&isDeductible=&from=&to=&sort=-incurredAt`
Res `200`: `{ "data": [Expense], "meta": {...} }`
#### `POST /expenses` — 🔒 F
Req:
```json
{ "title": "Adobe CC", "category": "software", "amountMinor": 5499, "currency": "USD",
  "forexRate": null, "incurredAt": "2026-06-05T00:00:00.000Z",
  "isBusiness": true, "isDeductible": true, "note": "Annual plan" }
```
Res `201`: `{ "data": Expense }`. Side effect: tax liability recomputed; `tax:updated` emitted.
#### `GET /expenses/:id` — 🔒 F+A → `{ "data": Expense }`
#### `PATCH /expenses/:id` — 🔒 F (partial) → `{ "data": Expense }`
#### `DELETE /expenses/:id` — 🔒 F → `204`. Recomputes tax.
#### `GET /expenses/categories/summary` — 🔒 F+A
Query: `?from=&to=`
Res `200`:
```json
{ "data": { "baseCurrency": "PKR", "byCategory": [ { "category": "software", "totalBaseMinor": 12000000, "deductibleBaseMinor": 12000000, "count": 4 } ], "totalBaseMinor": 50000000, "deductibleBaseMinor": 38000000 } }
```

---

### Tax — F-15, F-16, F-17

```jsonc
TaxSlab = { "uptoMinor": 60000000, "rate": 0, "fixedMinor": 0 } // rate %, applied to income within band; fixedMinor added
TaxConfig = {
  "id": "665f...", "regime": "PK_FBR", "currency": "PKR", "fiscalYearStartMonth": 7,
  "slabs": [ TaxSlab ], "isCustom": false, "createdAt": "..."
}
```
#### `GET /tax/config` — 🔒 F+A → `{ "data": TaxConfig }`
#### `PUT /tax/config` — 🔒 F (replace slabs / regime)
Req:
```json
{ "regime": "CUSTOM", "currency": "PKR", "fiscalYearStartMonth": 7,
  "slabs": [ { "uptoMinor": 60000000, "rate": 0, "fixedMinor": 0 }, { "uptoMinor": null, "rate": 15, "fixedMinor": 0 } ] }
```
Res `200`: `{ "data": TaxConfig }`. Recomputes liability; emits `tax:updated`.
#### `GET /tax/presets` — 🔒 F → `{ "data": [ { "regime": "PK_FBR", "label": "Pakistan FBR (TY 2024-25)", "currency": "PKR", "slabs": [TaxSlab] }, { "regime": "IN_IT", ... }, { "regime": "BD_NBR", ... } ] }`
#### `GET /tax/liability` — 🔒 F+A
Query: `?fiscalYear=2026` (optional → current FY)
Res `200`:
```json
{ "data": {
  "fiscalYear": 2026, "baseCurrency": "PKR",
  "grossIncomeBaseMinor": 300000000, "platformFeesBaseMinor": 30000000,
  "netIncomeBaseMinor": 270000000, "deductibleExpensesBaseMinor": 38000000,
  "taxableIncomeBaseMinor": 232000000,
  "estimatedTaxBaseMinor": 27840000, "effectiveRate": 12.0,
  "quarterlySetAsideBaseMinor": 6960000,
  "asOf": "2026-06-11T00:00:00.000Z"
} }
```

---

### Cash Flow — F-18, F-19

#### `GET /cashflow/timeline` — 🔒 F+A
Query: `?from=2026-06-01&to=2026-09-01&openingBalanceMinor=10000000`
Res `200`:
```json
{ "data": {
  "baseCurrency": "PKR",
  "openingBalanceMinor": 10000000,
  "dangerZoneThresholdMinor": 5000000,
  "events": [
    { "date": "2026-06-20", "type": "expected_income", "label": "INV-2026-0007 (Acme)", "refId": "665f...", "amountBaseMinor": 41700000, "confidence": "expected" },
    { "date": "2026-06-25", "type": "expense", "label": "Office rent", "refId": "665f...", "amountBaseMinor": -8000000, "confidence": "scheduled" },
    { "date": "2026-06-28", "type": "confirmed_income", "label": "Payment (Fiverr)", "refId": "665f...", "amountBaseMinor": 16000000, "confidence": "confirmed" }
  ],
  "balancePoints": [ { "date": "2026-06-20", "projectedBalanceMinor": 51700000, "inDanger": false } ],
  "dangerWindows": [ { "from": "2026-07-15", "to": "2026-07-22", "minBalanceMinor": 2000000 } ]
} }
```
> `type`: `expected_income`(outstanding invoice due) | `confirmed_income`(recorded payment) | `expense`. `amountBaseMinor` negative for outflows.

---

### Reports — F-22, F-23, F-24

#### `GET /reports/annual-summary` — 🔒 F+A
Query: `?fiscalYear=2026`
Res `200`:
```json
{ "data": {
  "fiscalYear": 2026, "baseCurrency": "PKR",
  "grossInvoicedBaseMinor": 320000000, "platformFeesBaseMinor": 30000000,
  "netReceivedBaseMinor": 270000000, "deductibleExpensesBaseMinor": 38000000,
  "taxableIncomeBaseMinor": 232000000, "estimatedTaxBaseMinor": 27840000,
  "byMonth": [ { "month": "2026-06", "grossBaseMinor": 41700000, "netBaseMinor": 37000000, "expensesBaseMinor": 8000000 } ],
  "byClient": [ { "clientId": "665f...", "name": "Acme", "netBaseMinor": 120000000 } ],
  "byPlatform": [ { "platformId": "665f...", "name": "Upwork", "grossBaseMinor": 200000000, "feesBaseMinor": 20000000, "netBaseMinor": 180000000 } ]
} }
```
#### `POST /reports/annual-summary/pdf` — 🔒 F+A
Req: `{ "fiscalYear": 2026 }`
Res `200`: `{ "data": { "pdfUrl": "https://s3...presigned" } }`
#### `GET /reports/client-profitability` — 🔒 F+A
Query: `?from=&to=&sort=-netBaseMinor`
Res `200`:
```json
{ "data": { "baseCurrency": "PKR", "clients": [ { "clientId": "665f...", "name": "Acme", "grossBaseMinor": 130000000, "feesBaseMinor": 13000000, "netBaseMinor": 117000000, "invoiceCount": 8, "overdueCount": 1, "reliabilityScore": 82 } ] } }
```
#### `GET /reports/platform-comparison` — 🔒 F+A
Query: `?from=&to=`
Res `200`:
```json
{ "data": { "baseCurrency": "PKR", "platforms": [ { "platformId": "665f...", "name": "Upwork", "grossBaseMinor": 200000000, "feesBaseMinor": 20000000, "netBaseMinor": 180000000, "effectiveFeeRate": 10.0, "paymentCount": 24 } ] } }
```

---

### Income Dashboard — F-11, F-12

#### `GET /dashboard/summary` — 🔒 F+A
Query: `?period=month|quarter|year&date=2026-06-11`
Res `200`:
```json
{ "data": {
  "baseCurrency": "PKR", "period": "month", "rangeFrom": "2026-06-01", "rangeTo": "2026-06-30",
  "grossInvoicedBaseMinor": 41700000, "netReceivedBaseMinor": 37000000,
  "platformFeesBaseMinor": 4700000, "expensesBaseMinor": 8000000,
  "outstandingBaseMinor": 41700000, "overdueBaseMinor": 0,
  "estimatedTaxBaseMinor": 27840000, "quarterlySetAsideBaseMinor": 6960000,
  "byClient": [ { "clientId": "665f...", "name": "Acme", "netBaseMinor": 37000000 } ],
  "byPlatform": [ { "platformId": "665f...", "name": "Upwork", "netBaseMinor": 37000000 } ],
  "byCurrency": [ { "currency": "USD", "grossMinor": 5000000, "netReceivedBaseMinor": 37000000 } ]
} }
```
#### `GET /dashboard/trends` — 🔒 F+A
Query: `?granularity=month&months=12`
Res `200`:
```json
{ "data": {
  "baseCurrency": "PKR",
  "series": [ { "period": "2026-06", "grossBaseMinor": 41700000, "netBaseMinor": 37000000, "expensesBaseMinor": 8000000 } ],
  "averageNetBaseMinor": 35000000,
  "bestMonth": { "period": "2026-05", "netBaseMinor": 52000000 },
  "worstMonth": { "period": "2026-02", "netBaseMinor": 11000000 }
} }
```

---

### Late Payments / Reminders — F-20, F-21

```jsonc
Reminder = {
  "id": "665f...", "invoiceId": "665f...", "clientId": "665f...",
  "sequenceStep": 1, // 1..n
  "suggestedAction": "Polite nudge — invoice 7 days overdue",
  "channel": "email", // email|whatsapp|manual (tracking only)
  "status": "pending", // pending|sent|skipped
  "sentAt": null, "createdAt": "..."
}
```
#### `GET /overdue` — 🔒 F+A
Query: `?bucket=d30|d60|d90plus&clientId=`
Res `200`:
```json
{ "data": { "baseCurrency": "PKR",
  "buckets": { "current": { "count": 3, "totalBaseMinor": 0 }, "d30": { "count": 1, "totalBaseMinor": 41700000 }, "d60": { "count": 0, "totalBaseMinor": 0 }, "d90plus": { "count": 0, "totalBaseMinor": 0 } },
  "invoices": [ { "invoiceId": "665f...", "number": "INV-2026-0007", "clientId": "665f...", "clientName": "Acme", "dueDate": "2026-05-01T00:00:00.000Z", "overdueDays": 41, "agingBucket": "d30", "amountDueMinor": 5000000, "currency": "USD", "amountDueBaseMinor": 41700000 } ]
} }
```
#### `GET /invoices/:id/reminders` — 🔒 F+A → `{ "data": [Reminder], "meta": {...} }`
#### `POST /invoices/:id/reminders` — 🔒 F → generates next reminder in sequence → Res `201` `{ "data": Reminder }`
#### `PATCH /reminders/:id` — 🔒 F → Req `{ "status": "sent" }` → Res `200` `{ "data": Reminder }` (degrades client reliability if overdue).

---

### Accountant Access — F-25

```jsonc
AccountantInvite = { "id": "665f...", "email": "cpa@firm.com", "status": "pending", "token": "abc123", "invitedAt": "...", "acceptedAt": null }
```
#### `GET /accountants` — 🔒 F → `{ "data": [AccountantInvite], "meta": {...} }`
#### `POST /accountants/invite` — 🔒 F → Req `{ "email": "cpa@firm.com" }` → Res `201` `{ "data": AccountantInvite }` (token surfaced if SES off).
#### `DELETE /accountants/:id` — 🔒 F → `204` (revoke access).
#### `POST /accountants/accept` — public → Req `{ "token": "abc123", "name": "CPA", "password": "min8" }` → Res `201` `{ "data": { "user": User(role=accountant), "accessToken": "...", "refreshToken": "..." } }`. An accountant logging in selects which linked account to view via `GET /auth/me` → `accounts: [{ accountId, freelancerName }]` and passes `X-Account-Id` header on scoped reads.

---

### Real-time (socket.io)

- **Namespace:** `/` · **Auth:** handshake `auth: { token: <accessToken> }`. Invalid → disconnect.
- **Room:** client auto-joins room `account:<accountId>`.
- **Server → client events:**

| Event | Payload | Trigger |
|-------|---------|---------|
| `payment:created` | `{ "data": Payment }` | POST /payments |
| `payment:deleted` | `{ "id": "665f...", "invoiceId": "665f..." }` | DELETE /payments/:id |
| `invoice:updated` | `{ "data": Invoice }` | status/total change |
| `tax:updated` | `{ "data": <GET /tax/liability data> }` | payment/expense/tax-config change |
| `cashflow:danger` | `{ "data": { "from": "...", "to": "...", "minBalanceMinor": 2000000 } }` | daily cron / payment change |
| `reliability:updated` | `{ "clientId": "665f...", "reliabilityScore": 78 }` | reminder/overdue recompute |

---

## Environment & Deployment

**Env vars — server (`server/.env`):**
```
PORT=4000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
ACCESS_TTL=15m
REFRESH_TTL=7d
CLIENT_ORIGIN=https://app.freelanceos.com
AWS_REGION=ap-south-1
S3_BUCKET=freelanceos-exports
SES_FROM=no-reply@freelanceos.com   # optional
FOREX_PRIMARY=https://api.frankfurter.app
FOREX_FALLBACK=https://v6.exchangerate-api.com/v6/<key>
```
**Env vars — client (`client/.env`):**
```
VITE_USE_DUMMY_DATA=true
VITE_API_BASE_URL=https://api.freelanceos.com/api/v1
VITE_SOCKET_URL=https://api.freelanceos.com
```
**Environments:** dev (docker-compose: api + mongo), staging (EC2, separate Atlas DB), prod (EC2 + Atlas + S3 + CloudFront).
**CI/CD (GitHub Actions):** PR → lint + unit tests (client & server). Merge to `main` → build server Docker image → push to ECR → deploy to EC2 (SSH/CodeDeploy); build client → sync to S3 → invalidate CloudFront.

## Key Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Integer minor units for all money | Avoids float rounding errors in multi-currency math; reconciliation must be exact. |
| 2 | Forex frozen at payment time on the Payment doc | Historical accuracy — later rate changes must never alter recorded net received. |
| 3 | REST over GraphQL | Simpler parallel FE/BE build from a fixed contract; no over-fetch concerns at this scale. |
| 4 | Tax/cashflow computed on-read (no Redis) | Single-user data volume is tiny; correctness over premature caching. Forex is the only cached lookup. |
| 5 | socket.io rooms keyed by accountId | Clean per-account isolation; accountant joins the freelancer's room read-only. |
| 6 | Dummy-data toggle in client service layer | FE built/demoed independently of BE; identical response shapes guarantee swap-in. |
| 7 | Accountant scoping via `X-Account-Id` header | One accountant identity can serve multiple freelancers without cross-leak. |
| 8 | `404` (not `403`) on cross-account access | Avoids leaking existence of other accounts' resources. |
