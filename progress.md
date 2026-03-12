# Renewal Uplift Planner — Progress Log

## 2026-03-12

### Protocol 0: Initialization ✅
- **Action:** Created all project memory files
- **Action:** Researched existing lead magnets for architecture patterns
- **Status:** Complete

### Phase 1: Blueprint — Discovery ✅
- **Action:** Discovery questions answered, `gemini.md` finalized as Project Constitution
- **Status:** Blueprint approved by user

### Phase 2: Link — Connectivity ✅
- **Action:** Initialized Next.js project (mirrors ltr-leaseup / ltr-sweep)
- **Action:** Created `.env.local` with all credentials
- **Action:** ✅ Close CRM API connection verified (`/me/` endpoint)
- **Action:** ✅ Discord webhook verified (test embed sent)
- **Action:** ✅ Build passes clean

### Phase 3: Architect — Build ✅
- **Action:** Created 5 Architecture SOPs
- **Action:** Created 7 lib modules (types, config, scoring, renewal, comparison, calendar, close, discord)
- **Action:** Created API route `app/api/submit/route.ts`
- **Action:** ✅ Build passes clean (all TypeScript compiles, no errors)

### Phase 4: Stylize — Front-end ✅
- **Action:** Created complete CSS design system (`app/globals.css`) — 900+ lines
  - Renewal range card, comparison grid, calendar timeline, action cards
  - All share Hearth brand palette (coal, ink, hearth-green) from sweep/leaseup
- **Action:** Created `app/components/RenewalForm.tsx` — 4-step multi-step form
  - Step 1: Contact (name, email, phone)
  - Step 2: Property (address, rent, lease end)
  - Step 3: Tenant (tenure, last increase, late payments, maintenance)
  - Step 4: Situation (management, target outcome)
- **Action:** Created `app/page.tsx` — Landing page with hero, form, trust strip
  - Hearth logo added (white on dark hero, `filter: brightness(0) invert(1)`)
- **Action:** Created `app/results/page.tsx` — Full results display
  - Renewal range hero + detail card
  - Turn-vs-renew side-by-side comparison with financial details
  - 90/60/30 calendar timeline with status indicators (overdue/due/upcoming)
  - "What You Should Do Now" dynamic section
  - "What Hearth Would Handle" fixed section
  - Score badge with classification
  - PDF download button (placeholder for v1)
  - Dual CTAs: "Book a Renewal Strategy Call" + "Let Hearth Handle This Renewal"
  - Disclaimer
- **Bug Fix:** `btoa` Unicode crash — em dashes in dynamic content caused `btoa` to fail.
  - Fix: `btoa(unescape(encodeURIComponent(str)))` on encode, `decodeURIComponent(escape(atob(str)))` on decode
- **Testing:** Full end-to-end form submission tested:
  - ✅ All 4 form steps work correctly
  - ✅ API submission succeeds
  - ✅ Results page renders all sections
  - ✅ Scoring: 80/95 (Immediate) for test case with multiple signals
  - ✅ Renewal range: 5-9% increase ($2,625-$2,725) from $2,500
  - ✅ Comparison: Renew recommended ($32,100 vs $21,110 net annual)
  - ✅ Calendar: 3 milestones with correct dates and status (overdue/due/upcoming)
  - ✅ Dynamic "What To Do Now" renders with em dashes correctly
  - ✅ Hearth logo displays on both landing and results pages
- **Status:** Phase 4 complete.
- **Next:** Phase 5 (Trigger) — PDF generation, final deploy prep
