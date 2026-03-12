# Calendar Engine SOP — Renewal Uplift Planner

## Overview
Generates a 90/60/30 renewal calendar based on the lease end date. Three milestones, each with actionable items and a status indicator.

## Milestone Dates
```
90-day milestone = leaseEndDate - 90 days
60-day milestone = leaseEndDate - 60 days
30-day milestone = leaseEndDate - 30 days
```

## Milestone Definitions

### 90 Days Out — "Decide & Prepare"
Actions:
1. Evaluate tenant quality (payment history, maintenance record)
2. Decide: renew with increase or begin turn planning
3. Pull market comps to inform rent target
4. Review lease terms for renewal/notice requirements

### 60 Days Out — "Communicate & Offer"
Actions:
1. Send formal renewal offer with proposed rent
2. If turning: begin vendor scheduling (cleaning, paint, repairs)
3. Set a response deadline for tenant (14 days recommended)
4. Prepare backup plan (listing, pricing, move-out coordination)

### 30 Days Out — "Execute"
Actions:
1. Confirm signed renewal OR begin turn process
2. If renewed: update lease, file documentation
3. If turning: coordinate move-out, schedule make-ready, list unit
4. Ensure no gap in coverage

## Status Logic
For each milestone:
- `overdue`: today > targetDate
- `due`: today is within 7 days of targetDate (targetDate - 7 ≤ today ≤ targetDate)
- `upcoming`: today < targetDate - 7

## Edge Cases
- If lease end date is in the past: all milestones are `overdue`
- If lease end is within 30 days: 90 and 60 milestones are `overdue`, 30 may be `due` or `overdue`
- If lease end is 120+ days out: all milestones are `upcoming`
- Calendar always generates all 3 milestones regardless of current date
