# Skill: Weekly Prioritisation

**Trigger:** Any request to plan, prioritise, or organise the week.
**Output:** A prioritised weekly plan saved as a Google Doc in Drive.

---

## What This Skill Does

Reads Gmail, Google Calendar, and the Tasks List Google Sheet, then applies the Revenue Impact × Urgency framework — filtered through intel/focus.md and intel/wins.md — to produce a clear, actionable weekly plan with time blocks.

---

## Framework: Revenue Impact × Urgency

Every task is scored on two axes:

**Revenue Impact** — How directly does this task move money?
- 3 — Closes or unblocks a deal (overdue deliverable, ready-to-sign client, live quote expiring)
- 2 — Advances pipeline (new lead call, follow-up, proposal)
- 1 — Keeps the business running (admin, internal, long-horizon project)

**Urgency** — What happens if this slips by one day?
- 3 — Client relationship damaged, deal dies, or deadline missed
- 2 — Pipeline cools, momentum lost
- 1 — No immediate consequence

**Priority Tier = Revenue Impact + Urgency score:**
- 6 → Critical
- 4–5 → High
- 2–3 → Medium
- 1 → Low

---

## Execution Steps

### Step 1 — Read strategic context
Read `intel/focus.md` and `intel/wins.md`. Extract:
- Current top priorities
- Hard deadlines this quarter
- Active projects and their status

### Step 2 — Read all three sources in parallel

**Gmail:** Search `in:inbox` — extract every email requiring action (reply, reschedule, deliverable, follow-up). Note sender, company, urgency signal, and any money amounts mentioned.

**Google Calendar:** Fetch events for the current week (Mon–Sun). Note all blocked time — calls, meetings, deadlines.

**Tasks List (Google Sheet ID: 1tWE5UyMu0Sk5GjWtb6Cw9V_WLgM4SO_cOBHvC5Gc_T4):** Get all rows. Note status (Overdue = automatic Critical bump), priority, and due date.

### Step 3 — Score and tier every task

Apply the Revenue Impact × Urgency framework. Use focus.md to break ties — whichever task better serves the current top priority wins.

Rules:
- Overdue deliverables → auto-Critical regardless of score (damaged client relationship)
- Deals with named amounts ready to close → auto-Critical
- Booked calls → auto-High (prep must happen before the call)
- Internal/project work with >5 days until deadline → auto-Low this week

### Step 4 — Build the weekly plan

Structure:
1. **Critical** — list with reason why, deadline
2. **High** — list with reason, deadline
3. **Medium** — list with reason, deadline
4. **Low** — list with deadline, note "don't touch until [date]"
5. **Day-by-day schedule** — time blocks, respecting booked calendar slots
6. **Priority stack summary** — count per tier, logic in one line

### Step 5 — Save to Google Drive

Create a Google Doc titled: `Weekly Plan — [date range] (Prioritised)`
Content: the full plan as formatted text.
Report the doc link.

### Step 6 — Flag to user

After saving, call out:
- Any overdue items
- Any deals at immediate risk
- What NOT to work on this week (and why)

---

## Guardrails

- Never schedule project/build work on days with 2+ client calls — protect deep work
- Flag if Critical tier has more than 5 items — that's a capacity problem, not a priority problem
- If focus.md hasn't been updated in 14+ days, flag it: "Focus file is X days old — still current?"
- Don't re-prioritise tasks that are already marked Done or Cancelled in the sheet

---

## Example Output Structure

```
Weekly Plan — [Mon] to [Fri] [Month] [Year]
Prioritised by Revenue Impact × Urgency | Lens: [top priority from focus.md]

CRITICAL (n tasks)
...

HIGH (n tasks)
...

MEDIUM (n tasks)
...

LOW — don't touch until [date] (n tasks)
...

Day-by-day schedule
[Mon]: ...
[Tue]: ...
...

Priority stack: n Critical / n High / n Medium / n Low
```
