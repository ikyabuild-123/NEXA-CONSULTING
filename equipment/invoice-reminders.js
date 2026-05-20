const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INVOICES_FILE = path.join(ROOT, 'data', 'invoices.json');
const OUTPUT_FILE = path.join(ROOT, '.tmp', 'reminder-queue.json');

const daysArg = process.argv.indexOf('--days');
const THRESHOLD = daysArg !== -1 ? parseInt(process.argv[daysArg + 1], 10) : 14;

function daysSince(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function daysPastDue(dueDateStr) {
  const d = new Date(dueDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function fmtAmount(amount, currency) {
  return `${currency} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function fmtDate(str) {
  return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function buildEmail(inv, dsi, dpd) {
  const firstName = inv.client_contact.split(' ')[0];
  const amount = fmtAmount(inv.total, inv.currency);
  const dueDate = fmtDate(inv.due_date);

  let subject, body;

  if (dpd <= 7) {
    subject = `Payment reminder — ${inv.invoice_number}`;
    body = `Hi ${firstName},

I hope you're well. Just a quick note to flag that invoice ${inv.invoice_number} for ${amount} was due on ${dueDate} — it looks like it may not have come through yet.

Could you take a look when you get a chance? If you have any questions or need anything from my side, just let me know.

Happy to resend the invoice if helpful.

Thanks,
Ikram
NEXA Consulting`;
  } else if (dpd <= 30) {
    subject = `Outstanding payment — ${inv.invoice_number}`;
    body = `Hi ${firstName},

Following up on invoice ${inv.invoice_number} for ${amount}, which was due on ${dueDate} and is now ${dpd} days outstanding.

Could you let me know when we can expect payment, or flag if there's anything blocking it on your end? Happy to sort anything quickly.

Thanks,
Ikram
NEXA Consulting`;
  } else {
    subject = `Overdue invoice — ${inv.invoice_number} (${dpd} days outstanding)`;
    body = `Hi ${firstName},

I'm following up again on invoice ${inv.invoice_number} for ${amount}, which was due on ${dueDate} and is now ${dpd} days overdue.

I'd appreciate you prioritising this. Please confirm a payment date, or let me know if there's something we need to discuss. I'd like to get this resolved without further delay.

If payment has already been sent, please share the reference and I'll update our records.

Thanks,
Ikram
NEXA Consulting`;
  }

  return {
    invoice_number: inv.invoice_number,
    client_name: inv.client_company,
    client_contact: inv.client_contact,
    to: inv.client_email,
    subject,
    body,
    amount: inv.total,
    currency: inv.currency,
    amount_formatted: amount,
    issue_date: inv.issue_date,
    due_date: inv.due_date,
    days_since_issue: dsi,
    days_past_due: dpd,
    status: inv.status
  };
}

const invoices = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf8'));

const queue = invoices
  .filter(inv => {
    if (inv.status === 'paid') return false;
    return daysSince(inv.issue_date) >= THRESHOLD;
  })
  .map(inv => buildEmail(inv, daysSince(inv.issue_date), daysPastDue(inv.due_date)));

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(queue, null, 2), 'utf8');

console.log(`\nInvoice reminder check complete`);
console.log(`Threshold: ${THRESHOLD}+ days since issue date`);
console.log(`Qualifying invoices: ${queue.length}`);
queue.forEach(r => {
  console.log(`  ${r.invoice_number} — ${r.client_name} — ${r.amount_formatted} — ${r.days_past_due} days past due`);
});
console.log(`\nOutput: .tmp/reminder-queue.json`);
