const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INVOICES_FILE = path.join(ROOT, '.tmp', 'invoices.json');
const OUT_DIR = path.join(ROOT, 'output');

const GOLD = '#C9A84C';
const BLACK = '#1A1A1A';
const GRAY = '#888888';
const LIGHT = '#F8F8F8';
const BORDER = '#E0E0E0';
const PAID_BG = '#E8F5E9'; const PAID_FG = '#2E7D32';
const UNPAID_BG = '#FFF8E1'; const UNPAID_FG = '#E65100';
const OVERDUE_BG = '#FDECEA'; const OVERDUE_FG = '#C62828';

function statusStyle(status) {
  if (status === 'paid')    return { bg: PAID_BG,    fg: PAID_FG,    label: 'PAID' };
  if (status === 'overdue') return { bg: OVERDUE_BG, fg: OVERDUE_FG, label: 'OVERDUE' };
  return                           { bg: UNPAID_BG,  fg: UNPAID_FG,  label: 'UNPAID' };
}

function fmt(amount, currency) {
  return `${currency} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function generatePDF(inv) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: inv.invoice_number } });
    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - 100; // usable width
    const L = 50; // left margin

    // ── Header ──────────────────────────────────────────────
    doc.font('Helvetica-Bold').fontSize(22).fillColor(GOLD).text('NEXA CONSULTING', L, 50);
    doc.font('Helvetica').fontSize(9).fillColor(GRAY).text('Agentic Workflow Agency', L, 76);

    const sc = statusStyle(inv.status);
    // Status badge (top right)
    const badgeW = 70; const badgeH = 20;
    const badgeX = L + W - badgeW; const badgeY = 50;
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4).fill(sc.bg);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(sc.fg)
       .text(sc.label, badgeX, badgeY + 6, { width: badgeW, align: 'center' });

    // Invoice number + label
    doc.font('Helvetica').fontSize(9).fillColor(GRAY).text('INVOICE', L + W - 180, 50, { width: 100, align: 'right' });
    doc.font('Helvetica-Bold').fontSize(14).fillColor(GOLD)
       .text(inv.invoice_number, L + W - 180, 62, { width: 100, align: 'right' });

    // Gold separator line
    doc.moveTo(L, 100).lineTo(L + W, 100).lineWidth(1.5).strokeColor(GOLD).stroke();

    // ── Dates row ────────────────────────────────────────────
    let y = 115;
    const col = W / 3;
    const dateFields = [
      ['ISSUE DATE', fmtDate(inv.issue_date)],
      ['DUE DATE',   fmtDate(inv.due_date)],
      inv.paid_date ? ['PAID ON', fmtDate(inv.paid_date)] : null,
    ].filter(Boolean);

    dateFields.forEach(([label, value], i) => {
      const x = L + i * col;
      doc.font('Helvetica').fontSize(8).fillColor(GRAY).text(label, x, y);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(BLACK).text(value, x, y + 12);
    });

    // ── Bill To ──────────────────────────────────────────────
    y = 170;
    doc.roundedRect(L, y, W, 56, 6).fill(LIGHT);
    doc.rect(L, y, W, 56).lineWidth(0.5).strokeColor(BORDER).stroke();
    doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD).text('BILL TO', L + 14, y + 10);
    doc.font('Helvetica-Bold').fontSize(13).fillColor(BLACK).text(inv.client_company, L + 14, y + 22);
    doc.font('Helvetica').fontSize(9).fillColor(GRAY)
       .text(`${inv.client_contact}  ·  ${inv.client_email}  ·  ${inv.client_region}`, L + 14, y + 38);

    // ── Line items header ────────────────────────────────────
    y = 248;
    doc.font('Helvetica').fontSize(8).fillColor(GRAY);
    doc.text('DESCRIPTION', L, y);
    doc.text('QTY', L + W - 160, y, { width: 60, align: 'right' });
    doc.text('AMOUNT', L + W - 80, y, { width: 80, align: 'right' });
    doc.moveTo(L, y + 14).lineTo(L + W, y + 14).lineWidth(0.5).strokeColor(BORDER).stroke();

    // Main line item
    y += 22;
    doc.font('Helvetica-Bold').fontSize(12).fillColor(BLACK).text(inv.description, L, y);
    doc.font('Helvetica').fontSize(11).fillColor(GRAY).text('1', L + W - 160, y, { width: 60, align: 'right' });
    doc.font('Helvetica').fontSize(11).fillColor(BLACK).text(fmt(inv.subtotal, inv.currency), L + W - 80, y, { width: 80, align: 'right' });
    doc.moveTo(L, y + 20).lineTo(L + W, y + 20).lineWidth(0.5).strokeColor('#EEEEEE').stroke();

    // VAT line (if applicable)
    if (inv.vat_pct > 0) {
      y += 28;
      doc.font('Helvetica').fontSize(10).fillColor(GRAY).text(`VAT (${inv.vat_pct}%)`, L, y);
      doc.text(fmt(inv.total - inv.subtotal, inv.currency), L + W - 80, y, { width: 80, align: 'right' });
      doc.moveTo(L, y + 18).lineTo(L + W, y + 18).lineWidth(0.5).strokeColor('#EEEEEE').stroke();
      y += 18;
    } else {
      y += 20;
    }

    // ── Totals box ───────────────────────────────────────────
    y += 16;
    const boxW = 240; const boxX = L + W - boxW;
    doc.roundedRect(boxX, y, boxW, inv.paid_date ? 92 : 72, 6).fill(LIGHT);
    doc.rect(boxX, y, boxW, inv.paid_date ? 92 : 72).lineWidth(0.5).strokeColor(BORDER).stroke();

    const bL = boxX + 16; const bR = boxX + boxW - 16;
    let by = y + 14;

    // Subtotal row
    doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('Subtotal', bL, by);
    doc.text(fmt(inv.subtotal, inv.currency), bL, by, { width: boxW - 32, align: 'right' });

    if (inv.vat_pct > 0) {
      by += 18;
      doc.text(`VAT (${inv.vat_pct}%)`, bL, by);
      doc.text(fmt(inv.total - inv.subtotal, inv.currency), bL, by, { width: boxW - 32, align: 'right' });
    }

    // Divider
    by += 18;
    doc.moveTo(bL, by).lineTo(bR, by).lineWidth(0.5).strokeColor(BORDER).stroke();

    // Total due
    by += 8;
    doc.font('Helvetica-Bold').fontSize(13).fillColor(GOLD).text('Total Due', bL, by);
    doc.text(fmt(inv.total, inv.currency), bL, by, { width: boxW - 32, align: 'right' });

    // Paid confirmation
    if (inv.paid_date) {
      by += 22;
      doc.font('Helvetica').fontSize(9).fillColor(PAID_FG)
         .text(`✓ Payment received ${fmtDate(inv.paid_date)}`, bL, by, { width: boxW - 32, align: 'right' });
    }

    // ── Footer ───────────────────────────────────────────────
    const footerY = doc.page.height - 60;
    doc.moveTo(L, footerY).lineTo(L + W, footerY).lineWidth(0.5).strokeColor(BORDER).stroke();
    doc.font('Helvetica').fontSize(9).fillColor(GRAY)
       .text('NEXA CONSULTING  ·  ikya.build@gmail.com  ·  Thank you for your business.', L, footerY + 10);
    doc.font('Helvetica').fontSize(9).fillColor(GOLD)
       .text(inv.invoice_number, L, footerY + 10, { width: W, align: 'right' });

    // PAID watermark — diagonal, centre of page, paid invoices only
    if (inv.status === 'paid') {
      const cx = doc.page.width / 2;
      const cy = doc.page.height / 2;
      doc.save();
      doc.fillColor('#2E7D32').fillOpacity(0.10);
      doc.fontSize(100).font('Helvetica-Bold');
      doc.rotate(-45, { origin: [cx, cy] });
      doc.text('PAID', cx - 150, cy - 55, { width: 300, align: 'center' });
      doc.restore();
    }

    doc.end();
  });
}

async function main() {
  const invoices = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf8'));

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const inv of invoices) {
    const pdfBuf = await generatePDF(inv);
    const pdfPath = path.join(OUT_DIR, `${inv.invoice_number}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuf);
    const tag = inv.status === 'paid' ? ' [PAID ✓]' : inv.status === 'overdue' ? ' [OVERDUE]' : ' [UNPAID]';
    console.log(`✓ ${inv.invoice_number}${tag}`);
  }

  console.log(`\nDone. ${invoices.length} PDFs in output/`);
}

main().catch(err => { console.error(err); process.exit(1); });
