// API Route: /api/submit
// Flow: validate → score → generate outputs → Close + Discord → respond
// Close is critical path. Discord is fire-and-forget.

import { NextResponse } from 'next/server';
import { formInputSchema } from '@/lib/types';
import type { FormInput, SubmitResponse } from '@/lib/types';
import { calculateScore } from '@/lib/scoring';
import { calculateRenewalRange } from '@/lib/renewal';
import { calculateComparison } from '@/lib/comparison';
import { generateCalendar } from '@/lib/calendar';
import { createLead } from '@/lib/close';
import { sendLeadNotification } from '@/lib/discord';
import { config } from '@/lib/config';

/** Generate dynamic "What You Should Do Now" based on inputs */
function generateWhatToDoNow(input: FormInput, daysLeft: number): string[] {
  const items: string[] = [];

  if (daysLeft <= 60) {
    items.push(`Your lease expires in ${daysLeft} days. You need to act now — every week of indecision narrows your options.`);
  } else if (daysLeft <= 120) {
    items.push(`Your lease expires in ${daysLeft} days. Now is the time to decide your renewal strategy — waiting costs you leverage.`);
  }

  if (
    input.lastRentIncrease === '12-18 months' ||
    input.lastRentIncrease === '18+ months' ||
    input.lastRentIncrease === 'never'
  ) {
    items.push("You haven't adjusted rent in over a year. A renewal is an opportunity to correct that before the gap widens.");
  }

  if (input.targetOutcome === 'unsure') {
    items.push("Indecision costs you options. Decide renew or replace now — before the timeline decides for you.");
  }

  if (input.recentLatePayments || input.recentMaintenanceIssues) {
    items.push("Late payments and maintenance issues don't go away on their own. Factor tenant reliability into your renewal decision.");
  }

  if (input.managementSituation === 'self-managed') {
    items.push("Without a PM handling the renewal workflow, the timing risk falls entirely on you. A structured process makes a material difference.");
  }

  items.push("A structured renewal process protects your income and avoids costly surprises.");

  return items;
}

/** Fixed "What Hearth Would Handle for You" */
const WHAT_HEARTH_HANDLES: string[] = [
  'Renewal timeline management (90/60/30 pipeline)',
  'Tenant communication and renewal offer delivery',
  'Rent adjustment workflow and documentation',
  'Turn decision support and vendor coordination',
  'Move-out coordination and make-ready scheduling',
  'Re-listing and tenant placement (if turning)',
  'Lease execution and compliance documentation',
];

export async function POST(request: Request) {
  try {
    // 1. Parse and validate
    const body = await request.json();
    const parseResult = formInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const input: FormInput = parseResult.data;

    // 2. Score
    const score = calculateScore(input);

    // 3. Generate renewal range
    const renewalRange = calculateRenewalRange(input);

    // 4. Generate turn-vs-renew comparison
    const comparison = calculateComparison(input, renewalRange);

    // 5. Generate 90/60/30 calendar
    const calendar = generateCalendar(input.leaseEndDate);

    // 6. Generate dynamic content
    const daysLeft = Math.floor(
      (new Date(input.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    const whatToDoNow = generateWhatToDoNow(input, daysLeft);

    // 7. Build result URL (base64-encoded query param)
    const resultData = {
      score,
      renewalRange,
      comparison,
      calendar,
      whatToDoNow,
      whatHearthHandles: WHAT_HEARTH_HANDLES,
      input: {
        ownerName: input.ownerName,
        email: input.email,
        propertyAddress: input.propertyAddress,
        currentRent: input.currentRent,
        leaseEndDate: input.leaseEndDate,
        managementSituation: input.managementSituation,
        targetOutcome: input.targetOutcome,
      },
    };
    const encodedData = Buffer.from(JSON.stringify(resultData)).toString('base64');
    const resultUrl = `${config.site.url}/results?data=${encodedData}`;

    // 8. Close CRM + Discord — both non-blocking (user always gets results)
    const [closeResult] = await Promise.allSettled([
      createLead(input, score).catch((error) => {
        console.error('[Submit] Close CRM failed (non-blocking):', error);
        return undefined;
      }),
      sendLeadNotification(input, score, resultUrl).catch((error) => {
        console.error('[Submit] Discord notification failed (non-blocking):', error);
        return false;
      }),
    ]);

    const closeLeadId = closeResult.status === 'fulfilled' ? closeResult.value : undefined;

    // 10. Respond
    const response: SubmitResponse = {
      success: true,
      score,
      renewalRange,
      comparison,
      calendar,
      whatToDoNow,
      whatHearthHandles: WHAT_HEARTH_HANDLES,
      closeLeadId,
      resultUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Submit] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
