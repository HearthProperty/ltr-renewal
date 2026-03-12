// PDF generation via puppeteer-core + @sparticuz/chromium-min
// Renders a branded Renewal Uplift Plan as PDF on Vercel serverless.

import type {
  ScoreResult,
  RenewalRange,
  TurnVsRenewComparison,
  RenewalCalendar,
} from './types';

interface PDFInput {
  ownerName: string;
  propertyAddress: string;
  currentRent: number;
  leaseEndDate: string;
  managementSituation: string;
  targetOutcome: string;
}

interface PDFData {
  score: ScoreResult;
  renewalRange: RenewalRange;
  comparison: TurnVsRenewComparison;
  calendar: RenewalCalendar;
  whatToDoNow: string[];
  whatHearthHandles: string[];
  input: PDFInput;
}

const fmt = (n: number) => n.toLocaleString('en-US');

/** Build the branded HTML template for the renewal plan PDF */
export function buildRenewalPlanHTML(data: PDFData): string {
  const { score, renewalRange, comparison, calendar, whatToDoNow, whatHearthHandles, input } = data;
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const scoreColor =
    score.scoreClassification === 'immediate' ? '#c0392b' :
    score.scoreClassification === 'high' ? '#e67e22' :
    score.scoreClassification === 'moderate' ? '#f39c12' : '#27ae60';

  const riskColors: Record<string, string> = {
    conservative: '#27ae60',
    moderate: '#e67e22',
    aggressive: '#c0392b',
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      color: #1a1a2e;
      background: #fff;
      padding: 40px;
      font-size: 13px;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      padding-bottom: 16px;
      border-bottom: 2px solid #1a1a2e;
    }
    .brand h1 {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      letter-spacing: -0.5px;
    }
    .brand p {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }
    .date-block {
      text-align: right;
      font-size: 11px;
      color: #666;
    }
    .date-block strong {
      display: block;
      font-size: 13px;
      color: #1a1a2e;
    }
    .property-info {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .property-info .left h3 {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #888;
      margin-bottom: 4px;
    }
    .property-info .left p {
      font-size: 14px;
      font-weight: 600;
    }
    .property-info .right {
      text-align: right;
    }
    .property-info .right .rent {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .property-info .right .label {
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 24px 0 10px;
      color: #1a1a2e;
      page-break-after: avoid;
    }
    .range-box {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 16px 18px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .range-num {
      text-align: center;
      flex: 1;
    }
    .range-num .val {
      font-size: 20px;
      font-weight: 800;
      color: #2d9c6f;
    }
    .range-num .val.current {
      color: #1a1a2e;
    }
    .range-num .lbl {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
      margin-top: 2px;
    }
    .range-arrow {
      font-size: 18px;
      color: #ccc;
    }
    .range-rationale {
      font-size: 12px;
      color: #555;
      line-height: 1.6;
      margin-bottom: 6px;
    }
    .risk-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #fff;
    }
    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
    }
    .comparison-table th {
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
      padding: 6px 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    .comparison-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 12px;
    }
    .comparison-table td:last-child,
    .comparison-table th:last-child {
      text-align: right;
    }
    .comparison-table tr.total td {
      font-weight: 700;
      font-size: 14px;
      border-top: 2px solid #1a1a2e;
      border-bottom: none;
      padding-top: 10px;
    }
    .comparison-table tr.total td:last-child { color: #2d9c6f; }
    .comparison-table tr.rec td:last-child { color: #2d9c6f; }
    .rec-badge {
      background: #2d9c6f;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 2px 6px;
      border-radius: 100px;
      margin-left: 6px;
    }
    .summary-box {
      background: #f0f7ff;
      border-left: 3px solid #3498db;
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
      font-size: 12px;
      color: #444;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .milestone {
      background: #f8f9fa;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .milestone-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .milestone-title {
      font-size: 13px;
      font-weight: 700;
    }
    .milestone-date {
      font-size: 11px;
      color: #888;
    }
    .milestone-status {
      padding: 2px 8px;
      border-radius: 100px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-overdue { background: #fdf0ee; color: #c0392b; }
    .status-due { background: #fef5ec; color: #e67e22; }
    .status-upcoming { background: #edfaf4; color: #237a57; }
    .milestone-actions {
      list-style: none;
      padding: 0;
    }
    .milestone-actions li {
      font-size: 11px;
      padding: 2px 0;
      padding-left: 14px;
      position: relative;
      color: #555;
    }
    .milestone-actions li::before {
      content: '☐';
      position: absolute;
      left: 0;
      color: #aaa;
    }
    .action-list {
      list-style: none;
      padding: 0;
    }
    .action-list li {
      font-size: 12px;
      padding: 5px 0;
      padding-left: 16px;
      position: relative;
      color: #444;
      border-bottom: 1px solid #f5f5f5;
      line-height: 1.5;
    }
    .action-list li:last-child { border-bottom: none; }
    .action-list li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #2d9c6f;
      font-weight: 700;
    }
    .hearth-list {
      list-style: none;
      padding: 0;
      background: #edfaf4;
      border-radius: 6px;
      padding: 12px 16px;
    }
    .hearth-list li {
      font-size: 12px;
      padding: 3px 0;
      padding-left: 16px;
      position: relative;
      color: #237a57;
    }
    .hearth-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #2d9c6f;
      font-weight: 700;
    }
    .score-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 12px 0;
    }
    .score-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 3px solid ${scoreColor};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .score-num {
      font-size: 16px;
      font-weight: 800;
      color: ${scoreColor};
    }
    .score-text {
      font-size: 12px;
      color: #666;
    }
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #e0e0e0;
      font-size: 10px;
      color: #999;
      text-align: center;
    }
    .disclaimer {
      font-size: 9px;
      color: #bbb;
      margin-top: 6px;
      font-style: italic;
    }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>Renewal Uplift Planner</h1>
      <p>Hearth Property Management</p>
    </div>
    <div class="date-block">
      <strong>Renewal Plan</strong>
      ${today}
    </div>
  </div>

  <div class="property-info">
    <div class="left">
      <h3>Property</h3>
      <p>${input.propertyAddress}</p>
    </div>
    <div class="right">
      <div class="rent">$${fmt(input.currentRent)}/mo</div>
      <div class="label">Current Rent</div>
    </div>
  </div>

  <div class="section-title">Recommended Renewal Range</div>
  <div class="range-box">
    <div class="range-num">
      <div class="val current">$${fmt(renewalRange.currentRent)}</div>
      <div class="lbl">Current</div>
    </div>
    <div class="range-arrow">→</div>
    <div class="range-num">
      <div class="val">$${fmt(renewalRange.suggestedLow)}</div>
      <div class="lbl">Low (${renewalRange.suggestedIncreasePercent.low}%)</div>
    </div>
    <div class="range-num">
      <div class="val">$${fmt(renewalRange.suggestedHigh)}</div>
      <div class="lbl">High (${renewalRange.suggestedIncreasePercent.high}%)</div>
    </div>
  </div>
  <p class="range-rationale">${renewalRange.rationale}</p>
  <span class="risk-badge" style="background: ${riskColors[renewalRange.riskLevel] || '#888'}">${renewalRange.riskLevel}</span>

  <div class="section-title">Renew vs. Turn — Annual Impact</div>
  <table class="comparison-table">
    <thead>
      <tr>
        <th></th>
        <th>Renew${comparison.recommendation === 'renew' ? '<span class="rec-badge">REC</span>' : ''}</th>
        <th>Turn${comparison.recommendation === 'turn' ? '<span class="rec-badge">REC</span>' : ''}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Projected Annual Rent</td>
        <td>$${fmt(comparison.renewScenario.projectedAnnualRent)}</td>
        <td>$${fmt(comparison.turnScenario.projectedAnnualRent)}</td>
      </tr>
      <tr>
        <td>Vacancy Cost</td>
        <td>$0</td>
        <td style="color:#c0392b">−$${fmt(comparison.turnScenario.estimatedVacancyCost)}</td>
      </tr>
      <tr>
        <td>Turnover Cost</td>
        <td>$0</td>
        <td style="color:#c0392b">−$${fmt(comparison.turnScenario.estimatedTurnoverCost)}</td>
      </tr>
      <tr class="total">
        <td>Net Annual Outcome</td>
        <td ${comparison.recommendation === 'renew' ? 'style="color:#2d9c6f"' : ''}>$${fmt(comparison.renewScenario.netAnnualOutcome)}</td>
        <td ${comparison.recommendation === 'turn' ? 'style="color:#2d9c6f"' : ''}>$${fmt(comparison.turnScenario.netAnnualOutcome)}</td>
      </tr>
    </tbody>
  </table>
  <div class="summary-box">${comparison.summary}</div>

  <div class="section-title">90/60/30 Renewal Calendar</div>
  ${calendar.milestones.map(m => `
  <div class="milestone">
    <div class="milestone-header">
      <div>
        <span class="milestone-title">${m.daysOut} Days Out — ${m.label}</span>
        <span class="milestone-date">${m.targetDate}</span>
      </div>
      <span class="milestone-status status-${m.status}">${m.status}</span>
    </div>
    <ul class="milestone-actions">
      ${m.actions.map(a => `<li>${a}</li>`).join('\n      ')}
    </ul>
  </div>
  `).join('')}

  <div class="page-break"></div>

  <div class="section-title">What You Should Do Now</div>
  <ul class="action-list">
    ${whatToDoNow.map(item => `<li>${item}</li>`).join('\n    ')}
  </ul>

  <div class="section-title">What Hearth Would Handle for You</div>
  <ul class="hearth-list">
    ${whatHearthHandles.map(item => `<li>${item}</li>`).join('\n    ')}
  </ul>

  <div class="score-row">
    <div class="score-circle">
      <span class="score-num">${score.leadScore}</span>
    </div>
    <div class="score-text">
      Renewal urgency: <strong style="color:${scoreColor}">${score.scoreClassification.charAt(0).toUpperCase() + score.scoreClassification.slice(1)}</strong><br>
      Primary concern: ${score.primaryProblem}
    </div>
  </div>

  <div class="footer">
    <p>Hearth Property Management &middot; hearthproperty.com</p>
    <p class="disclaimer">
      This renewal plan provides directional guidance based on your inputs. It is not a market rent
      estimate, legal recommendation, or guarantee of specific outcomes. Final rent and renewal
      decisions should reflect local market conditions, lease terms, and applicable regulations.
    </p>
  </div>
</body>
</html>`;
}

/** Generate PDF buffer from HTML using puppeteer-core */
export async function generatePDF(html: string): Promise<Uint8Array> {
  // Dynamic imports for serverless compatibility
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const chromium = (await import('@sparticuz/chromium-min' as any)).default as any;
  const puppeteer = await import('puppeteer-core');

  const browser = await puppeteer.default.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport ?? { width: 1200, height: 800 },
    executablePath: await chromium.executablePath(
      'https://github.com/nicholasgasior/chromium-arm64/releases/download/v131.0.6778.264/chromium-v131.0.6778.264-pack.tar'
    ),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });

    return new Uint8Array(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export type { PDFData };
