import RenewalForm from './components/RenewalForm';

export default function HomePage() {
  return (
    <main className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">Renewal Uplift Planner</div>
          <h1>Should You Renew This Tenant or Turn the Unit?</h1>
          <p className="hero-sub">
            Get a free renewal plan with a raise recommendation, turn-vs-renew
            comparison, and exact next steps — before the timeline decides for you.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="form-section" id="planner">
        <RenewalForm />
      </section>

      {/* Trust strip */}
      <section className="trust-strip">
        <div className="trust-inner">
          <div className="trust-item">
            <span className="trust-icon">📅</span>
            <div>
              <strong>90/60/30 Calendar</strong>
              <p>Know exactly what to do at every renewal milestone</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">📊</span>
            <div>
              <strong>Renew vs Turn</strong>
              <p>See the real financial impact of each decision</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🤲</span>
            <div>
              <strong>Hands-Free</strong>
              <p>Hearth handles the renewal — you approve the strategy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Hearth Property Management</p>
      </footer>
    </main>
  );
}
