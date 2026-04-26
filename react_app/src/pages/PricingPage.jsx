export default function PricingPage({ onGetStarted }) {
  return (
    <div>
      <section className="section" style={{ paddingTop: "8rem" }}>
        <h2 className="section-title">Simple, transparent pricing</h2>
        <p className="section-sub">Start free, upgrade when you're ready.</p>
        <div className="pricing-grid">
          <div className="pricing-card">
            <span className="badge badge-muted">Free</span>
            <div className="price-amount">₹0</div>
            <div className="price-period">Forever free · No credit card</div>
            <ul className="price-features">
              <li>1 analysis per day</li>
              <li>No account required</li>
              <li>Resume & JD matching</li>
              <li>Skill gap report</li>
              <li>AI bullet rewriter</li>
              <li>Alternate job titles</li>
            </ul>
            <button className="btn-primary" style={{ width: "100%" }} onClick={onGetStarted}>Get Started Free →</button>
          </div>
          <div className="pricing-card featured">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="badge badge-indigo">Pro</span>
              <span className="badge badge-amber">Coming Soon</span>
            </div>
            <div className="price-amount">₹299</div>
            <div className="price-period">per month · billed monthly</div>
            <ul className="price-features">
              <li>Unlimited analyses</li>
              <li>Save analysis history</li>
              <li>Application tracker</li>
              <li>Match history dashboard</li>
              <li>Cover letter generator</li>
              <li>Priority processing</li>
              <li>ATS score checker</li>
              <li>AI Resume Writer</li>
            </ul>
            <button className="btn-ghost" style={{ width: "100%", opacity: 0.7, cursor: "not-allowed" }} disabled>Coming Soon</button>
            <p style={{ fontSize: "0.78rem", color: "var(--muted)", textAlign: "center", marginTop: "0.75rem" }}>Be the first to know when Pro launches</p>
          </div>
        </div>
      </section>
    </div>
  );
}
