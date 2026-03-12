# Renewal Uplift Planner — Project Constitution

> **This file is LAW.** Update only when schemas change, rules are added, or architecture is modified.

---

## North Star

Capture LTR owners with leases coming due, show them a concrete renew-vs-turn plan with timing and rent-change guidance, and convert that urgency into a booked call or onboarding start with Hearth.

- **Primary KPI:** Booked renewal/switch call or onboarding click
- **Secondary KPI:** Qualified lead captured in Close with lease timing, current rent, and renewal urgency
- **Tertiary KPI:** High-intent leads flagged for immediate follow-up when lease end is near

**One-liner:** Renewal Uplift Planner should turn an owner with an upcoming lease expiration into a high-intent Hearth lead by showing a credible renew-vs-turn plan, a recommended renewal range, and a 90/60/30 action calendar that makes delay feel costly and Hearth feel like the obvious operator.

---

## Integrations

### Required
- **Close CRM** — lead capture (source of truth for lead records)
- **Discord** — internal lead notifications (fire-and-forget)
- **Vercel** — hosting + serverless API routes
- **Squarespace DNS** — subdomain CNAME for `renewal.hearthproperty.com`
- **GitHub** — repo + deploy workflow
- **PDF generation** — branded renewal plan (puppeteer-core + @sparticuz/chromium-min) — v1 requirement

### Optional (v1.1+)
- Analytics (PostHog, GA4)
- Email automation (transactional follow-up via Close sequences)

### Not Needed for v1
- AppFolio, Slack, Google Sheets, standalone database
- Email automation (can follow up inside Close)

### Credentials Required
- `CLOSE_API_KEY`
- `CLOSE_LEAD_STATUS_ID`
- `CLOSE_CF_PROPERTY_ADDRESS`
- `CLOSE_CF_ASKING_RENT` (repurposed for current rent)
- `CLOSE_CF_DAYS_ON_MARKET` (repurposed for days until lease end)
- `CLOSE_CF_URGENCY_SCORE`
- `CLOSE_CF_AUDIT_SUMMARY` (repurposed for renewal plan summary)
- `CLOSE_CF_LEAD_SOURCE`
- `DISCORD_WEBHOOK_URL`
- `NEXT_PUBLIC_SITE_URL` — `https://renewal.hearthproperty.com`

---

## Source of Truth

| Data | Owner |
|------|-------|
| Lead/contact metadata | Close CRM |
| Notification stream | Discord |
| Form submission payload | In-memory / server-side request |
| Scoring logic / rules | Hardcoded config in codebase |
| Renewal range / comparison / calendar | Deterministic formulas in codebase |

No standalone database in v1.

---

## Delivery Payload

### To the Prospect (In-Browser)
- Recommended renewal range
- Turn-vs-renew comparison
- 90/60/30 renewal calendar
- Top risk / top opportunity summary
- "What you should do now" section
- "What Hearth would handle for you" section
- CTA: Book a Renewal Strategy Call / Let Hearth Handle This Renewal
- Downloadable PDF of the renewal plan

### To Close CRM
| Field | Value |
|-------|-------|
| Lead name | `Renewal Lead: {ownerName} — {propertyAddress}` |
| Contact | name, email, phone |
| `CLOSE_CF_PROPERTY_ADDRESS` | property address |
| `CLOSE_CF_ASKING_RENT` | current rent (repurposed) |
| `CLOSE_CF_DAYS_ON_MARKET` | days until lease end (repurposed) |
| `CLOSE_CF_URGENCY_SCORE` | lead score + classification |
| `CLOSE_CF_AUDIT_SUMMARY` | renewal plan summary string |
| `CLOSE_CF_LEAD_SOURCE` | "Renewal Uplift Planner" |

### To Discord
Embed with: Lead Magnet, Owner, Property Address, Current Rent, Lease End Date, Management Situation, Score, Primary Problem, Result URL.

---

## Data Schema

### Form Input (client → server)

```json
{
  "ownerName": "string",
  "email": "string",
  "phone": "string",
  "propertyAddress": "string",
  "currentRent": "number",
  "leaseEndDate": "string (YYYY-MM-DD)",
  "tenantTenure": "string (< 1 year | 1-2 years | 2-3 years | 3+ years)",
  "lastRentIncrease": "string (< 6 months | 6-12 months | 12-18 months | 18+ months | never)",
  "recentLatePayments": "boolean",
  "recentMaintenanceIssues": "boolean",
  "managementSituation": "string (self-managed | have_pm)",
  "targetOutcome": "string (renew | unsure | replace)"
}
```

### Scoring Output

```json
{
  "leadScore": "number (0-95)",
  "maxScore": 95,
  "scoreClassification": "low | moderate | high | immediate",
  "breakdown": [
    {
      "signal": "string",
      "points": "number",
      "triggered": "boolean"
    }
  ],
  "primaryProblem": "string"
}
```

### Renewal Range Output

```json
{
  "currentRent": "number",
  "suggestedLow": "number",
  "suggestedHigh": "number",
  "suggestedIncreasePercent": { "low": "number", "high": "number" },
  "rationale": "string",
  "riskLevel": "string (conservative | moderate | aggressive)"
}
```

### Turn-vs-Renew Comparison Output

```json
{
  "renewScenario": {
    "label": "Renew with Increase",
    "projectedAnnualRent": "number",
    "estimatedVacancyCost": 0,
    "estimatedTurnoverCost": 0,
    "netAnnualOutcome": "number",
    "pros": ["string"],
    "cons": ["string"]
  },
  "turnScenario": {
    "label": "Turn the Unit",
    "projectedAnnualRent": "number",
    "estimatedVacancyCost": "number",
    "estimatedTurnoverCost": "number",
    "netAnnualOutcome": "number",
    "pros": ["string"],
    "cons": ["string"]
  },
  "recommendation": "renew | turn | depends",
  "summary": "string"
}
```

### 90/60/30 Renewal Calendar Output

```json
{
  "leaseEndDate": "string (YYYY-MM-DD)",
  "milestones": [
    {
      "daysOut": 90,
      "targetDate": "string (YYYY-MM-DD)",
      "label": "string",
      "actions": ["string"],
      "status": "upcoming | due | overdue"
    },
    {
      "daysOut": 60,
      "targetDate": "string (YYYY-MM-DD)",
      "label": "string",
      "actions": ["string"],
      "status": "upcoming | due | overdue"
    },
    {
      "daysOut": 30,
      "targetDate": "string (YYYY-MM-DD)",
      "label": "string",
      "actions": ["string"],
      "status": "upcoming | due | overdue"
    }
  ]
}
```

### Full API Response (server → client)

```json
{
  "success": "boolean",
  "score": "ScoreResult",
  "renewalRange": "RenewalRange",
  "comparison": "TurnVsRenewComparison",
  "calendar": "RenewalCalendar",
  "whatToDoNow": ["string"],
  "whatHearthHandles": ["string"],
  "closeLeadId": "string (optional)",
  "resultUrl": "string"
}
```

---

## Scoring Logic (Deterministic)

| Signal | Points | Rationale |
|--------|--------|-----------|
| Lease ends within 120 days | +25 | Core urgency signal — time trigger |
| Lease ends within 60 days | +15 extra | Compounding urgency — options narrow fast |
| No rent increase in 12+ months | +20 | Under-market risk — money left on the table |
| Owner unsure about outcome | +15 | Indecision = strong sales opportunity |
| Self-managed | +10 | No PM means no renewal workflow in place |
| Issue history present (late payments or maintenance) | +10 | Tenant quality uncertainty |

**Max possible: 95** (all signals fire, 120-day + 60-day stack)

Classification:
- 0–24: Low urgency
- 25–49: Moderate
- 50–74: High intent
- 75+: Immediate sales follow-up

### Primary Problem Detection (Auto-Derived)
Based on triggered signals, assign one primary problem:
1. **Renewal timing risk** — lease within 120 days
2. **Under-market rent** — no rent increase in 12+ months
3. **Owner indecision** — target outcome is "unsure"
4. **Turn risk** — target outcome is "replace" or issues present
5. **Tenant quality uncertainty** — late payments or maintenance issues present

Priority: timing risk > under-market > indecision > turn risk > tenant quality

---

## Renewal Range Formula

The renewal range is a **suggested percentage increase** based on input signals. This is NOT market comp data — it is directional guidance.

```
Base increase: 3-5% (default conservative band)

Adjustments:
+ If no increase in 12-18 months: widen to 4-7%
+ If no increase in 18+ months or never: widen to 5-10%
- If recent late payments: reduce upper bound by 1%
- If recent maintenance issues: reduce upper bound by 1%
- If tenant tenure 3+ years: reduce upper bound by 1% (retention value)
+ If tenant tenure < 1 year: increase lower bound by 1% (less retention leverage)
```

**Disclaimer:** "This is directional guidance, not a market rent estimate. Final rent should reflect local comps and market conditions."

---

## Turn-vs-Renew Comparison Formula

```
RENEW scenario:
  Annual rent = suggestedRent × 12
  Vacancy cost = $0
  Turnover cost = $0
  Net annual = Annual rent

TURN scenario:
  Annual rent = (suggestedHigh + 5%) × (12 - vacancyMonths)
  Vacancy cost = currentRent × vacancyMonths
  Turnover cost = estimated at 1× monthly rent (cleaning, repairs, re-leasing)
  Net annual = Annual rent - Vacancy cost - Turnover cost

Vacancy estimate:
  Default: 1.5 months
  Self-managed: 2 months
  Have PM: 1 month

Recommendation:
  If RENEW net > TURN net: recommend renew
  If TURN net > RENEW net by >10%: recommend turn
  Otherwise: recommend "depends" with context
```

---

## 90/60/30 Calendar Logic

Based on `leaseEndDate`, calculate milestone dates by subtracting days.

### 90 Days Out — "Decide & Prepare"
- [ ] Evaluate tenant quality (payment history, maintenance record)
- [ ] Decide: renew with increase or begin turn planning
- [ ] Pull market comps to inform rent target
- [ ] Review lease terms for renewal/notice requirements

### 60 Days Out — "Communicate & Offer"
- [ ] Send formal renewal offer with proposed rent
- [ ] If turning: begin vendor scheduling (cleaning, paint, repairs)
- [ ] Set a response deadline for tenant (14 days recommended)
- [ ] Prepare backup plan (listing, pricing, move-out coordination)

### 30 Days Out — "Execute"
- [ ] Confirm signed renewal OR begin turn process
- [ ] If renewed: update lease, file documentation
- [ ] If turning: coordinate move-out, schedule make-ready, list unit
- [ ] Ensure no gap in coverage

Status logic:
- `overdue` if today > targetDate
- `due` if today is within 7 days of targetDate
- `upcoming` otherwise

---

## Close CRM Lead Payload (`POST /api/v1/lead/`)

```json
{
  "name": "Renewal Lead: {ownerName} — {propertyAddress}",
  "status_id": "env:CLOSE_LEAD_STATUS_ID",
  "contacts": [{
    "name": "{ownerName}",
    "emails": [{ "type": "office", "email": "{email}" }],
    "phones": [{ "type": "mobile", "phone": "{phone}" }]
  }],
  "custom.{CF_PROPERTY_ADDRESS}": "{propertyAddress}",
  "custom.{CF_ASKING_RENT}": "{currentRent}",
  "custom.{CF_DAYS_ON_MARKET}": "{daysUntilLeaseEnd}",
  "custom.{CF_URGENCY_SCORE}": "{leadScore}/{maxScore} — {scoreClassification}",
  "custom.{CF_AUDIT_SUMMARY}": "{summaryString}",
  "custom.{CF_LEAD_SOURCE}": "Renewal Uplift Planner"
}
```

### Summary String Format
```
Current Rent: ${currentRent} | Lease End: {leaseEndDate} | Days Left: {daysLeft} | Management: {mgmtLabel} | Target: {targetOutcome} | Last Increase: {lastRentIncrease} | Issues: {issuesSummary} | Score: {leadScore}/{maxScore} — {classification} | Primary Problem: {primaryProblem}
```

---

## Discord Webhook Embed

Fields: Lead Magnet ("Renewal Uplift Planner"), Owner, Property Address, Current Rent, Lease End Date, Days Until Expiry, Management Situation, Target Outcome, Score + Classification, Primary Problem, Result URL.

---

## "What You Should Do Now" (Dynamic, Based on Inputs)

Rules:
- If lease within 60 days: "Your lease expires in {N} days. You need to act now."
- If no rent increase in 12+ months: "You haven't adjusted rent in over a year. A renewal is an opportunity to correct that."
- If unsure: "Indecision costs you options. Decide renew or replace now — before the timeline decides for you."
- If issues: "Late payments and maintenance issues don't go away on their own. Factor tenant reliability into your renewal decision."
- Always end with: "A structured renewal process protects your income and avoids costly surprises."

## "What Hearth Would Handle for You" (Fixed)

- Renewal timeline management (90/60/30 pipeline)
- Tenant communication and renewal offer delivery
- Rent adjustment workflow and documentation
- Turn decision support and vendor coordination
- Move-out coordination and make-ready scheduling
- Re-listing and tenant placement (if turning)
- Lease execution and compliance documentation

---

## Behavioral Rules

### Tone
Premium, direct, operational, trustworthy.
Not corporate-boring. Not playful. Not "fintech app."
Should feel like: *"These people know how rental renewals should work."*

### Copy Rules
- Emphasize hands-free execution, not "software features"
- Result should feel like a mini consulting deliverable
- Form: short, high-conversion, minimum fields
- Strong CTAs on every result page:
  - **Primary:** Book a Renewal Strategy Call
  - **Secondary:** Let Hearth Handle This Renewal
- **Landing CTA:** Get My Renewal Plan
- Make delay feel expensive — use real numbers, not vague warnings
- Do NOT use fluff like "you may want to consider renewal soon"
- The plan should end with what Hearth does, not what the owner has to figure out

### Urgency Framing Rules
- Waiting too long reduces your options
- Missed timing increases turn risk
- Under-market renewal leaves money on the table
- A bad turn decision can cost more than a modest rent mistake
- Use the turn-vs-renew comparison to make the cost of inaction concrete

### Logic Constraints
- If lease end is within 120 days → urgency should rise materially
- If no rent increase in 12+ months → highlight possible under-market renewal
- If owner is "unsure" → classify as strong sales opportunity
- If lease end is too far out → still give value, but reduce urgency
- Do not present rent increase guidance as legal/compliance advice
- Do not claim exact market rent unless you actually have comps
- Do not output jurisdiction-specific notice requirements

### Do Not
- Do not position Hearth as software
- Do not promise exact rent outcomes
- Do not present notice timelines as legal advice
- Do not compare against competitors by name
- Do not require login or account creation
- Do not make the result page look like a generic rent calculator
- Do not show fluff like "you may want to consider renewal soon"
- Do not make the owner do the work after giving them the plan
- Do not make AppFolio visible in the user experience
- Do not make it feel playful or gimmicky
- Do not make Close submission dependent on client-side JS only
- Do not make Discord the source of truth
- Do not add unnecessary integrations

---

## Architectural Invariants

- **Stack:** Next.js App Router · TypeScript · Vanilla CSS · Vercel Serverless
- **Pattern:** Mirrors `ltr-leaseup` / `ltr-sweep` project structure
- All business logic is deterministic (no LLM in critical path)
- All tools in `lib/` are atomic, testable functions
- Environment variables in `.env.local` (never hard-coded)
- Temporary files in `.tmp/` — ephemeral only
- SOPs in `architecture/` are updated **before** code changes
- Close CRM is the critical path — if Close fails, the submission fails
- Discord is fire-and-forget — if Discord fails, log but do not block
- All monetary calculations round to 2 decimal places
- Lead data must be captured before showing results (gated output)
- All actions happen synchronously on form submit (no cron, no queues)
- PDF generation via puppeteer-core + @sparticuz/chromium-min on Vercel serverless (v1)
- Result URL passes data via base64-encoded query param
- Project is only "complete" when payload reaches Close + Discord + results page + PDF

---

## Maintenance Log

| Date | Change | Author |
|---|---|---|
| 2026-03-12 | Initial constitution created. Awaiting Discovery. | System Pilot |
| 2026-03-12 | Discovery complete. Full schema, scoring logic, renewal range formula, turn-vs-renew comparison, 90/60/30 calendar, behavioral rules, and architectural invariants finalized. | System Pilot |
