# Renewal Uplift Planner — Task Plan

## Project: Renewal Uplift Planner (Lead Magnet — Time-Trigger)
**Status:** 🟡 Phase 1 — Blueprint Complete, Awaiting Approval

---

## Phase 0: Initialization ✅
- [x] Create `task_plan.md`
- [x] Create `findings.md`
- [x] Create `progress.md`
- [x] Create `gemini.md` (Project Constitution)
- [x] Discovery Questions answered
- [x] Data Schema defined in `gemini.md`
- [ ] **Blueprint approved by user** ← BLOCKING

## Phase 1: Blueprint (Vision & Logic) ✅
- [x] Discovery answers captured
- [x] Data schema (input/output JSON shapes) finalized
- [x] Scoring logic formalized (6 signals, max 95 pts)
- [x] Renewal range formula defined (base 3-5% with adjustments)
- [x] Turn-vs-renew comparison formula defined (renew vs turn net annual)
- [x] 90/60/30 calendar logic defined (3 milestones, status tracking)
- [x] Primary problem detection logic defined (5 values, priority ordered)
- [x] Research: studied `ltr-leaseup` + `ltr-sweep` patterns, Close CRM field reuse
- [x] `gemini.md` updated as Project Constitution
- [ ] **Blueprint approved by user** ← BLOCKING

## Phase 2: Link (Connectivity)
- [ ] Initialize Next.js project (mirror `ltr-leaseup` / `ltr-sweep` structure)
- [ ] Create `.env.local` with all credentials
- [ ] Verify Close CRM API connection
- [ ] Verify Discord webhook
- [ ] Test PDF generation library (puppeteer-core + @sparticuz/chromium-min)

## Phase 3: Architect (3-Layer Build)
### Architecture SOPs
- [ ] `architecture/form-flow.md` — form UX and field grouping
- [ ] `architecture/scoring-engine.md` — lead scoring logic
- [ ] `architecture/renewal-engine.md` — renewal range + turn-vs-renew comparison
- [ ] `architecture/calendar-engine.md` — 90/60/30 renewal calendar
- [ ] `architecture/integrations.md` — Close + Discord + PDF

### Lib Modules
- [ ] `lib/types.ts` — Zod schemas + TypeScript types
- [ ] `lib/config.ts` — centralized env config
- [ ] `lib/scoring.ts` — lead scoring engine (deterministic, 6 signals)
- [ ] `lib/renewal.ts` — renewal range recommendation (directional, not comps)
- [ ] `lib/comparison.ts` — turn-vs-renew comparison (net annual comparison)
- [ ] `lib/calendar.ts` — 90/60/30 renewal calendar generator
- [ ] `lib/close.ts` — Close CRM lead creation
- [ ] `lib/discord.ts` — Discord webhook notification
- [ ] `lib/pdf.ts` — PDF generation (branded renewal plan)

### API Routes
- [ ] `app/api/submit/route.ts` — validate → score → generate all outputs → Close + Discord → respond
- [ ] `app/api/pdf/route.ts` — PDF generation endpoint

## Phase 4: Stylize (Refinement & UI)
- [ ] `app/globals.css` — design system (premium, operational aesthetic)
- [ ] Landing page with headline + form
  - [ ] Form component
  - [ ] Step 1: Contact info (name, email, phone)
  - [ ] Step 2: Property + rent (address, current rent, lease end date)
  - [ ] Step 3: Tenant + history (tenure, last increase, late payments, maintenance)
  - [ ] Step 4: Situation (management, target outcome)
- [ ] Results page
  - [ ] Recommended renewal range with disclaimer
  - [ ] Turn-vs-renew comparison (side-by-side)
  - [ ] 90/60/30 renewal calendar with status indicators
  - [ ] "What you should do now" section (dynamic)
  - [ ] "What Hearth would handle for you" section (fixed)
  - [ ] PDF download button
  - [ ] CTA: Book a Renewal Strategy Call / Let Hearth Handle This Renewal
- [ ] Mobile responsive
- [ ] Premium visual design
- [ ] User feedback round

## Phase 5: Trigger (Deployment)
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Configure `renewal.hearthproperty.com` subdomain in Squarespace DNS
- [ ] Set environment variables in Vercel
- [ ] End-to-end test: form → results → Close lead → Discord alert → PDF download
- [ ] Documentation finalized in `gemini.md`

---

## Primary Problem Values Addressed
1. Renewal timing risk
2. Under-market rent
3. Owner indecision
4. Turn risk
5. Tenant quality uncertainty

## Key Architecture Decisions
- **Mirrors `ltr-leaseup` / `ltr-sweep`** pattern for consistency
- **No external data scraping** — direct property input
- **Multi-step form** — 12 inputs grouped into 4 logical steps
- **Close CRM fields reused** — same IDs, repurposed labels
- **PDF generation is v1** — not v1.1 (renewal plan is the deliverable)
- **Same Discord webhook** — same channel as other magnets
- **Primary problem auto-derived** — not user-selected, inferred from scoring signals
- **Renewal range is directional** — not market comp based, includes explicit disclaimer
