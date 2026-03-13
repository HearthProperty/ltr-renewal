# Renewal Uplift Planner — Progress Log

## 2026-03-12

### Protocol 0: Initialization ✅
- Created all project memory files
- Researched existing lead magnets for architecture patterns

### Phase 1: Blueprint — Discovery ✅
- Discovery questions answered, `gemini.md` finalized as Project Constitution
- Blueprint approved by user

### Phase 2: Link — Connectivity ✅
- Initialized Next.js project (mirrors ltr-leaseup / ltr-sweep)
- Created `.env.local` with all credentials
- ✅ Close CRM API verified · ✅ Discord webhook verified · ✅ Build passes

### Phase 3: Architect — Build ✅
- 5 Architecture SOPs in `architecture/`
- 8 lib modules (types, config, scoring, renewal, comparison, calendar, close, discord)
- API route `app/api/submit/route.ts`
- ✅ Build passes clean

### Phase 4: Stylize — Front-end ✅
- Complete CSS design system (`app/globals.css`) — 900+ lines
- 4-step multi-step form component
- Landing page with Hearth logo, hero, trust strip
- Full results page with all 7 sections
- Bug fix: btoa Unicode crash (em dashes in dynamic content)
- ✅ End-to-end test passed: form → API → results

### Phase 5: Trigger — Deploy & Polish ✅
- **PDF generation:** `lib/pdf.ts` + `app/api/pdf/route.ts`
  - Branded renewal plan PDF template (renewal range, comparison table, calendar, actions, score)
  - puppeteer-core + @sparticuz/chromium-min (matching sweep pattern)
  - `maxDuration = 30` for serverless timeout
- **SEO:** Inter font via Google Fonts, favicon, proper meta tags
- **Git:** Initial commit to main branch
- ✅ Final build passes clean (6 routes: /, /_not-found, /api/submit, /api/pdf, /results)
- **Status:** Ready for Vercel deploy

### Remaining (Manual)
- [ ] Push to GitHub remote
- [ ] Connect Vercel project
- [ ] Configure env vars in Vercel dashboard
- [ ] Set up `renewal.hearthproperty.com` CNAME in Squarespace DNS
- [ ] Live test: Submit form → verify Close lead + Discord notification + PDF download
