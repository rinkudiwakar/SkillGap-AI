export default function Footer({ setPage }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="nav-logo" onClick={() => setPage("home")} style={{ cursor: "pointer", marginBottom: "0.75rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            SkillGap AI
          </div>
          <p>AI-powered resume intelligence for the Indian job market. Know your exact chances before you apply.</p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            {[["Twitter", "𝕏"], ["LinkedIn", "in"], ["GitHub", "⭙"]].map(([label, icon]) => (
              <a key={label} href="#" aria-label={label} style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", color: "var(--muted)", transition: "border-color 0.2s, color 0.2s" }} onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>{icon}</a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setPage("pricing"); }}>Pricing</a></li>
            <li><a href="#demo">Product Demo</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setPage("app"); }}>Dashboard →</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Legal & Trust</h4>
          <ul>
            <li><a href="#" onClick={e => { e.preventDefault(); setPage("legal-terms"); }}>Terms & Conditions</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setPage("legal-privacy"); }}>Privacy Policy</a></li>
            <li><a href="#" onClick={e => { e.preventDefault(); setPage("legal-data"); }}>Data Handling Policy</a></li>
            <li><a href="mailto:legal@skillgap.ai">legal@skillgap.ai</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About</a></li>
            <li><a href="mailto:hello@skillgap.ai">Contact Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <span>© 2026 SkillGap AI · Built by Rinku Diwakar · Bengaluru, India</span>
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          <a href="#" onClick={e => { e.preventDefault(); setPage("legal-privacy"); }} style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.78rem" }}>Privacy</a>
          <a href="#" onClick={e => { e.preventDefault(); setPage("legal-terms"); }} style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.78rem" }}>Terms</a>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>No resume data stored after session</span>
        </div>
      </div>
    </footer>
  );
}
