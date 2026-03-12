// Turn-vs-Renew comparison — side-by-side net annual outcome.
// Makes the cost of inaction concrete with real numbers.

import type { FormInput, RenewalRange, TurnVsRenewComparison } from './types';

export function calculateComparison(
  input: FormInput,
  renewalRange: RenewalRange
): TurnVsRenewComparison {
  // --- Renew Scenario ---
  const suggestedRent = Math.round((renewalRange.suggestedLow + renewalRange.suggestedHigh) / 2);
  const renewAnnualRent = round2(suggestedRent * 12);

  const renewScenario = {
    label: 'Renew with Increase',
    projectedAnnualRent: renewAnnualRent,
    estimatedVacancyCost: 0,
    estimatedTurnoverCost: 0,
    netAnnualOutcome: renewAnnualRent,
    pros: [
      'No vacancy — income continues immediately',
      'No turnover costs (cleaning, repairs, re-leasing)',
      'Known tenant with established history',
      'Rent increase improves cash flow',
    ],
    cons: [
      'May still be below market rate',
      'Existing tenant issues persist if unaddressed',
    ],
  };

  // --- Turn Scenario ---
  const vacancyMonths = input.managementSituation === 'self-managed' ? 2.0 : 1.0;
  const turnRent = Math.round(renewalRange.suggestedHigh * 1.05); // 5% above renewal high
  const turnAnnualRent = round2(turnRent * (12 - vacancyMonths));
  const vacancyCost = round2(input.currentRent * vacancyMonths);
  const turnoverCost = round2(input.currentRent); // 1 month's rent
  const turnNetAnnual = round2(turnAnnualRent - vacancyCost - turnoverCost);

  const turnScenario = {
    label: 'Turn the Unit',
    projectedAnnualRent: turnAnnualRent,
    estimatedVacancyCost: vacancyCost,
    estimatedTurnoverCost: turnoverCost,
    netAnnualOutcome: turnNetAnnual,
    pros: [
      'Opportunity to reset to full market rate',
      'Fresh start with a vetted new tenant',
      'Chance to address deferred maintenance',
    ],
    cons: [
      `Estimated ${vacancyMonths} month${vacancyMonths !== 1 ? 's' : ''} vacancy`,
      `~$${turnoverCost.toLocaleString()} estimated turnover cost`,
      'Unknown new tenant quality',
      'Re-leasing time and effort',
    ],
  };

  // --- Recommendation ---
  let recommendation: TurnVsRenewComparison['recommendation'];
  if (renewScenario.netAnnualOutcome >= turnScenario.netAnnualOutcome) {
    recommendation = 'renew';
  } else if (turnScenario.netAnnualOutcome > renewScenario.netAnnualOutcome * 1.10) {
    recommendation = 'turn';
  } else {
    recommendation = 'depends';
  }

  // --- Summary ---
  const diff = Math.abs(renewScenario.netAnnualOutcome - turnScenario.netAnnualOutcome);
  let summary: string;

  if (recommendation === 'renew') {
    summary = `Renewing with a ${renewalRange.suggestedIncreasePercent.low}–${renewalRange.suggestedIncreasePercent.high}% increase is projected to net $${renewScenario.netAnnualOutcome.toLocaleString()}/year — $${diff.toLocaleString()} more than turning the unit after vacancy and turnover costs. Renewal is the stronger financial play here.`;
  } else if (recommendation === 'turn') {
    summary = `Turning the unit projects a net of $${turnScenario.netAnnualOutcome.toLocaleString()}/year, which is $${diff.toLocaleString()} more than renewing — even after factoring in vacancy and turnover costs. If the tenant or market supports it, turning may be worth the disruption.`;
  } else {
    summary = `The numbers are close — renewing nets $${renewScenario.netAnnualOutcome.toLocaleString()}/year versus $${turnScenario.netAnnualOutcome.toLocaleString()}/year for turning. The best choice depends on tenant quality, local market conditions, and your risk tolerance.`;
  }

  return {
    renewScenario,
    turnScenario,
    recommendation,
    summary,
  };
}

/** Round to 2 decimal places */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
