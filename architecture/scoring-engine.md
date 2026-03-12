# Scoring Engine SOP — Renewal Uplift Planner

## Overview
Deterministic lead scoring engine. 6 signals, max 95 points. No LLM, no randomness.

## Signals

| # | Signal | Points | Test |
|---|--------|--------|------|
| 1 | Lease ends within 120 days | +25 | `daysUntilLeaseEnd <= 120` |
| 2 | Lease ends within 60 days | +15 extra | `daysUntilLeaseEnd <= 60` (stacks with #1) |
| 3 | No rent increase in 12+ months | +20 | `lastRentIncrease in ['12-18 months', '18+ months', 'never']` |
| 4 | Owner unsure about outcome | +15 | `targetOutcome === 'unsure'` |
| 5 | Self-managed | +10 | `managementSituation === 'self-managed'` |
| 6 | Issue history present | +10 | `recentLatePayments === true OR recentMaintenanceIssues === true` |

## Classification Thresholds
- 0–24: `low`
- 25–49: `moderate`
- 50–74: `high`
- 75+: `immediate`

## Primary Problem Detection
Auto-derived from triggered signals. Priority order:
1. **Renewal timing risk** — signal 1 or 2 triggered
2. **Under-market rent** — signal 3 triggered
3. **Owner indecision** — signal 4 triggered
4. **Turn risk** — targetOutcome === 'replace' or issues present
5. **Tenant quality uncertainty** — signal 6 triggered but nothing above

If no signals triggered: "General renewal planning"

## Edge Cases
- Signals 1 and 2 can both fire (stacking): lease ≤60 days scores +25 + +15 = +40
- Signals 5 is mutually exclusive (self-managed vs have_pm) — only one can fire
- Max score is 95 (all 6 signals fire including stacking)

## Days Until Lease End Calculation
```
daysUntilLeaseEnd = floor((leaseEndDate - today) / (1000 * 60 * 60 * 24))
```
Negative values mean the lease has already expired — treat as 0 days remaining.
