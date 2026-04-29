# Blueprint: Client Communication

**Goal:** Handle any client email — inbound or outbound — draft it, show it for review, push it to Gmail Drafts. Never send directly.

---

## Equipment Dependencies

| Script | Job | Status |
|--------|-----|--------|
| `equipment/fetch-email.py` | Fetches email from Gmail inbox by sender/subject/unread | Pending build |
| `equipment/create-draft.py` | Creates a Gmail Draft from the finished email | Pending build |

Until these are built: draft in conversation only. Ikram copies manually into Gmail.

---

## Mode 1 — Inbound (Replying to a Client)

### Inputs to collect
- How to find the email: sender name/address, subject, or "latest unread from [name]"
- Any specific points to address in the reply
- Tone notes (if the situation is sensitive)

### Sequence
1. Call `equipment/fetch-email.py` with the search criteria
   - Output: `.tmp/inbound-email.json` with sender, subject, body, thread_id
   - Fallback: if credentials not set up, ask Ikram to paste the email text
2. Read the email — identify the client's intent (question / request / chaser / complaint / other)
3. If it matches a FAQ in `templates/client-emails/faq-replies.md`, use that as the starting point
4. Draft a reply — answer the intent fully, move things forward, close with a clear next step
5. Show the draft in conversation
6. Offer one round of refinements
7. Call `equipment/create-draft.py` with to, subject, body, and thread_id (to thread the reply correctly)
8. Report: "Draft saved to Gmail — open it, review, and hit send."

---

## Mode 2 — Outbound (Proactive Email)

### Scenario types
| Scenario | When to use |
|----------|------------|
| Follow-up | Prospect or client hasn't responded — circle back |
| Status update | Proactively updating a client on project progress |
| Proposal send | Sending a quote or proposal to a prospect |
| Onboarding welcome | First email to a new client after they sign |
| Delay notification | Informing a client of a delay or issue |
| Other | Any other outbound that doesn't fit the above |

### Inputs to collect
- Recipient: name, company, email address
- Scenario type (or describe the situation and let the Architect identify it)
- Context: what's the current situation, what should they do after reading this
- Any specific points to include
- Deadline or time sensitivity (if any)

### Sequence
1. Identify scenario type
2. Collect any missing inputs — stop if anything critical is absent
3. Check `templates/client-emails/` for the relevant template as a starting point
4. Draft the email — professional but warm, no jargon, no filler, signed as Ikram / NEXA Consulting
5. Show the draft in conversation
6. Offer one round of refinements
7. Call `equipment/create-draft.py` with to, subject, body
8. Report: "Draft saved to Gmail — open it, review, and hit send."

---

## Voice Rules (apply to every draft)

- Professional but warm — write like a person, not a brand
- No tech jargon, no filler, no padding
- Subject line: specific and human, not generic
- Sign off as: Ikram, NEXA Consulting
- One clear ask or next step per email — never leave the reader unsure what to do

---

## Failure Handling

| Problem | Action |
|---------|--------|
| Email not found in inbox | Report what was searched, ask Ikram to confirm details or paste the email |
| Gmail credentials not set up | Draft in conversation — Ikram copies to Gmail manually |
| `create-draft.py` errors | Report the error, show the draft in conversation so nothing is lost |
| Missing inputs | Stop and list exactly what's needed before continuing |

---

## Standing Restriction

Never send an email. The Equipment only creates drafts. Sending is always Ikram's action.
