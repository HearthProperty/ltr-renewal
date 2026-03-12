import { z } from 'zod';

// --- Form Input Schema (what the user submits) ---
export const formInputSchema = z.object({
  ownerName: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Phone number is required'),
  propertyAddress: z.string().min(1, 'Property address is required'),
  currentRent: z.number().min(1, 'Current rent is required'),
  leaseEndDate: z.string().min(1, 'Lease end date is required'),
  tenantTenure: z.enum(['< 1 year', '1-2 years', '2-3 years', '3+ years']),
  lastRentIncrease: z.enum(['< 6 months', '6-12 months', '12-18 months', '18+ months', 'never']),
  recentLatePayments: z.boolean(),
  recentMaintenanceIssues: z.boolean(),
  managementSituation: z.enum(['self-managed', 'have_pm']),
  targetOutcome: z.enum(['renew', 'unsure', 'replace']),
});

export type FormInput = z.infer<typeof formInputSchema>;

// --- Score Classification ---
export type ScoreClassification = 'low' | 'moderate' | 'high' | 'immediate';

// --- Primary Problem ---
export type PrimaryProblem =
  | 'Renewal timing risk'
  | 'Under-market rent'
  | 'Owner indecision'
  | 'Turn risk'
  | 'Tenant quality uncertainty'
  | 'General renewal planning';

// --- Scoring Output ---
export interface ScoreResult {
  leadScore: number;
  maxScore: number;
  scoreClassification: ScoreClassification;
  breakdown: {
    signal: string;
    points: number;
    triggered: boolean;
  }[];
  primaryProblem: PrimaryProblem;
}

// --- Renewal Range ---
export interface RenewalRange {
  currentRent: number;
  suggestedLow: number;
  suggestedHigh: number;
  suggestedIncreasePercent: { low: number; high: number };
  rationale: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

// --- Turn vs Renew Comparison ---
export interface Scenario {
  label: string;
  projectedAnnualRent: number;
  estimatedVacancyCost: number;
  estimatedTurnoverCost: number;
  netAnnualOutcome: number;
  pros: string[];
  cons: string[];
}

export interface TurnVsRenewComparison {
  renewScenario: Scenario;
  turnScenario: Scenario;
  recommendation: 'renew' | 'turn' | 'depends';
  summary: string;
}

// --- 90/60/30 Calendar ---
export type MilestoneStatus = 'upcoming' | 'due' | 'overdue';

export interface Milestone {
  daysOut: number;
  targetDate: string;
  label: string;
  actions: string[];
  status: MilestoneStatus;
}

export interface RenewalCalendar {
  leaseEndDate: string;
  milestones: Milestone[];
}

// --- Full API Response ---
export interface SubmitResponse {
  success: boolean;
  score: ScoreResult;
  renewalRange: RenewalRange;
  comparison: TurnVsRenewComparison;
  calendar: RenewalCalendar;
  whatToDoNow: string[];
  whatHearthHandles: string[];
  closeLeadId?: string;
  resultUrl: string;
}

// --- Management type label helper ---
export type ManagementSituation = FormInput['managementSituation'];
