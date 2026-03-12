// Renewal range recommendation — directional guidance, not market comps.
// Based on input signals: last increase timing, tenant tenure, issue history.

import type { FormInput, RenewalRange } from './types';

export function calculateRenewalRange(input: FormInput): RenewalRange {
  // Base conservative band: 3-5%
  let lowPercent = 3;
  let highPercent = 5;

  // --- Upward adjustments: time since last increase ---
  if (input.lastRentIncrease === '12-18 months') {
    lowPercent = 4;
    highPercent = 7;
  } else if (input.lastRentIncrease === '18+ months' || input.lastRentIncrease === 'never') {
    lowPercent = 5;
    highPercent = 10;
  }

  // --- Downward adjustments ---
  if (input.recentLatePayments) {
    highPercent -= 1;
  }
  if (input.recentMaintenanceIssues) {
    highPercent -= 1;
  }
  if (input.tenantTenure === '3+ years') {
    highPercent -= 1; // retention value
  }

  // --- Upward adjustment: short tenure ---
  if (input.tenantTenure === '< 1 year') {
    lowPercent += 1; // less retention leverage
  }

  // --- Safety guards ---
  // Cap at 10% max
  highPercent = Math.min(highPercent, 10);
  // Floor: upper bound must be at least lowPercent + 1
  highPercent = Math.max(highPercent, lowPercent + 1);
  // Ensure low is still at least 1%
  lowPercent = Math.max(lowPercent, 1);

  // --- Calculate values ---
  const suggestedLow = Math.round(input.currentRent * (1 + lowPercent / 100));
  const suggestedHigh = Math.round(input.currentRent * (1 + highPercent / 100));

  // --- Risk level ---
  const spread = highPercent - lowPercent;
  let riskLevel: RenewalRange['riskLevel'];
  if (spread <= 3) {
    riskLevel = 'conservative';
  } else if (spread <= 6) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'aggressive';
  }

  // --- Build rationale ---
  const rationale = buildRationale(input, lowPercent, highPercent);

  return {
    currentRent: input.currentRent,
    suggestedLow,
    suggestedHigh,
    suggestedIncreasePercent: { low: lowPercent, high: highPercent },
    rationale,
    riskLevel,
  };
}

function buildRationale(input: FormInput, low: number, high: number): string {
  const parts: string[] = [];

  if (input.lastRentIncrease === 'never') {
    parts.push('Rent has never been adjusted — a correction is likely overdue.');
  } else if (input.lastRentIncrease === '18+ months') {
    parts.push("It's been over 18 months since the last increase — a meaningful adjustment is reasonable.");
  } else if (input.lastRentIncrease === '12-18 months') {
    parts.push('Over a year since the last increase — a moderate adjustment is typical.');
  } else {
    parts.push('Rent was adjusted recently — a standard renewal increase applies.');
  }

  if (input.tenantTenure === '3+ years') {
    parts.push('Long-term tenant retention has value — the upper range is moderated.');
  }
  if (input.recentLatePayments || input.recentMaintenanceIssues) {
    parts.push('Tenant issues are present — this reduces how aggressive the increase should be.');
  }

  parts.push(`Suggested range: ${low}–${high}% increase.`);
  parts.push('This is directional guidance, not a market rent estimate. Final rent should reflect local comps and market conditions.');

  return parts.join(' ');
}
