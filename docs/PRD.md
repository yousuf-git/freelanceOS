# freelanceOS — Product Requirements

> **Tagline:** "QuickBooks rebuilt from scratch for a Pakistani freelancer on Upwork."

## Assumptions

Generated autonomously — Phase 0 clarification was skipped. The following decisions were made and are binding for all downstream docs.

| # | Area | Decision |
|---|------|----------|
| A-01 | Scale | MVP. Single freelancer per account. One account = one freelancer's books. No multi-tenant orgs, no teams. |
| A-02 | Roles | Two roles: `freelancer` (owner, full CRUD) and `accountant` (read-only, invited by freelancer, scoped to that freelancer's financials). An accountant may be linked to multiple freelancer accounts but sees each independently. |
| A-03 | Auth | Custom JWT (access + refresh). Email + password signup. No social login in v1. |
| A-04 | Forex | Rates pulled from a free API ([frankfurter.app](https://frankfurter.app), no key required; [exchangerate-api](https://exchangerate-api.com) as documented fallback). On API failure, freelancer manually enters the rate. Rate is captured and frozen at payment-record time. |
| A-05 | Tax | Tax slabs are configurable per account. Ship with Pakistan FBR (TY 2024–25) defaults seeded. India (IT) and Bangladesh (NBR) slab sets included as selectable presets but only FBR is the default. Estimation only — not filing-grade advice. |
| A-06 | Payments | **No payment processing.** The product *tracks* money; it never *moves* money. No Stripe/PayPal integration, no card capture. |
| A-07 | Base currency | Each account picks one "local/base" currency at onboarding (default `PKR`). All dashboards, taxes, and net totals are denominated in base currency. Invoices are issued in a client/billing currency. |
| A-08 | Platform fees | Fee structures are configurable per platform. Ship presets: Upwork (sliding/flat-10% configurable), Fiverr (flat 20%), Direct (0%). |
| A-09 | Real-time | socket.io pushes live updates for: new payment recorded, invoice status change, tax-liability recompute, cash-flow danger-zone alerts. Single-user rooms keyed by account. |
| A-10 | Reminders | Late-payment reminders are *generated and tracked* in-app (reminder log + suggested next action). Actual email/WhatsApp send-out is out of scope for v1 — the system surfaces the sequence and records when the user marks a reminder sent. |
| A-11 | Hosting | AWS (EC2 for API, S3 for PDF/exports, MongoDB Atlas for DB). CI/CD via GitHub Actions. |
| A-12 | Money storage | All monetary amounts stored as integer **minor units** (e.g. cents/paisa) + an ISO-4217 currency code, never floats. |

## Problem

Freelancers in South Asia earning foreign currency run their finances across 5+ disconnected workflows — invoicing clients, tracking payments in multiple currencies, calculating platform fees (Upwork ~10%, Fiverr 20%), estimating taxes, managing expenses, and chasing late payments. The tooling is Excel + WhatsApp + mental math, producing zero financial visibility. No existing tool treats freelancing as a *business with real financial operations*: currency-aware, platform-fee-aware, and localized to South Asian tax regimes (Pakistan FBR, India IT, Bangladesh NBR).

The market is large and underserved: 2M+ registered freelancers in Pakistan alone, millions more across India and Bangladesh, earning $2B+ annually and managing it manually. The freelance economy is government-backed (Pakistan PSEB, Digital India).

## Solution

A unified financial workspace where a freelancer manages clients, invoices, income, expenses, taxes, and cash flow — every figure currency-aware (gross billed vs net received after conversion), platform-fee-aware (real vs gross earnings), and tax-localized. A running tax-liability estimate updates on every payment, a cash-flow timeline projects balances and flags danger zones, and a read-only accountant view exports tax-ready summaries.

## Target Users

| Role | Need |
|------|------|
| Freelancer (primary) | Single source of truth for all income/expense/tax/cash-flow data; knows real (net) earnings, what to set aside for tax, and which clients/platforms actually pay. |
| Accountant (read-only) | Clean, exportable, tax-ready financial summaries for filing — without edit access or back-and-forth over spreadsheets. |

## Core Features

### Client Management

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-01 | Client profiles | Create/edit clients with contact info, billing currency, default platform, contract terms, rate agreement. | must |
| F-02 | Payment reliability rating | Per-client score (0–100) computed from actual payment punctuality history; degrades on overdue invoices. | must |
| F-03 | Communication / notes log | Timestamped notes and interaction history per client. | should |

### Invoicing

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-04 | Multi-currency invoice | Generate invoice in client's billing currency with line items; track in base currency. | must |
| F-05 | Invoice lifecycle | States: draft → sent → partially_paid → paid / overdue / void. | must |
| F-06 | Forex capture at payment | On payment record, capture exchange rate (free API, manual fallback) and compute actual received in base currency. | must |
| F-07 | PDF export | Render invoice to PDF (S3-stored), downloadable/shareable. | should |

### Platform Fee Engine

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-08 | Configurable fee structures | Per-platform fee rules: flat %, sliding scale (tiered by lifetime billings), or fixed. | must |
| F-09 | Auto fee deduction | On payment, auto-deduct platform fee; expose gross vs net. | must |

### Income & Dashboard

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-10 | Payment records | Record full/partial payments against invoices; each carries platform fee, forex rate, net received. | must |
| F-11 | Income dashboard | Monthly/quarterly/annual views; breakdown by client, currency, platform; gross-invoiced vs net-received. | must |
| F-12 | Trends & extremes | Trends, averages, best/worst months. | should |

### Expenses

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-13 | Expense tracking | Log expenses with category, amount, currency, date, deductible flag. | must |
| F-14 | Categories & business/personal split | Categorized (software, hardware, internet, coworking…); business vs personal separation. | must |

### Tax Estimation

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-15 | Configurable tax slabs | Per-account slab sets; FBR default seeded, IT/NBR presets selectable. | must |
| F-16 | Running tax liability | Live liability estimate (taxable income = net income − deductible expenses) recomputed on every payment/expense. | must |
| F-17 | Quarterly set-aside | Recommended amount to set aside this quarter for tax. | should |

### Cash Flow

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-18 | Cash-flow timeline | Calendar of expected payments (outstanding invoices), confirmed income, upcoming expenses, projected running balance. | must |
| F-19 | Danger-zone alerts | Highlight periods where projected balance drops below a configurable threshold; real-time push. | should |

### Late Payment

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-20 | Overdue aging | Buckets: current / 30 / 60 / 90+ days overdue. | must |
| F-21 | Reminder sequences | Generate & track a reminder sequence per overdue invoice; log sent reminders; reliability degrades. | should |

### Reports

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-22 | Tax-ready annual summary | Year totals: gross, fees, net, deductible expenses, taxable income, estimated tax. PDF export. | must |
| F-23 | Client profitability report | Revenue per client, net of fees. | should |
| F-24 | Platform comparison | Net yield per platform after fees + conversion. | should |

### Roles & Access

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-25 | Accountant invite | Freelancer invites an accountant (email); accountant gets read-only scoped access. | should |
| F-26 | Auth & session | Email/password signup, JWT access+refresh, session management. | must |

### Platform / System

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F-27 | Real-time updates | socket.io live push for payments, invoice status, tax recompute, alerts. | should |
| F-28 | Settings | Base currency, platforms, tax regime, danger-zone threshold, profile. | must |

## Success Metrics

- A freelancer can record a foreign-currency payment and see net-received (after fee + conversion) in base currency in **≤ 3 clicks**.
- Tax-liability estimate updates within **2s** of a payment/expense being saved (real-time push).
- **100%** of monetary figures reconcile: Σ(net received) − Σ(deductible expenses) == taxable-income figure shown on dashboard, for any date range.
- Cash-flow timeline projects **≥ 90 days** forward from outstanding invoices + scheduled expenses.
- Accountant can export a tax-ready annual PDF without any freelancer involvement after invite.
- Onboarding to first recorded invoice in **< 10 minutes**.

## Out of Scope (v1)

- Payment processing / money movement (no Stripe, PayPal, payouts). Tracking only.
- Multi-user teams, sub-accounts, agencies. One freelancer per account.
- Automated email/WhatsApp/SMS reminder *delivery* (reminders are generated and tracked in-app only).
- Mobile native apps (responsive web only).
- Social/OAuth login.
- Time tracking (profitability uses revenue, not logged hours, in v1).
- Bank/Upwork/Fiverr API auto-sync of transactions (manual entry in v1).
- Filing-grade tax compliance / official e-filing integration.
