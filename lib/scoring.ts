// Lead scoring engine — deterministic rules from gemini.md.
// 6 signals, max 95 points. No LLM, no randomness.

import type { FormInput, ScoreResult, ScoreClassification, PrimaryProblem } from './types';

/** Calculate days until lease end from today. Negative = already expired. */
function daysUntilLeaseEnd(leaseEndDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(leaseEndDate);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface ScoringSignal {
  signal: string;
  points: number;
  test: (input: FormInput, daysLeft: number) => boolean;
}

const SCORING_SIGNALS: ScoringSignal[] = [
  {
    signal: 'Lease ends within 120 days',
    points: 25,
    test: (_input, daysLeft) => daysLeft <= 120,
  },
  {
    signal: 'Lease ends within 60 days',
    points: 15,
    test: (_input, daysLeft) => daysLeft <= 60,
  },
  {
    signal: 'No rent increase in 12+ months',
    points: 20,
    test: (input) =>
      input.lastRentIncrease === '12-18 months' ||
      input.lastRentIncrease === '18+ months' ||
      input.lastRentIncrease === 'never',
  },
  {
    signal: 'Owner unsure about outcome',
    points: 15,
    test: (input) => input.targetOutcome === 'unsure',
  },
  {
    signal: 'Self-managed property',
    points: 10,
    test: (input) => input.managementSituation === 'self-managed',
  },
  {
    signal: 'Issue history present',
    points: 10,
    test: (input) => input.recentLatePayments || input.recentMaintenanceIssues,
  },
];

function classify(score: number): ScoreClassification {
  if (score >= 75) return 'immediate';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

/** Derive primary problem from triggered signals (priority order from gemini.md) */
function derivePrimaryProblem(
  input: FormInput,
  breakdown: { signal: string; triggered: boolean }[]
): PrimaryProblem {
  const triggered = new Set(
    breakdown.filter((b) => b.triggered).map((b) => b.signal)
  );

  // Priority: timing > under-market > indecision > turn risk > tenant quality
  if (triggered.has('Lease ends within 120 days') || triggered.has('Lease ends within 60 days')) {
    return 'Renewal timing risk';
  }
  if (triggered.has('No rent increase in 12+ months')) {
    return 'Under-market rent';
  }
  if (triggered.has('Owner unsure about outcome')) {
    return 'Owner indecision';
  }
  if (input.targetOutcome === 'replace' || triggered.has('Issue history present')) {
    return 'Turn risk';
  }
  if (input.recentLatePayments || input.recentMaintenanceIssues) {
    return 'Tenant quality uncertainty';
  }
  return 'General renewal planning';
}

export function calculateScore(input: FormInput): ScoreResult {
  const daysLeft = daysUntilLeaseEnd(input.leaseEndDate);

  const breakdown = SCORING_SIGNALS.map((signal) => ({
    signal: signal.signal,
    points: signal.points,
    triggered: signal.test(input, daysLeft),
  }));

  const leadScore = breakdown
    .filter((b) => b.triggered)
    .reduce((sum, b) => sum + b.points, 0);

  return {
    leadScore,
    maxScore: 95,
    scoreClassification: classify(leadScore),
    breakdown,
    primaryProblem: derivePrimaryProblem(input, breakdown),
  };
}

export { daysUntilLeaseEnd };
