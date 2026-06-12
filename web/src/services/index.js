/**
 * Service layer index.
 * Selects real or dummy implementations based on VITE_USE_DUMMY_DATA.
 * Anything other than the string "false" → dummy mode (default: true).
 *
 * Both implementations are statically imported and selected synchronously —
 * top-level await is not available in the build target (es2020).
 */

import { auth as dummyAuth } from './dummy/auth.js';
import { account as dummyAccount } from './dummy/account.js';
import { clients as dummyClients } from './dummy/clients.js';
import { invoices as dummyInvoices } from './dummy/invoices.js';
import { payments as dummyPayments } from './dummy/payments.js';
import { expenses as dummyExpenses } from './dummy/expenses.js';
import { platforms as dummyPlatforms } from './dummy/platforms.js';
import { tax as dummyTax } from './dummy/tax.js';
import { cashflow as dummyCashflow } from './dummy/cashflow.js';
import { reports as dummyReports } from './dummy/reports.js';
import { dashboard as dummyDashboard } from './dummy/dashboard.js';
import { overdue as dummyOverdue } from './dummy/overdue.js';
import { reminders as dummyReminders } from './dummy/reminders.js';
import { forex as dummyForex } from './dummy/forex.js';
import { accountants as dummyAccountants } from './dummy/accountants.js';

import { auth as apiAuth } from './api/auth.js';
import { account as apiAccount } from './api/account.js';
import { clients as apiClients } from './api/clients.js';
import { invoices as apiInvoices } from './api/invoices.js';
import { payments as apiPayments } from './api/payments.js';
import { expenses as apiExpenses } from './api/expenses.js';
import { platforms as apiPlatforms } from './api/platforms.js';
import { tax as apiTax } from './api/tax.js';
import { cashflow as apiCashflow } from './api/cashflow.js';
import { reports as apiReports } from './api/reports.js';
import { dashboard as apiDashboard } from './api/dashboard.js';
import { overdue as apiOverdue } from './api/overdue.js';
import { reminders as apiReminders } from './api/reminders.js';
import { forex as apiForex } from './api/forex.js';
import { accountants as apiAccountants } from './api/accountants.js';

export const isDummyMode = import.meta.env.VITE_USE_DUMMY_DATA !== 'false';

export const auth = isDummyMode ? dummyAuth : apiAuth;
export const account = isDummyMode ? dummyAccount : apiAccount;
export const clients = isDummyMode ? dummyClients : apiClients;
export const invoices = isDummyMode ? dummyInvoices : apiInvoices;
export const payments = isDummyMode ? dummyPayments : apiPayments;
export const expenses = isDummyMode ? dummyExpenses : apiExpenses;
export const platforms = isDummyMode ? dummyPlatforms : apiPlatforms;
export const tax = isDummyMode ? dummyTax : apiTax;
export const cashflow = isDummyMode ? dummyCashflow : apiCashflow;
export const reports = isDummyMode ? dummyReports : apiReports;
export const dashboard = isDummyMode ? dummyDashboard : apiDashboard;
export const overdue = isDummyMode ? dummyOverdue : apiOverdue;
export const reminders = isDummyMode ? dummyReminders : apiReminders;
export const forex = isDummyMode ? dummyForex : apiForex;
export const accountants = isDummyMode ? dummyAccountants : apiAccountants;
