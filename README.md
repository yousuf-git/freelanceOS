<div align="center">

  <img src="logo.svg" alt="freelanceOS logo" width="120" />

  <h1>freelanceOS</h1>

  <p><strong>A unified financial workspace for south asian freelancers. Currency-aware, platform-fee-aware, and tax-localized to Pakistan FBR, India IT, and Bangladesh NBR.</strong></p>

  <br/>

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
  ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

> Freelancers in South Asia earning foreign currency juggle invoicing, multi-currency payments, platform fees (Upwork ~10%, Fiverr 20%), tax estimation, and expense tracking across disconnected spreadsheets and mental math. freelanceOS replaces that with a single financial workspace: every figure is gross-vs-net, forex-adjusted, platform-fee-deducted, and mapped to your local tax regime in real time.

## <img src="https://api.iconify.design/lucide/info.svg?color=%236e7681&width=22" /> About

freelanceOS is an MVP-grade financial management system built for a single freelancer account. It tracks clients, invoices, payments, expenses, and tax liability — never moving money, only recording it. The core data model stores all monetary amounts as integer minor units (paisa/cents) to guarantee exact reconciliation across multi-currency math.

Two roles are supported: `freelancer` (full CRUD) and `accountant` (read-only, invited by the freelancer). Pakistan FBR tax slabs are seeded by default; India IT and Bangladesh NBR are selectable presets. Live updates (new payment, invoice status change, tax recompute, cash-flow danger alerts) are pushed over socket.io to the account room in real time.

## <img src="https://api.iconify.design/lucide/sparkles.svg?color=%236e7681&width=22" /> Features

- **Multi-currency invoicing** — issue invoices in any client billing currency; forex rate (via frankfurter.app) is fetched and frozen at payment time.
- **Platform fee engine** — configurable per-platform fee structures (flat %, sliding scale, fixed amount); Upwork/Fiverr/Direct presets seeded on registration.
- **Running tax liability** — live estimate (gross income − platform fees − deductible expenses) recomputed on every payment or expense save; FBR default with IT/NBR presets.
- **Cash-flow timeline** — projects balance 90+ days forward from outstanding invoices and scheduled expenses; flags danger windows where balance drops below a configurable threshold.
- **Overdue aging & reminder sequences** — buckets invoices at current / 30 / 60 / 90+ days; generates and tracks reminder sequences per overdue invoice; degrades client reliability score on each overdue event.
- **Income dashboard** — monthly/quarterly/annual breakdowns by client, currency, and platform; gross-invoiced vs net-received after fee and conversion.
- **Client profitability & platform comparison reports** — net yield per client and per platform after fees and forex; exportable as PDF (via pdfkit, stored on S3).
- **Accountant read-only access** — invite by email; accountant scoped to one freelancer's account via `X-Account-Id` header; exports tax-ready annual PDF without freelancer involvement.
- **Real-time socket.io events** — `payment:created`, `invoice:updated`, `tax:updated`, `cashflow:danger`, `reliability:updated` pushed to per-account rooms.
- **Dummy-data toggle** — frontend service layer has a `VITE_USE_DUMMY_DATA` flag; swaps real API calls for fixture data with identical shapes for isolated FE development/demo.

## <img src="https://api.iconify.design/lucide/layers.svg?color=%236e7681&width=22" /> Tech Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router v6, TanStack Query, Zustand, React Hook Form + Zod, Recharts, socket.io-client, Axios
- **Backend:** Node.js 20 LTS, Express.js (ES modules), Zod validation, JWT (access 15m / refresh 7d), bcrypt, socket.io, pdfkit, node-cron
- **Database:** MongoDB Atlas, Mongoose ODM
- **Infrastructure:** AWS EC2 (API, PM2), S3 (PDF exports), CloudFront (frontend static), MongoDB Atlas
- **External services:** frankfurter.app (forex primary, keyless), exchangerate-api.com (forex fallback), AWS SES (accountant invite emails, optional)
- **Dev tooling:** Docker + docker-compose, GitHub Actions (CI/CD), Jest + Supertest + mongodb-memory-server, nodemon

## <img src="https://api.iconify.design/lucide/network.svg?color=%236e7681&width=22" /> Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React SPA (CloudFront/S3)                                  │
│  TanStack Query ←→ Axios (JWT interceptor + refresh)        │
│  Zustand (auth, UI state)  socket.io-client (live events)   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS  /api/v1
┌──────────────────────────▼──────────────────────────────────┐
│  Express REST API  (Node.js 20, EC2/PM2)                    │
│  Zod validation → JWT+role middleware → controllers         │
│  Services: taxEngine, feeEngine, forexService, cashflow,    │
│            reliabilityService, pdfService                   │
│  socket.io (rooms: account:<accountId>)                     │
│  node-cron: daily overdue aging + reliability recompute     │
└────────────┬──────────────────┬──────────────────────────────┘
             │ Mongoose         │ presigned URLs
     ┌───────▼──────┐    ┌──────▼──────┐
     │ MongoDB Atlas│    │   AWS S3    │
     └──────────────┘    └─────────────┘
             │
     ┌───────▼──────────────────────────┐
     │  frankfurter.app → exchangerate  │
     │  (forex rate lookup, per-day     │
     │   cache in ForexRate collection) │
     └──────────────────────────────────┘
```

The service layer is the authoritative business logic boundary. Controllers are thin (validate → call service → respond). All monetary values flow through the system as `{ amountMinor: integer, currency: "ISO-4217" }` — never floats. Forex rates are frozen on the `Payment` document at record time and never retroactively updated.

## <img src="https://api.iconify.design/lucide/folder-tree.svg?color=%236e7681&width=22" /> Project Structure

```
freelanceOS/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express + socket.io bootstrap
│   │   ├── app.js              # app factory (routes, middleware)
│   │   ├── config/             # env, db, cors
│   │   ├── middleware/         # auth, role, ownership, validate(zod), error
│   │   ├── models/             # Mongoose models (User, Account, Client, Invoice, Payment, Expense, …)
│   │   ├── routes/             # Express routers (auth, clients, invoices, payments, expenses, tax, …)
│   │   ├── controllers/        # thin request handlers
│   │   ├── services/           # taxEngine, feeEngine, forexService, cashflowService, pdfService, …
│   │   ├── validators/         # Zod schemas per endpoint
│   │   ├── sockets/            # room management + emit helpers
│   │   ├── jobs/               # node-cron daily tasks
│   │   └── seed/               # FBR/IT/NBR tax slab presets, platform presets
│   └── tests/
│       ├── api/                # Supertest integration tests (auth, invoices)
│       └── unit/               # Unit tests (feeEngine, taxEngine)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── routes/             # route definitions + auth guards
│   │   ├── pages/              # dashboard, clients, invoices, payments, expenses, tax, cashflow, reports, settings, auth
│   │   ├── components/         # shared UI (tables, cards, charts, forms)
│   │   ├── services/           # data-service layer
│   │   │   ├── http.js         # Axios instance + JWT/refresh interceptor
│   │   │   ├── socket.js       # socket.io-client setup
│   │   │   ├── index.js        # real-or-dummy switch (VITE_USE_DUMMY_DATA)
│   │   │   ├── real/           # real API implementations
│   │   │   └── dummy/          # fixture-based mock implementations
│   │   ├── store/              # Zustand stores (auth, UI)
│   │   ├── hooks/              # TanStack Query hooks wrapping services
│   │   └── lib/                # money, currency, date utilities; Zod validators
│   └── vite.config.js
├── docs/                       # PRD, TRD, DBD, FED, UCD
├── workflows/ci-cd.yml
└── docker-compose.yml          # <!-- TODO: add if docker-compose.yml exists at root -->
```

## <img src="https://api.iconify.design/lucide/download.svg?color=%236e7681&width=22" /> Getting Started

### Prerequisites

- Node.js >= 20 LTS
- npm
- MongoDB (local via Docker, or MongoDB Atlas URI)
- AWS S3 bucket for PDF exports (optional for local dev)

### Installation

```bash
git clone <repo-url>
cd freelanceOS

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### Environment

**Backend** — copy `backend/.env.example` to `backend/.env`:

| Variable | Description | Required |
|---|---|---|
| `PORT` | API server port | No (default `4000`) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_ACCESS_SECRET` | Secret for access tokens (15m TTL) | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (7d TTL) | Yes |
| `CLIENT_ORIGIN` | CORS allowed origin (frontend URL) | Yes |
| `AWS_REGION` | AWS region for S3 + SES | Yes |
| `S3_BUCKET` | S3 bucket name for PDF exports | Yes |
| `SES_FROM` | SES sender address for accountant invites | No |
| `FOREX_PRIMARY` | Primary forex API URL (frankfurter.app) | No |
| `FOREX_FALLBACK` | Fallback forex API base URL | No |
| `EXCHANGERATE_API_KEY` | API key for exchangerate-api.com fallback | No |

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

| Variable | Description | Default |
|---|---|---|
| `VITE_USE_DUMMY_DATA` | Use fixture data instead of real API | `true` |
| `VITE_API_BASE_URL` | REST API base URL | `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | socket.io server URL | `http://localhost:5000` |

### Running

```bash
# Backend (development)
cd backend
npm run dev         # nodemon, auto-reload

# Seed tax presets + platform defaults into the DB
npm run seed

# Frontend (development)
cd frontend
npm run dev         # Vite HMR on http://localhost:5173
```

## <img src="https://api.iconify.design/lucide/webhook.svg?color=%236e7681&width=22" /> API Reference

All endpoints are prefixed `/api/v1`. Authentication uses `Authorization: Bearer <accessToken>`. All money values are integer minor units + an ISO-4217 currency field.

<details>
<summary>Endpoint overview</summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | public | Register freelancer; returns user + tokens |
| `POST` | `/auth/login` | public | Login; returns user + tokens |
| `POST` | `/auth/refresh` | public | Rotate access + refresh tokens |
| `POST` | `/auth/logout` | Bearer | Invalidate refresh token |
| `GET` | `/auth/me` | Bearer | Current user profile |
| `GET/PATCH` | `/account/settings` | Bearer | Base currency, tax regime, danger-zone threshold |
| `GET/POST/PATCH/DELETE` | `/platforms` | Bearer | Platform fee configurations |
| `GET/POST/PATCH/DELETE` | `/clients` | Bearer | Client profiles + reliability scores |
| `GET/POST/DELETE` | `/clients/:id/notes` | Bearer | Client communication log |
| `GET/POST/PATCH/DELETE` | `/invoices` | Bearer | Multi-currency invoice lifecycle |
| `POST` | `/invoices/:id/send` | Bearer | Transition draft → sent |
| `POST` | `/invoices/:id/void` | Bearer | Void an invoice |
| `POST` | `/invoices/:id/pdf` | Bearer | Generate + upload PDF to S3 |
| `GET/POST/DELETE` | `/payments` | Bearer | Record payments; triggers forex fetch, fee calc, tax recompute |
| `GET` | `/forex/rate` | Bearer | Fetch/cache exchange rate for a currency pair + date |
| `GET/POST/PATCH/DELETE` | `/expenses` | Bearer | Expense tracking with deductible flag |
| `GET` | `/expenses/categories/summary` | Bearer | Expense totals by category |
| `GET/PUT` | `/tax/config` | Bearer | Tax slab configuration |
| `GET` | `/tax/presets` | Bearer | FBR / IT / NBR preset slab sets |
| `GET` | `/tax/liability` | Bearer | Current fiscal-year tax liability estimate |
| `GET` | `/cashflow/timeline` | Bearer | Projected cash-flow with danger windows |
| `GET` | `/dashboard/summary` | Bearer | Period income/expense/tax summary |
| `GET` | `/dashboard/trends` | Bearer | Monthly trends, best/worst month |
| `GET` | `/overdue` | Bearer | Overdue invoices bucketed by aging |
| `GET/POST` | `/invoices/:id/reminders` | Bearer | Reminder sequences for overdue invoices |
| `PATCH` | `/reminders/:id` | Bearer | Mark reminder sent (degrades reliability) |
| `GET/POST/DELETE` | `/accountants` | Bearer | Invite + manage accountant access |
| `POST` | `/accountants/accept` | public | Accountant accepts invite + sets password |
| `GET` | `/reports/annual-summary` | Bearer | Annual tax-ready summary by month/client/platform |
| `POST` | `/reports/annual-summary/pdf` | Bearer | Export annual summary as PDF |
| `GET` | `/reports/client-profitability` | Bearer | Net revenue per client after fees |
| `GET` | `/reports/platform-comparison` | Bearer | Net yield per platform after fees + conversion |

</details>

**Standard response envelopes:**

```json
// Success (single)
{ "data": { /* resource */ } }

// Success (list)
{ "data": [ /* resources */ ], "meta": { "page": 1, "limit": 20, "total": 57, "totalPages": 3 } }

// Error
{ "error": { "code": "VALIDATION_ERROR", "message": "human readable", "details": [] } }
```

Error codes: `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `FOREX_UNAVAILABLE` (424), `RATE_LIMIT` (429), `INTERNAL` (500).

## <img src="https://api.iconify.design/lucide/flask-conical.svg?color=%236e7681&width=22" /> Testing

```bash
cd backend
npm test
```

Uses Jest + Supertest against an in-process `mongodb-memory-server`. Test suites cover auth flow, invoice API, fee engine, and tax engine. CI runs the suite on every PR and push to `main`.

## <img src="https://api.iconify.design/lucide/rocket.svg?color=%236e7681&width=22" /> Deployment

**Frontend** — deployed on Vercel. See **[docs/FE_DEPLOY.md](docs/FE_DEPLOY.md)** for Vercel project settings, required env vars, CORS config, and troubleshooting.

```bash
cd web && npm run build   # outputs to web/dist/
```

**Backend** — CI/CD via `workflows/ci-cd.yml`:

- **PR to `main`:** runs `npm test` against the API.
- **Merge to `main`:** SSH-deploys to EC2 — `git pull`, `npm ci --omit=dev`, `pm2 restart freelanceos-api`.

Target infra: EC2 (API, PM2), MongoDB Atlas, S3 (PDFs), Vercel (frontend).

## <img src="https://api.iconify.design/lucide/scale.svg?color=%236e7681&width=22" /> License

MIT — see [LICENSE](LICENSE).
