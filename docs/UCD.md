# freelanceOS — Use Cases

> Use case IDs: `UC-F{NN}` (freelancer), `UC-A{NN}` (accountant), `UC-S{NN}` (system/automated). Each maps to PRD feature IDs and references TRD endpoints (relative to `/api/v1`).

## Roles

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Freelancer | Account owner. Manages all financial data for their own books. | Full CRUD on all resources scoped to their `accountId`. |
| Accountant | Invited, read-only reviewer for tax filing. May be linked to multiple freelancer accounts; views each independently via `X-Account-Id`. | Read-only on all financial reads; PDF report generation. No writes. |
| System | Automated cron + service logic. No user. | Recompute aging, reliability, danger zones; emit socket events. |

---

## Use Cases

### Freelancer Use Cases

#### UC-F01: Register & onboard
**Maps:** F-26, F-28 · **Endpoints:** `POST /auth/register`, `PATCH /account/settings`
**Description:** A new freelancer creates an account, sets base currency and tax regime; system seeds default platforms (Upwork/Fiverr/Direct) and FBR tax slabs.
**Preconditions:** Email not already registered.
**Flow:**
1. User submits name, email, password, baseCurrency → `POST /auth/register`.
2. System creates User(role=freelancer), AccountSettings, seeds platform presets + PK_FBR TaxConfig.
3. Returns access + refresh tokens; client stores them, enters dashboard.
4. (Optional) User adjusts taxRegime/fiscalYearStartMonth → `PATCH /account/settings`.
**Postconditions:** Account exists with defaults; user authenticated.
**Alt Paths:**
- Email taken → `409 CONFLICT`.
- Weak password (<8) → `400 VALIDATION_ERROR`.

#### UC-F02: Log in / refresh session
**Maps:** F-26 · **Endpoints:** `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
**Flow:**
1. Submit email/password → `POST /auth/login` → tokens.
2. On `401` from any call, client calls `POST /auth/refresh` with refresh token → new tokens, retries original.
3. Logout → `POST /auth/logout` invalidates refresh token.
**Postconditions:** Valid session or cleared session.
**Alt Paths:** Bad creds → `401`. Expired refresh → force re-login.

#### UC-F03: Create / manage a client
**Maps:** F-01, F-03 · **Endpoints:** `POST /clients`, `PATCH /clients/:id`, `GET /clients`, `POST /clients/:id/notes`
**Flow:**
1. User fills client form (name, billingCurrency, defaultPlatform, contract terms, rate) → `POST /clients`.
2. System creates Client with `reliabilityScore=100` (no history yet), zeroed stats.
3. User adds notes over time → `POST /clients/:id/notes`.
**Postconditions:** Client available for invoicing.
**Alt Paths:** Delete client with invoices → `409` unless `?force`.

#### UC-F04: View client reliability
**Maps:** F-02 · **Endpoints:** `GET /clients/:id`
**Description:** Reliability score reflects actual payment punctuality; recomputed by system (UC-S02).
**Flow:** User opens client → sees `reliabilityScore`, overdueCount, totals.
**Postconditions:** None (read).

#### UC-F05: Create & send a multi-currency invoice
**Maps:** F-04, F-05 · **Endpoints:** `POST /invoices`, `POST /invoices/:id/send`, `POST /invoices/:id/pdf`
**Flow:**
1. User selects client (currency inherited), platform, line items, due date → `POST /invoices` (status draft).
2. System auto-generates `number` (`INV-{FY}-{seq}`), computes line `amountMinor`, subtotal, total, amountDue.
3. User generates PDF → `POST /invoices/:id/pdf` → S3 presigned URL.
4. User sends → `POST /invoices/:id/send` (draft→sent).
**Postconditions:** Invoice `sent`, counted as outstanding/expected income in cash flow.
**Alt Paths:** Edit after sent → only non-lineitem fields (PATCH guard). Void → `POST /invoices/:id/void` (blocked if paid).

#### UC-F06: Record a payment (core money event)
**Maps:** F-06, F-09, F-10 · **Endpoints:** `POST /payments`, `GET /forex/rate`
**Description:** Records full/partial payment; captures forex + platform fee; computes net received in base currency; updates invoice, tax, cash flow; emits real-time events.
**Preconditions:** Invoice exists and is `sent`/`partially_paid`.
**Flow:**
1. User enters gross amount, currency, paidAt; leaves `forexRate` null → `POST /payments`.
2. System resolves rate via forexService (cache→frankfurter→exchangerate-api) for currency→baseCurrency at paidAt.
3. System computes platform fee from `platform.feeConfig` (or override), net = gross − fee, converts to base.
4. System creates Payment, updates invoice `amountPaidMinor`/`status` (→partially_paid or paid), recomputes tax liability.
5. Emits `payment:created`, `invoice:updated`, `tax:updated` to room `account:<id>`.
**Postconditions:** Net received reflected in dashboard, tax, cash flow; invoice advanced.
**Alt Paths:**
- Forex unavailable & no manual rate → `424 FOREX_UNAVAILABLE`; client prompts manual `forexRate`, resubmits (UC-F07).
- Gross > amountDue → allowed (overpayment); invoice `paid`, surplus shown on payment.
- Delete payment → `DELETE /payments/:id` reverses totals + tax.

#### UC-F07: Manual forex fallback
**Maps:** F-06, A-04 · **Endpoints:** `GET /forex/rate`, `POST /payments`
**Flow:**
1. Forex lookup fails (`424`).
2. Client shows manual rate input; user enters rate.
3. Resubmit `POST /payments` with `forexRate=<n>` → Payment with `isManualRate=true`, `forexRateSource="manual"`.
**Postconditions:** Payment recorded with frozen manual rate.

#### UC-F08: Configure platform fee structures
**Maps:** F-08 · **Endpoints:** `GET /platforms`, `POST /platforms`, `PATCH /platforms/:id`
**Flow:**
1. User views seeded platforms.
2. Adjusts Upwork sliding tiers or adds a custom platform → `POST`/`PATCH /platforms`.
**Postconditions:** Future payments use updated fee logic (existing payments unchanged — frozen).
**Alt Paths:** Delete platform in use → `409` unless `?force`.

#### UC-F09: Track expenses
**Maps:** F-13, F-14 · **Endpoints:** `POST /expenses`, `GET /expenses`, `GET /expenses/categories/summary`
**Flow:**
1. User logs expense (title, category, amount, currency, business/deductible flags) → `POST /expenses`.
2. System converts to base (forex), recomputes tax liability, emits `tax:updated`.
3. User reviews category summary → `GET /expenses/categories/summary`.
**Postconditions:** Deductible expenses reduce taxable income.

#### UC-F10: Configure tax slabs / regime
**Maps:** F-15 · **Endpoints:** `GET /tax/presets`, `PUT /tax/config`, `GET /tax/config`
**Flow:**
1. User picks a preset (FBR/IT/NBR) or builds CUSTOM slabs → `PUT /tax/config`.
2. System replaces TaxConfig, recomputes liability, emits `tax:updated`.
**Postconditions:** Tax estimates use new slabs.

#### UC-F11: View running tax liability & set-aside
**Maps:** F-16, F-17 · **Endpoints:** `GET /tax/liability`
**Flow:** User opens tax view → sees taxable income, estimated tax, effective rate, quarterly set-aside for current/selected fiscal year.
**Postconditions:** None (read). Updates live via `tax:updated`.

#### UC-F12: View income dashboard & trends
**Maps:** F-11, F-12 · **Endpoints:** `GET /dashboard/summary`, `GET /dashboard/trends`
**Flow:** User selects period (month/quarter/year) → summary (gross vs net, by client/platform/currency) + 12-month trend with best/worst/average.
**Postconditions:** None (read).

#### UC-F13: View cash-flow timeline & danger zones
**Maps:** F-18, F-19 · **Endpoints:** `GET /cashflow/timeline`
**Flow:**
1. User opens timeline with date range + opening balance.
2. System projects events (expected income from outstanding invoices, confirmed payments, scheduled expenses) → balance points + danger windows where projected balance < threshold.
**Postconditions:** None (read). `cashflow:danger` may push live.

#### UC-F14: Manage overdue invoices & reminders
**Maps:** F-20, F-21 · **Endpoints:** `GET /overdue`, `POST /invoices/:id/reminders`, `PATCH /reminders/:id`
**Flow:**
1. User views aging buckets (current/30/60/90+) → `GET /overdue`.
2. For an overdue invoice, generates next reminder in sequence → `POST /invoices/:id/reminders`.
3. After sending externally, marks reminder sent → `PATCH /reminders/:id` `{status:"sent"}`; system degrades client reliability.
**Postconditions:** Reminder logged; reliability adjusted.

#### UC-F15: Generate reports
**Maps:** F-22, F-23, F-24 · **Endpoints:** `GET /reports/annual-summary`, `POST /reports/annual-summary/pdf`, `GET /reports/client-profitability`, `GET /reports/platform-comparison`
**Flow:** User selects fiscal year/date range → views annual summary, client profitability, platform comparison; exports annual PDF (S3).
**Postconditions:** PDF available via presigned URL.

#### UC-F16: Invite an accountant
**Maps:** F-25 · **Endpoints:** `POST /accountants/invite`, `GET /accountants`, `DELETE /accountants/:id`
**Flow:**
1. User invites accountant by email → `POST /accountants/invite` (SES email or in-app token).
2. Later may revoke → `DELETE /accountants/:id`.
**Postconditions:** Pending invite; on acceptance accountant gets read-only scoped access.

---

### Accountant Use Cases

#### UC-A01: Accept invite & access account
**Maps:** F-25 · **Endpoints:** `POST /accountants/accept`, `GET /auth/me`
**Flow:**
1. Accountant opens invite link, sets name/password → `POST /accountants/accept` → tokens + User(role=accountant).
2. `GET /auth/me` returns linked `accounts: [{ accountId, freelancerName }]`.
3. Selects an account; all subsequent reads carry `X-Account-Id`.
**Postconditions:** Read-only session scoped to chosen freelancer.
**Alt Paths:** Invalid/expired token → `404`/`401`.

#### UC-A02: Review financials & export tax summary
**Maps:** F-22, F-11 · **Endpoints:** `GET /dashboard/summary`, `GET /tax/liability`, `GET /reports/annual-summary`, `POST /reports/annual-summary/pdf`
**Flow:** Accountant reviews dashboard, tax liability, annual summary for the scoped account; exports PDF for filing.
**Postconditions:** None (read). PDF generated.
**Alt Paths:** Any write attempt (POST/PATCH/PUT/DELETE) → `403 FORBIDDEN`.

---

### System Use Cases

#### UC-S01: Daily overdue aging recompute
**Maps:** F-20 · **Trigger:** node-cron daily.
**Flow:** For each `sent`/`partially_paid` invoice past dueDate, recompute `overdueDays`, `agingBucket`, set status `overdue`; update client overdueCount.
**Postconditions:** Aging fresh; feeds `GET /overdue` and cash flow.

#### UC-S02: Reliability score recompute
**Maps:** F-02 · **Trigger:** payment recorded, reminder marked sent, daily cron.
**Flow:** Recompute per-client `reliabilityScore` from on-time vs late payment ratio + current overdue aging; emit `reliability:updated`.
**Postconditions:** Score reflects latest behavior.

#### UC-S03: Danger-zone detection
**Maps:** F-19 · **Trigger:** payment change, daily cron.
**Flow:** Project balance over horizon; if any window dips below threshold, emit `cashflow:danger`.
**Postconditions:** Live alert to freelancer.

---

## Assumptions

### A1: Forex frozen at payment time
The exchange rate stored on a Payment is captured once and never recomputed. Reports and dashboards always use the frozen `forexRate`/`baseAmountMinor`. If wrong, historical totals would drift — implementation must NOT re-fetch rates for past payments.

### A2: Tax liability is computed on-read
`GET /tax/liability` recomputes from current payments + deductible expenses + active slabs each call. No materialized tax balance. If volume grew, this would need caching, but at single-user scale it is correct and simple.

### A3: Partial payments allowed; invoice closes when amountPaid ≥ total
Multiple Payment docs can reference one invoice. Status transitions: sent → partially_paid (0<paid<total) → paid (paid≥total). Overpayment closes invoice and records surplus.

### A4: Platform fee changes are not retroactive
Editing a platform's `feeConfig` affects only future payments. Existing Payment docs carry the fee computed at record time.

### A5: Accountant identity is global, access is scoped
One accountant User can be linked to N freelancer accounts. Every accountant read MUST send `X-Account-Id`; the server verifies an active link before scoping. Missing/invalid → `403`/`404`.

### A6: Base currency is fixed after first payment
Changing `baseCurrency` after payments exist would invalidate frozen conversions. UI should warn; server allows change only when zero payments exist (else `409 CONFLICT`).

### A7: Reminders track, never send (v1)
Reminder docs represent a tracked sequence. Marking `sent` records the freelancer's external action; the system does not deliver messages.

---

## Edge Cases

### E1: Forex provider down at payment time
**If** both frankfurter and exchangerate-api fail **and** no `forexRate` supplied → `424 FOREX_UNAVAILABLE`; client must prompt manual rate (UC-F07). Payment is NOT created until a rate exists. **Affects:** UC-F06.

### E2: Concurrent payments on same invoice
**If** two payments post near-simultaneously → server recomputes invoice totals atomically (transaction / `findOneAndUpdate` with recomputed sum from all payment docs, not incremental add) to avoid lost updates. **Affects:** UC-F06.

### E3: Payment deleted after invoice marked paid
**If** the only/largest payment is deleted → invoice recalculated from remaining payments; status reverts (paid→partially_paid/sent); tax recomputed. **Affects:** UC-F06, UC-F11.

### E4: Expense in non-base currency
**If** expense currency ≠ base → convert via forex at `incurredAt`; on forex failure require manual `forexRate` (same as payments). **Affects:** UC-F09.

### E5: Tax slabs with open-ended top band
**If** top slab `uptoMinor=null` → treated as infinite ceiling (applies to all income above previous band). Validation: exactly one `null` slab, must be last. **Affects:** UC-F10, UC-F11.

### E6: Accountant attempts a write
**If** role=accountant calls any non-GET (except `POST /reports/.../pdf` and `POST /accountants/accept`) → `403 FORBIDDEN`. **Affects:** all accountant UCs.

### E7: Cross-account access attempt
**If** a resource's `accountId` ≠ requester's scoped account → `404 NOT_FOUND` (never reveal existence). **Affects:** every scoped read/write.

### E8: Invoice voided after partial payment
**If** invoice has payments → cannot void (`409`); must delete payments first or leave as partially_paid. Only `draft`/`sent`-with-no-payments can void. **Affects:** UC-F05.

### E9: Danger-zone threshold not set
**If** `dangerZoneThresholdMinor` is 0/unset → no danger windows computed; timeline still returns balance points. **Affects:** UC-F13, UC-S03.

### E10: Expired access token mid-session
**If** access token expires → `401`; client transparently refreshes (UC-F02 step 2) and retries; if refresh also expired → force re-login. **Affects:** all authenticated UCs.

### E11: Fiscal year boundary
**If** a payment's `paidAt` falls in a different fiscal year than "current" → it counts toward that year's `GET /tax/liability?fiscalYear=` and annual summary, using `fiscalYearStartMonth`. **Affects:** UC-F11, UC-F15.
