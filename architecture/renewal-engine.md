# Renewal Engine SOP — Renewal Uplift Planner

## Overview
Two deterministic calculations:
1. **Renewal Range** — suggested rent increase band
2. **Turn-vs-Renew Comparison** — side-by-side net annual outcome

## Renewal Range Formula

### Base Band
Default conservative band: 3–5% increase over current rent.

### Adjustments
| Condition | Adjustment |
|-----------|------------|
| No increase in 12-18 months | Widen to 4–7% |
| No increase in 18+ months or never | Widen to 5–10% |
| Recent late payments | Reduce upper bound by 1% |
| Recent maintenance issues | Reduce upper bound by 1% |
| Tenant tenure 3+ years | Reduce upper bound by 1% (retention value) |
| Tenant tenure < 1 year | Increase lower bound by 1% (less retention leverage) |

### Output
- currentRent
- suggestedLow = currentRent × (1 + lowPercent)
- suggestedHigh = currentRent × (1 + highPercent)
- suggestedIncreasePercent: { low, high }
- rationale string
- riskLevel: conservative | moderate | aggressive

### Risk Level
- If band spread ≤ 3%: conservative
- If band spread 4-6%: moderate
- If band spread > 6%: aggressive

### Rounding
All monetary values round to nearest dollar (0 decimal places for display, 2 for calculation).

## Turn-vs-Renew Comparison Formula

### Renew Scenario
```
suggestedRent = midpoint of renewal range = (suggestedLow + suggestedHigh) / 2
annualRent = suggestedRent × 12
vacancyCost = $0
turnoverCost = $0
netAnnual = annualRent
```

### Turn Scenario
```
turnRent = suggestedHigh × 1.05  (optimistic: 5% above renewal high)
vacancyMonths = 
  self-managed: 2.0
  have_pm: 1.0
turnoverCost = currentRent × 1  (1 month's rent for make-ready)
annualRent = turnRent × (12 - vacancyMonths)
vacancyCost = currentRent × vacancyMonths
netAnnual = annualRent - vacancyCost - turnoverCost
```

### Recommendation
- If renew net ≥ turn net: `recommend = "renew"`
- If turn net > renew net by >10%: `recommend = "turn"`
- Otherwise: `recommend = "depends"`

### Pros/Cons (Static, Based on Recommendation)
**Renew Pros:** No vacancy, no turnover cost, immediate income continuity, known tenant
**Renew Cons:** May leave money on table if under-market, tenant issues persist

**Turn Pros:** Opportunity for market-rate reset, fresh start with new tenant
**Turn Cons:** Vacancy loss, turnover costs, re-leasing time, unknown new tenant quality

## Edge Cases
- If currentRent is very low and adjustments push the range above 10%, cap at 10%
- If all negative adjustments stack (-3%), floor the upper bound at lowPercent + 1%
- If lease has already expired (days ≤ 0), the turn scenario is more realistic but the comparison still runs
