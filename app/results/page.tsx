'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type {
  ScoreResult,
  RenewalRange,
  TurnVsRenewComparison,
  RenewalCalendar,
} from '@/lib/types';

interface ResultInput {
  ownerName: string;
  email: string;
  propertyAddress: string;
  currentRent: number;
  leaseEndDate: string;
  managementSituation: string;
  targetOutcome: string;
}

interface ResultData {
  score: ScoreResult;
  renewalRange: RenewalRange;
  comparison: TurnVsRenewComparison;
  calendar: RenewalCalendar;
  whatToDoNow: string[];
  whatHearthHandles: string[];
  input: ResultInput;
}

function ResultsContent() {
  const searchParams = useSearchParams();

  const dataParam = searchParams.get('data');
  if (!dataParam) {
    return (
      <div className="results-error">
        <h2>No results found</h2>
        <p>Please complete the Renewal Uplift Planner form first.</p>
        <a href="/" className="btn-primary">Start Over</a>
      </div>
    );
  }

  let data: ResultData;
  try {
    data = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(dataParam)))));
  } catch {
    return (
      <div className="results-error">
        <h2>Invalid results data</h2>
        <p>The results link appears to be corrupted.</p>
        <a href="/" className="btn-primary">Start Over</a>
      </div>
    );
  }

  const { score, renewalRange, comparison, calendar, whatToDoNow, whatHearthHandles, input } = data;

  const fmt = (n: number) => n.toLocaleString('en-US');

  // Build Calendly URL with prefill params
  const calendlyParams = new URLSearchParams({
    name: input.ownerName,
    email: input.email || '',
    a1: input.propertyAddress,
  });
  const calendlyUrl = `https://calendly.com/hearthproperty/30min?${calendlyParams.toString()}`;

  const scoreColor =
    score.scoreClassification === 'immediate' ? '#ef4444' :
    score.scoreClassification === 'high' ? '#f97316' :
    score.scoreClassification === 'moderate' ? '#eab308' : '#22c55e';

  return (
    <div className="results-page">
      {/* Header */}
      <header className="results-header">
        <div className="results-brand">
          <h1>Renewal Uplift Planner</h1>
          <p>Hearth Property Management</p>
        </div>
      </header>

      {/* Hero */}
      <section className="results-hero">
        <div className="hero-label">Recommended Renewal Range</div>
        <div className="hero-amount">
          ${fmt(renewalRange.suggestedLow)} – ${fmt(renewalRange.suggestedHigh)}/mo
        </div>
        <div className="hero-sublabel">
          {renewalRange.suggestedIncreasePercent.low}–{renewalRange.suggestedIncreasePercent.high}% increase
          from ${fmt(renewalRange.currentRent)}/mo at {input.propertyAddress}
        </div>
      </section>

      {/* Renewal Range Details */}
      <section className="results-section">
        <h2 className="section-heading">Renewal Range Recommendation</h2>
        <div className="range-card">
          <div className="range-numbers">
            <div className="range-stat">
              <div className="range-value">${fmt(renewalRange.currentRent)}</div>
              <div className="range-label">Current Rent</div>
            </div>
            <div className="range-arrow">→</div>
            <div className="range-stat">
              <div className="range-value highlight">${fmt(renewalRange.suggestedLow)}</div>
              <div className="range-label">Low ({renewalRange.suggestedIncreasePercent.low}%)</div>
            </div>
            <div className="range-divider" />
            <div className="range-stat">
              <div className="range-value highlight">${fmt(renewalRange.suggestedHigh)}</div>
              <div className="range-label">High ({renewalRange.suggestedIncreasePercent.high}%)</div>
            </div>
          </div>
          <p className="range-rationale">{renewalRange.rationale}</p>
          <span className={`range-badge ${renewalRange.riskLevel}`}>{renewalRange.riskLevel}</span>
        </div>
      </section>

      {/* Turn vs Renew Comparison */}
      <section className="results-section">
        <h2 className="section-heading">Renew vs. Turn — Annual Impact</h2>
        <div className="comparison-grid">
          <div className={`comparison-card ${comparison.recommendation === 'renew' ? 'recommended' : ''}`}>
            <span className="comparison-badge">Recommended</span>
            <div className="comparison-label">{comparison.renewScenario.label}</div>
            <div className="comparison-amount">${fmt(comparison.renewScenario.netAnnualOutcome)}</div>
            <div className="comparison-sublabel">Net Annual Outcome</div>
            <div className="comparison-details">
              <div className="comparison-detail">
                <span>Projected Annual Rent</span>
                <span>${fmt(comparison.renewScenario.projectedAnnualRent)}</span>
              </div>
              <div className="comparison-detail">
                <span>Vacancy Cost</span>
                <span>$0</span>
              </div>
              <div className="comparison-detail">
                <span>Turnover Cost</span>
                <span>$0</span>
              </div>
            </div>
            <ul className="comparison-pros">
              {comparison.renewScenario.pros.map((pro) => (
                <li key={pro}>{pro}</li>
              ))}
            </ul>
          </div>

          <div className={`comparison-card ${comparison.recommendation === 'turn' ? 'recommended' : ''}`}>
            <span className="comparison-badge">Recommended</span>
            <div className="comparison-label">{comparison.turnScenario.label}</div>
            <div className="comparison-amount">${fmt(comparison.turnScenario.netAnnualOutcome)}</div>
            <div className="comparison-sublabel">Net Annual Outcome</div>
            <div className="comparison-details">
              <div className="comparison-detail">
                <span>Projected Annual Rent</span>
                <span>${fmt(comparison.turnScenario.projectedAnnualRent)}</span>
              </div>
              <div className="comparison-detail">
                <span>Vacancy Cost</span>
                <span>−${fmt(comparison.turnScenario.estimatedVacancyCost)}</span>
              </div>
              <div className="comparison-detail">
                <span>Turnover Cost</span>
                <span>−${fmt(comparison.turnScenario.estimatedTurnoverCost)}</span>
              </div>
            </div>
            <ul className="comparison-pros">
              {comparison.turnScenario.pros.map((pro) => (
                <li key={pro}>{pro}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="comparison-summary">{comparison.summary}</div>
      </section>

      {/* 90/60/30 Calendar */}
      <section className="results-section">
        <h2 className="section-heading">90/60/30 Renewal Calendar</h2>
        <div className="calendar-timeline">
          <div className="calendar-line" />
          {calendar.milestones.map((milestone) => (
            <div key={milestone.daysOut} className={`milestone ${milestone.status}`}>
              <div className="milestone-dot" />
              <div className="milestone-header">
                <div>
                  <div className="milestone-title">{milestone.daysOut} Days Out — {milestone.label}</div>
                  <div className="milestone-date">{milestone.targetDate}</div>
                </div>
                <span className={`milestone-status ${milestone.status}`}>
                  {milestone.status}
                </span>
              </div>
              <ul className="milestone-actions">
                {milestone.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* What You Should Do Now */}
      <section className="results-section">
        <h2 className="section-heading">What You Should Do Now</h2>
        <div className="action-card">
          <ul className="action-list">
            {whatToDoNow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* What Hearth Would Handle */}
      <section className="results-section">
        <h2 className="section-heading">What Hearth Would Handle for You</h2>
        <ul className="hearth-grid">
          {whatHearthHandles.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Score (subtle) */}
      <section className="results-section score-section">
        <div className="score-badge" style={{ borderColor: scoreColor }}>
          <span className="score-number" style={{ color: scoreColor }}>{score.leadScore}</span>
          <span className="score-max">/{score.maxScore}</span>
        </div>
        <div>
          <p className="score-desc">
            Renewal urgency: <strong style={{ color: scoreColor }}>
              {score.scoreClassification.charAt(0).toUpperCase() + score.scoreClassification.slice(1)}
            </strong>
          </p>
          <p className="score-desc" style={{ fontSize: '0.82rem', marginTop: '2px' }}>
            Primary concern: {score.primaryProblem}
          </p>
        </div>
      </section>

      <section className="results-actions">

        <div className="cta-block">
          <h2>Let Hearth handle this renewal.</h2>
          <p>
            Your renewal plan is clear. Hearth can execute the entire process — tenant
            communication, rent adjustment, turn planning, and lease execution.
            You approve the strategy. We handle the rest.
          </p>
          <div className="cta-buttons">
            <a
              href={calendlyUrl}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a Renewal Strategy Call
            </a>
            <a
              href="https://app.hearthproperty.com/onboarding"
              className="btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Let Hearth Handle This Renewal →
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="results-disclaimer">
        This renewal plan provides directional guidance based on your inputs. It is not a market rent
        estimate, legal recommendation, or guarantee of specific outcomes. Final rent and renewal
        decisions should reflect local market conditions, lease terms, and applicable regulations.
      </div>

      {/* Footer */}
      <footer className="results-footer">
        <p>© {new Date().getFullYear()} Hearth Property Management</p>
      </footer>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="results-loading">
        <div className="loading-spinner" />
        <p>Loading your renewal plan...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
