# Blueprint: Invoice Payment Reminders

**Goal:** Identify unpaid invoices past a configurable age threshold, generate personalised reminder emails, and push them to Gmail Drafts for review before sending.

Run this any time you want to chase outstanding payments.

---

## Equipment

| Script | Job | Status |
|--------|-----|--------|
| `equipment/invoice-reminders.js` | Reads invoices, filters overdue, outputs email drafts | Active |

**Source data:** `.tmp/invoices.json`
**Output:** `.tmp/reminder-queue.json`

---

## When to Run

- Weekly — every Monday morning as part of the weekly review
- Any time a client is late on payment
- Before issuing a new invoice to a client with outstanding balance

---

## Invocation

```bash
node equipment/invoice-reminders.js           # default: 14-day threshold
node equipment/invoice-reminders.js --days 7  # chase anything 7+ days old
node equipment/invoice-reminders.js --days 30 # only long-overdue invoices
```

---

## Sequence

1. Run the script — it filters `.tmp/invoices.json` for unpaid invoices past the threshold
2. Script outputs `.tmp/reminder-queue.json` with all email drafts
3. Claude reads the queue and displays each draft in conversation
4. Review the drafts — request any edits if needed
5. Confirm approval — Claude pushes all drafts to Gmail via Zapier (`Gmail: Create Draft`)
6. Open Gmail Drafts — review once more, then send

---

## Tone Ladder (built into the script)

| Days past due | Tone |
|---|---|
| 0–7 days | Gentle nudge — "it may not have come through yet" |
| 8–30 days | Direct — asks for confirmation or flags any blocker |
| 30+ days | Firm — requests payment date, still professional |

---

## Filtering Logic

An invoice qualifies if:
- `status` is `unpaid` or `overdue` (not `paid`)
- Days since `issue_date` ≥ threshold (default 14)

Note: NEXA-INV-2026-015 (Beirut Digital, issued May 13) is a known edge case — issue date = due date, so it shows as overdue immediately. It will enter the queue at the 14-day mark (May 27).

---

## Zapier Integration

Gmail is already enabled. Action key: `draft_v2` (Create Draft).
No setup needed — just run the sequence above.

If Zapier throws an error: display drafts in conversation and Ikram copies to Gmail manually.

---

## Standing Restriction

Never send emails directly. Drafts only — sending is always Ikram's action.
