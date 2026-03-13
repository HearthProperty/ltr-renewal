// Discord notification — fire-and-forget.
// If this fails, we log the error but never block the lead submission.

import { config } from './config';
import { daysUntilLeaseEnd } from './scoring';
import type { FormInput, ScoreResult } from './types';

export async function sendLeadNotification(
  input: FormInput,
  score: ScoreResult,
  resultUrl: string
): Promise<boolean> {
  try {
    const mgmtLabel = input.managementSituation === 'self-managed' ? 'Self-managed' : 'Has a PM';
    const daysLeft = daysUntilLeaseEnd(input.leaseEndDate);
    const scoreEmoji = score.scoreClassification === 'immediate' ? '🔴' :
      score.scoreClassification === 'high' ? '🟠' :
      score.scoreClassification === 'moderate' ? '🟡' : '🟢';

    // Truncate result URL for Discord (field values max 1024 chars)
    const displayUrl = resultUrl.length > 900
      ? config.site.url
      : resultUrl;

    const embed = {
      title: '🔄 New Renewal Lead',
      color: 3066993, // Hearth-aligned green
      fields: [
        { name: 'Lead Magnet', value: 'Renewal Uplift Planner', inline: true },
        { name: 'Owner', value: input.ownerName || 'N/A', inline: true },
        { name: 'Email', value: input.email || 'N/A', inline: true },
        { name: 'Phone', value: input.phone || 'N/A', inline: true },
        { name: 'Property', value: input.propertyAddress || 'N/A', inline: false },
        { name: 'Current Rent', value: `$${input.currentRent.toLocaleString()}/mo`, inline: true },
        { name: 'Lease End', value: input.leaseEndDate, inline: true },
        { name: 'Days Left', value: `${daysLeft} days`, inline: true },
        { name: 'Manager', value: mgmtLabel, inline: true },
        { name: 'Target', value: input.targetOutcome, inline: true },
        { name: 'Score', value: `${scoreEmoji} ${score.leadScore}/${score.maxScore} — ${score.scoreClassification}`, inline: true },
        { name: 'Primary Problem', value: score.primaryProblem, inline: true },
        { name: 'Result', value: `[View Renewal Plan](${displayUrl})`, inline: false },
      ],
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(config.discord.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Discord] Webhook failed:', response.status, errorText);
      return false;
    }

    console.log('[Discord] Lead notification sent successfully');
    return true;
  } catch (error) {
    console.error('[Discord] Webhook error:', error);
    return false;
  }
}
