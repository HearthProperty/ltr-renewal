# Renewal Uplift Planner — Findings

## Research & Discoveries

### 2026-03-12 — Discovery Complete

**Magnet Identity**
- Time-trigger magnet — captures owners before the pain becomes a turn
- Core thesis: owners with leases coming due need a concrete plan, not vague "you should renew soon"
- One-line spec: "Turn an owner with an upcoming lease expiration into a high-intent Hearth lead by showing a credible renew-vs-turn plan, a recommended renewal range, and a 90/60/30 action calendar that makes delay feel costly and Hearth feel like the obvious operator."

**Architecture Pattern — Mirrors `ltr-leaseup` / `ltr-sweep`**
- `ltr-leaseup` deployed at `leaseup.hearthproperty.com`
- `ltr-sweep` deployed at `sweep.hearthproperty.com`
- Both use: Next.js App Router + TypeScript + vanilla CSS + Vercel serverless
- Pattern: `lib/` for atomic functions (types, scoring, close, discord, config)
- Pattern: `app/api/submit/route.ts` as sole API route
- Pattern: `app/results/page.tsx` for result display
- Pattern: `app/components/` for form + result components
- Uses Zod for schema validation
- Same Close CRM custom field IDs are reused (repurposed for each magnet)
- Same Discord webhook pattern (fire-and-forget)
- Result URL passes data via base64-encoded query param
- Config uses lazy evaluation (get accessors) — env vars not read at build time

**Custom Field Reuse Strategy**
Same Close CRM custom field IDs from previous magnets. For this project:
- `CLOSE_CF_PROPERTY_ADDRESS` → property address (same purpose)
- `CLOSE_CF_ASKING_RENT` → current rent (repurposed — was asking rent / monthly rent)
- `CLOSE_CF_DAYS_ON_MARKET` → days until lease end (repurposed — was days on market / switch timeline)
- `CLOSE_CF_URGENCY_SCORE` → lead score + classification (same purpose)
- `CLOSE_CF_AUDIT_SUMMARY` → renewal plan summary string (repurposed — was audit summary / sweep summary)
- `CLOSE_CF_LEAD_SOURCE` → "Renewal Uplift Planner" (same purpose)

**PDF Generation — v1 Requirement**
- Unlike leaseup (v1.1), PDF is required for v1 of this magnet
- Rationale: the 90/60/30 calendar + turn-vs-renew comparison is the core deliverable
- It needs to feel like a mini consulting output, and a downloadable plan delivers that
- Research confirms: `puppeteer-core` + `@sparticuz/chromium-min` is the standard for Vercel serverless PDF generation
- Recommended versions: `@sparticuz/chromium-min@^129.0.0` + `puppeteer-core@^23.5.0`

**Scoring Logic**
| Signal | Points | Rationale |
|---|---|---|
| Lease ends within 120 days | +25 | Core urgency — time trigger |
| Lease ends within 60 days | +15 extra | Compounding urgency — options narrow fast |
| No rent increase in 12+ months | +20 | Under-market risk — money on the table |
| Owner unsure about outcome | +15 | Indecision = strong sales opportunity |
| Self-managed | +10 | No PM = no renewal workflow |
| Issue history present | +10 | Tenant quality uncertainty |

**Max score: 95** (all signals fire, 120-day + 60-day stack)

**Renewal Range Logic**
- Base increase band: 3-5%
- Adjusted by last rent increase timing, tenant tenure, and issue history
- Not market comp data — explicitly disclaimed as directional guidance

**Turn-vs-Renew Comparison Logic**
- Renew scenario: annual rent at suggested increase, zero vacancy/turnover
- Turn scenario: higher potential rent, but with vacancy and turnover costs
- Vacancy estimate varies by management situation (self-managed: 2mo, has PM: 1mo, default: 1.5mo)
- Turnover cost estimated at 1× monthly rent

**90/60/30 Calendar Logic**
- 90 days out: Decide & Prepare
- 60 days out: Communicate & Offer
- 30 days out: Execute
- Status: overdue / due (within 7 days) / upcoming

**Key Differences from Previous Magnets**
1. Time-trigger based (lease end date is the anchor)
2. Primary problem is auto-derived from signals (not user-selected like sweep)
3. PDF generation is v1 (not v1.1)
4. No financial statement generation
5. No Zillow scraping
6. Output is forward-looking (calendar + recommendation, not backward analysis)
7. Binary yes/no inputs reduce form friction
8. Turn-vs-renew comparison is the unique, differentiating output
9. "What you should do now" section is dynamically generated from inputs
10. "What Hearth would handle" section is fixed content

### Close CRM API Reference (from leaseup findings)
- **Create Lead:** `POST https://api.close.com/api/v1/lead/`
- **Auth:** Basic auth, API key as username, empty password → Base64 encode `{key}:`
- **Contacts:** Nest `contacts[]` inside lead payload with `name`, `emails[]`, `phones[]`
- **Custom fields:** Use `custom.{FIELD_ID}` syntax
- **Status:** Use `status_id` (not `status` label)

### Discord Webhooks Reference (from leaseup findings)
- **Endpoint:** `POST {webhook_url}`
- **Payload:** `{ "embeds": [{ ... }] }` — up to 10 embeds per message
- **Embed limits:** title 256 chars, description 2048 chars, field name 256 chars, field value 1024 chars, total 6000 chars, max 25 fields
- **Inline fields:** Set `inline: true` to render up to 3 per row
- **Color:** Integer (decimal representation of hex color)

### Open Questions — NONE
All discovery questions answered. Blueprint ready for approval.
