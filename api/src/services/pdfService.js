import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

// Lazy-load pdfkit to keep module loading optional
async function getPDFKit() {
  const { default: PDFDocument } = await import('pdfkit');
  return PDFDocument;
}

/**
 * Generate a PDF invoice.
 * @param {object} invoice
 * @param {object} client
 * @param {object} account
 * @returns {Promise<string>} file URL/path
 */
export async function generateInvoicePdf(invoice, client, account) {
  const PDFDocument = await getPDFKit();
  const dir = join(tmpdir(), 'freelanceos');
  try { mkdirSync(dir, { recursive: true }); } catch (_) {}
  const filename = `invoice-${invoice.number || uuidv4()}.pdf`;
  const filePath = join(dir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24).text('INVOICE', { align: 'right' });
    doc.fontSize(12).text(`Invoice #: ${invoice.number}`, { align: 'right' });
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, { align: 'right' });
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Client info
    doc.fontSize(14).text('Bill To:', { underline: true });
    doc.fontSize(12).text(client.name);
    if (client.company) doc.text(client.company);
    if (client.email) doc.text(client.email);
    doc.moveDown();

    // Line items
    doc.fontSize(14).text('Line Items:', { underline: true });
    doc.moveDown(0.5);
    for (const item of invoice.lineItems || []) {
      const amount = (item.amountMinor / 100).toFixed(2);
      doc.fontSize(11).text(`${item.description} — Qty: ${item.quantity} × ${(item.unitPriceMinor / 100).toFixed(2)} = ${invoice.currency} ${amount}`);
    }
    doc.moveDown();

    // Totals
    doc.fontSize(12).text(`Subtotal: ${invoice.currency} ${(invoice.subtotalMinor / 100).toFixed(2)}`, { align: 'right' });
    if (invoice.taxOnInvoiceMinor) {
      doc.text(`Tax: ${invoice.currency} ${(invoice.taxOnInvoiceMinor / 100).toFixed(2)}`, { align: 'right' });
    }
    doc.fontSize(14).text(`Total: ${invoice.currency} ${(invoice.totalMinor / 100).toFixed(2)}`, { align: 'right' });
    doc.fontSize(12).text(`Amount Due: ${invoice.currency} ${(invoice.amountDueMinor / 100).toFixed(2)}`, { align: 'right' });

    if (invoice.notes) {
      doc.moveDown();
      doc.fontSize(11).text(`Notes: ${invoice.notes}`);
    }

    doc.end();

    stream.on('finish', () => resolve(`file://${filePath}`));
    stream.on('error', reject);
  });
}

/**
 * Generate a PDF annual summary report.
 * @param {object} summary
 * @param {object} account
 * @returns {Promise<string>} file URL/path
 */
export async function generateReportPdf(summary, account) {
  const PDFDocument = await getPDFKit();
  const dir = join(tmpdir(), 'freelanceos');
  try { mkdirSync(dir, { recursive: true }); } catch (_) {}
  const filename = `report-${summary.fiscalYear || uuidv4()}.pdf`;
  const filePath = join(dir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(22).text(`FreelanceOS Annual Summary — FY ${summary.fiscalYear}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('Income Summary', { underline: true });
    doc.fontSize(12).text(`Gross Income: ${account.baseCurrency} ${((summary.grossIncomeBaseMinor || 0) / 100).toFixed(2)}`);
    doc.text(`Platform Fees: ${account.baseCurrency} ${((summary.platformFeesBaseMinor || 0) / 100).toFixed(2)}`);
    doc.text(`Net Income: ${account.baseCurrency} ${((summary.netIncomeBaseMinor || 0) / 100).toFixed(2)}`);
    doc.moveDown();

    doc.fontSize(14).text('Tax Summary', { underline: true });
    doc.fontSize(12).text(`Deductible Expenses: ${account.baseCurrency} ${((summary.deductibleExpensesBaseMinor || 0) / 100).toFixed(2)}`);
    doc.text(`Taxable Income: ${account.baseCurrency} ${((summary.taxableIncomeBaseMinor || 0) / 100).toFixed(2)}`);
    doc.text(`Estimated Tax: ${account.baseCurrency} ${((summary.estimatedTaxMinor || 0) / 100).toFixed(2)}`);
    doc.text(`Effective Rate: ${(summary.effectiveRate || 0).toFixed(2)}%`);

    doc.end();

    stream.on('finish', () => resolve(`file://${filePath}`));
    stream.on('error', reject);
  });
}
