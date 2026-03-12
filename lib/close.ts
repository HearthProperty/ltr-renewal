// Close CRM integration — creates a lead via POST /api/v1/lead/
// Close is the critical path — if Close fails, the submission fails.

import type { FormInput, ScoreResult } from './types';
import { daysUntilLeaseEnd } from './scoring';

interface CloseLeadResponse {
  id: string;
  [key: string]: unknown;
}

function getCloseConfig() {
  const apiKey = process.env.CLOSE_API_KEY;
  const leadStatusId = process.env.CLOSE_LEAD_STATUS_ID;
  const cfPropertyAddress = process.env.CLOSE_CF_PROPERTY_ADDRESS;
  const cfAskingRent = process.env.CLOSE_CF_ASKING_RENT;
  const cfDaysOnMarket = process.env.CLOSE_CF_DAYS_ON_MARKET;
  const cfUrgencyScore = process.env.CLOSE_CF_URGENCY_SCORE;
  const cfAuditSummary = process.env.CLOSE_CF_AUDIT_SUMMARY;
  const cfLeadSource = process.env.CLOSE_CF_LEAD_SOURCE;

  if (!apiKey || !leadStatusId) {
    return null;
  }

  return {
    apiKey,
    leadStatusId,
    cf: {
      propertyAddress: cfPropertyAddress,
      askingRent: cfAskingRent,
      daysOnMarket: cfDaysOnMarket,
      urgencyScore: cfUrgencyScore,
      auditSummary: cfAuditSummary,
      leadSource: cfLeadSource,
    },
  };
}

/** Build a summary string for the Close CRM audit summary field */
function buildSummaryString(input: FormInput, score: ScoreResult): string {
  const mgmtLabel = input.managementSituation === 'self-managed' ? 'Self-managed' : 'Has PM';
  const daysLeft = daysUntilLeaseEnd(input.leaseEndDate);
  const issues: string[] = [];
  if (input.recentLatePayments) issues.push('Late payments');
  if (input.recentMaintenanceIssues) issues.push('Maintenance issues');
  const issuesSummary = issues.length > 0 ? issues.join(', ') : 'None';

  const lines = [
    `Current Rent: $${input.currentRent.toLocaleString()}`,
    `Lease End: ${input.leaseEndDate}`,
    `Days Left: ${daysLeft}`,
    `Management: ${mgmtLabel}`,
    `Target: ${input.targetOutcome}`,
    `Last Increase: ${input.lastRentIncrease}`,
    `Issues: ${issuesSummary}`,
    `Score: ${score.leadScore}/${score.maxScore} — ${score.scoreClassification}`,
    `Primary Problem: ${score.primaryProblem}`,
  ];
  return lines.join(' | ');
}

export async function createLead(
  input: FormInput,
  score: ScoreResult
): Promise<string | undefined> {
  const closeConfig = getCloseConfig();

  if (!closeConfig) {
    console.log('[Close CRM] Skipped — credentials not configured');
    return undefined;
  }

  const daysLeft = daysUntilLeaseEnd(input.leaseEndDate);

  const customFields: Record<string, unknown> = {};
  if (closeConfig.cf.propertyAddress) customFields[`custom.${closeConfig.cf.propertyAddress}`] = input.propertyAddress;
  if (closeConfig.cf.askingRent) customFields[`custom.${closeConfig.cf.askingRent}`] = input.currentRent;
  if (closeConfig.cf.daysOnMarket) customFields[`custom.${closeConfig.cf.daysOnMarket}`] = daysLeft;
  if (closeConfig.cf.urgencyScore) customFields[`custom.${closeConfig.cf.urgencyScore}`] = `${score.leadScore}/${score.maxScore} — ${score.scoreClassification}`;
  if (closeConfig.cf.auditSummary) customFields[`custom.${closeConfig.cf.auditSummary}`] = buildSummaryString(input, score);
  if (closeConfig.cf.leadSource) customFields[`custom.${closeConfig.cf.leadSource}`] = 'Renewal Uplift Planner';

  const payload = {
    name: `Renewal Lead: ${input.ownerName} — ${input.propertyAddress}`,
    status_id: closeConfig.leadStatusId,
    contacts: [
      {
        name: input.ownerName,
        emails: [{ type: 'office', email: input.email }],
        phones: [{ type: 'mobile', phone: input.phone }],
      },
    ],
    ...customFields,
  };

  const credentials = Buffer.from(`${closeConfig.apiKey}:`).toString('base64');

  const response = await fetch('https://api.close.com/api/v1/lead/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Close CRM] Failed to create lead:', response.status, errorText);
    throw new Error(`Close CRM error: ${response.status}`);
  }

  const data = (await response.json()) as CloseLeadResponse;
  console.log('[Close CRM] Lead created:', data.id);
  return data.id;
}
