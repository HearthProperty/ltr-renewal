'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface FormData {
  ownerName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  currentRent: string;
  leaseEndDate: string;
  tenantTenure: '< 1 year' | '1-2 years' | '2-3 years' | '3+ years' | '';
  lastRentIncrease: '< 6 months' | '6-12 months' | '12-18 months' | '18+ months' | 'never' | '';
  recentLatePayments: boolean | null;
  recentMaintenanceIssues: boolean | null;
  managementSituation: 'self-managed' | 'have_pm' | '';
  targetOutcome: 'renew' | 'unsure' | 'replace' | '';
}

const TOTAL_STEPS = 4;

export default function RenewalForm() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [form, setForm] = useState<FormData>({
    ownerName: '',
    email: '',
    phone: '',
    propertyAddress: '',
    currentRent: '',
    leaseEndDate: '',
    tenantTenure: '',
    lastRentIncrease: '',
    recentLatePayments: null,
    recentMaintenanceIssues: null,
    managementSituation: '',
    targetOutcome: '',
  });

  const update = (field: keyof FormData, value: string | boolean | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Initialize Google Places Autocomplete when step 2 becomes active
  const initAutocomplete = useCallback(() => {
    if (
      !addressInputRef.current ||
      autocompleteRef.current ||
      typeof google === 'undefined' ||
      !google.maps?.places
    ) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      addressInputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address'],
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        update('propertyAddress', place.formatted_address);
      }
    });
  }, []);

  useEffect(() => {
    if (step === 2) {
      const timer = setTimeout(initAutocomplete, 100);
      return () => clearTimeout(timer);
    } else {
      autocompleteRef.current = null;
    }
  }, [step, initAutocomplete]);

  // --- Step validation ---
  const canAdvance = (): boolean => {
    if (step === 1) {
      return !!(form.ownerName && form.email && form.phone);
    }
    if (step === 2) {
      return !!(form.propertyAddress && form.currentRent && form.leaseEndDate);
    }
    if (step === 3) {
      return !!(
        form.tenantTenure &&
        form.lastRentIncrease &&
        form.recentLatePayments !== null &&
        form.recentMaintenanceIssues !== null
      );
    }
    if (step === 4) {
      return !!(form.managementSituation && form.targetOutcome);
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!canAdvance()) return;
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ownerName: form.ownerName,
        email: form.email,
        phone: form.phone,
        propertyAddress: form.propertyAddress,
        currentRent: parseFloat(form.currentRent),
        leaseEndDate: form.leaseEndDate,
        tenantTenure: form.tenantTenure,
        lastRentIncrease: form.lastRentIncrease,
        recentLatePayments: form.recentLatePayments,
        recentMaintenanceIssues: form.recentMaintenanceIssues,
        managementSituation: form.managementSituation,
        targetOutcome: form.targetOutcome,
      };

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Submission failed');
      }

      // Redirect to results page
      // Use encodeURIComponent + unescape to handle Unicode chars (em dashes, etc.)
      const jsonStr = JSON.stringify({
        score: data.score,
        renewalRange: data.renewalRange,
        comparison: data.comparison,
        calendar: data.calendar,
        whatToDoNow: data.whatToDoNow,
        whatHearthHandles: data.whatHearthHandles,
        input: {
          ownerName: form.ownerName,
          propertyAddress: form.propertyAddress,
          currentRent: parseFloat(form.currentRent),
          leaseEndDate: form.leaseEndDate,
          managementSituation: form.managementSituation,
          targetOutcome: form.targetOutcome,
        },
      });
      const resultData = encodeURIComponent(
        btoa(unescape(encodeURIComponent(jsonStr)))
      );
      window.location.href = `/results?data=${resultData}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  const stepLabels = ['You', 'Property', 'Tenant', 'Situation'];

  return (
    <div className="form-container">
      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
        <div className="progress-steps">
          {stepLabels.map((label, i) => (
            <button
              key={label}
              className={`progress-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}
              onClick={() => step > i + 1 && setStep(i + 1)}
              type="button"
            >
              <span className="step-num">{step > i + 1 ? '✓' : i + 1}</span>
              <span className="step-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: Contact Info */}
      {step === 1 && (
        <div className="form-step" key="step1">
          <h2 className="step-title">Let&apos;s start with you</h2>
          <p className="step-subtitle">We&apos;ll use this to prepare your personalized renewal plan.</p>

          <div className="field-group">
            <label htmlFor="ownerName">Full Name</label>
            <input
              id="ownerName"
              type="text"
              placeholder="Jane Smith"
              value={form.ownerName}
              onChange={(e) => update('ownerName', e.target.value)}
              autoFocus
            />
          </div>

          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 2: Property & Rent */}
      {step === 2 && (
        <div className="form-step" key="step2">
          <h2 className="step-title">About your property</h2>
          <p className="step-subtitle">Rent and lease timing drive the renewal plan.</p>

          <div className="field-group">
            <label htmlFor="propertyAddress">Property Address</label>
            <input
              id="propertyAddress"
              ref={addressInputRef}
              type="text"
              placeholder="1234 Main St, Austin TX 78701"
              value={form.propertyAddress}
              onChange={(e) => update('propertyAddress', e.target.value)}
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="currentRent">Current Monthly Rent</label>
              <div className="input-prefix">
                <span>$</span>
                <input
                  id="currentRent"
                  type="number"
                  placeholder="2,500"
                  value={form.currentRent}
                  onChange={(e) => update('currentRent', e.target.value)}
                />
              </div>
            </div>
            <div className="field-group">
              <label htmlFor="leaseEndDate">Lease End Date</label>
              <input
                id="leaseEndDate"
                type="date"
                value={form.leaseEndDate}
                onChange={(e) => update('leaseEndDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Tenant & History */}
      {step === 3 && (
        <div className="form-step" key="step3">
          <h2 className="step-title">About your tenant</h2>
          <p className="step-subtitle">Helps us assess tenant retention value and renewal urgency.</p>

          <div className="field-group">
            <label>How long has this tenant been in place?</label>
            <div className="toggle-group">
              {(['< 1 year', '1-2 years', '2-3 years', '3+ years'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-btn ${form.tenantTenure === opt ? 'active' : ''}`}
                  onClick={() => update('tenantTenure', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>When was rent last increased?</label>
            <div className="radio-group">
              {(['< 6 months', '6-12 months', '12-18 months', '18+ months', 'never'] as const).map((opt) => (
                <label key={opt} className={`radio-option ${form.lastRentIncrease === opt ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="lastRentIncrease"
                    value={opt}
                    checked={form.lastRentIncrease === opt}
                    onChange={(e) => update('lastRentIncrease', e.target.value)}
                  />
                  <span className="radio-dot" />
                  {opt === 'never' ? 'Never adjusted' : opt + ' ago'}
                </label>
              ))}
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Recent late payments?</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${form.recentLatePayments === true ? 'active' : ''}`}
                  onClick={() => update('recentLatePayments', true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${form.recentLatePayments === false ? 'active' : ''}`}
                  onClick={() => update('recentLatePayments', false)}
                >
                  No
                </button>
              </div>
            </div>
            <div className="field-group">
              <label>Recent maintenance issues?</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${form.recentMaintenanceIssues === true ? 'active' : ''}`}
                  onClick={() => update('recentMaintenanceIssues', true)}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${form.recentMaintenanceIssues === false ? 'active' : ''}`}
                  onClick={() => update('recentMaintenanceIssues', false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Situation */}
      {step === 4 && (
        <div className="form-step" key="step4">
          <h2 className="step-title">Your situation</h2>
          <p className="step-subtitle">This helps us tailor the renewal recommendation.</p>

          <div className="field-group">
            <label>Management situation</label>
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-btn ${form.managementSituation === 'self-managed' ? 'active' : ''}`}
                onClick={() => update('managementSituation', 'self-managed')}
              >
                Self-Managed
              </button>
              <button
                type="button"
                className={`toggle-btn ${form.managementSituation === 'have_pm' ? 'active' : ''}`}
                onClick={() => update('managementSituation', 'have_pm')}
              >
                Have a PM
              </button>
            </div>
          </div>

          <div className="field-group">
            <label>What&apos;s your target outcome for this lease?</label>
            <div className="radio-group">
              <label className={`radio-option ${form.targetOutcome === 'renew' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="targetOutcome"
                  value="renew"
                  checked={form.targetOutcome === 'renew'}
                  onChange={(e) => update('targetOutcome', e.target.value)}
                />
                <span className="radio-dot" />
                Renew — I want to keep this tenant
              </label>
              <label className={`radio-option ${form.targetOutcome === 'unsure' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="targetOutcome"
                  value="unsure"
                  checked={form.targetOutcome === 'unsure'}
                  onChange={(e) => update('targetOutcome', e.target.value)}
                />
                <span className="radio-dot" />
                Unsure — I need to see the numbers
              </label>
              <label className={`radio-option ${form.targetOutcome === 'replace' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="targetOutcome"
                  value="replace"
                  checked={form.targetOutcome === 'replace'}
                  onChange={(e) => update('targetOutcome', e.target.value)}
                />
                <span className="radio-dot" />
                Replace — I want to turn the unit
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className="form-error">{error}</div>}

      {/* Navigation */}
      <div className="form-nav">
        {step > 1 && (
          <button
            type="button"
            className="btn-back"
            onClick={() => setStep(step - 1)}
          >
            ← Back
          </button>
        )}
        <div className="nav-spacer" />
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            className="btn-next"
            disabled={!canAdvance()}
            onClick={() => setStep(step + 1)}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            className="btn-submit"
            disabled={!canAdvance() || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Building Your Plan...' : 'Get My Renewal Plan'}
          </button>
        )}
      </div>
    </div>
  );
}
