// 90/60/30 Renewal Calendar — generates milestones based on lease end date.
// Status: overdue / due (within 7 days) / upcoming.

import type { RenewalCalendar, Milestone, MilestoneStatus } from './types';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function subtractDays(dateStr: string, days: number): Date {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - days);
  return date;
}

function getStatus(targetDate: Date): MilestoneStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'due';
  return 'upcoming';
}

export function generateCalendar(leaseEndDate: string): RenewalCalendar {
  const milestones: Milestone[] = [
    {
      daysOut: 90,
      targetDate: formatDate(subtractDays(leaseEndDate, 90)),
      label: 'Decide & Prepare',
      actions: [
        'Evaluate tenant quality (payment history, maintenance record)',
        'Decide: renew with increase or begin turn planning',
        'Pull market comps to inform rent target',
        'Review lease terms for renewal/notice requirements',
      ],
      status: getStatus(subtractDays(leaseEndDate, 90)),
    },
    {
      daysOut: 60,
      targetDate: formatDate(subtractDays(leaseEndDate, 60)),
      label: 'Communicate & Offer',
      actions: [
        'Send formal renewal offer with proposed rent',
        'If turning: begin vendor scheduling (cleaning, paint, repairs)',
        'Set a response deadline for tenant (14 days recommended)',
        'Prepare backup plan (listing, pricing, move-out coordination)',
      ],
      status: getStatus(subtractDays(leaseEndDate, 60)),
    },
    {
      daysOut: 30,
      targetDate: formatDate(subtractDays(leaseEndDate, 30)),
      label: 'Execute',
      actions: [
        'Confirm signed renewal OR begin turn process',
        'If renewed: update lease, file documentation',
        'If turning: coordinate move-out, schedule make-ready, list unit',
        'Ensure no gap in coverage',
      ],
      status: getStatus(subtractDays(leaseEndDate, 30)),
    },
  ];

  return {
    leaseEndDate,
    milestones,
  };
}
