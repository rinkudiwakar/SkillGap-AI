/* ══════════════════════════════════════════
   STITCH FOOTER — SkillGap AI v3
   Source: Stitch "Skillgap AI - Refined Brand Landing Page"
   Props preserved: setPage, session
══════════════════════════════════════════ */
export default function Footer({ setPage, session }) {
  const go = (page) => (e) => { e.preventDefault(); window.scrollTo(0, 0); setPage(page); };

  const productLinks = [
    { label: "Resume Audit",  onClick: go("how-it-works") },
    { label: "Skill Lab",     onClick: go("features") },
    { label: "API",           href: "#" },
    { label: "Pricing",       href: "#pricing" },
    { label: "Dashboard →",   onClick: (e) => { e.preventDefault(); session ? setPage("app") : setPage("auth"); } },
  ];

  const legalLinks = [
    { label: "Privacy Policy",      onClick: go("legal-privacy") },
    { label: "Terms of Service",    onClick: go("legal-terms") },
    { label: "Data Handling Policy", onClick: go("legal-data") },
  ];

  const companyLinks = [
    { label: "About Us", onClick: go("about") },
    { label: "Contact",  href: "mailto:hello@skillgap.ai" },
    { label: "Blog",     onClick: go("blog") },
  ];

  return (
    <footer className="stitch-footer">
      <div className="stitch-footer-inner">
        {/* Brand */}
        <div className="stitch-footer-brand">
          <span className="stitch-footer-brand-name" onClick={() => setPage("home")}>
            Skillgap AI
          </span>
          <p>The clinical standard for resume intelligence and skill gap analysis.</p>
          <span className="stitch-footer-version">v2.4.0-stable</span>
        </div>

        {/* Product */}
        <div className="stitch-footer-col">
          <div className="stitch-footer-col-head">PRODUCT</div>
          <ul>
            {productLinks.map((l) => (
              <li key={l.label}>
                {l.onClick
                  ? <a href="#" onClick={l.onClick}>{l.label}</a>
                  : <a href={l.href}>{l.label}</a>
                }
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="stitch-footer-col">
          <div className="stitch-footer-col-head">LEGAL</div>
          <ul>
            {legalLinks.map((l) => (
              <li key={l.label}>
                <a href="#" onClick={l.onClick}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="stitch-footer-col">
          <div className="stitch-footer-col-head">COMPANY</div>
          <ul>
            {companyLinks.map((l) => (
              <li key={l.label}>
                {l.href
                  ? <a href={l.href}>{l.label}</a>
                  : <a href="#" onClick={l.onClick}>{l.label}</a>
                }
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="stitch-footer-bottom">
        <div className="stitch-footer-copy">© 2026 SKILLGAP AI. ALL RIGHTS RESERVED.</div>
        <div className="stitch-footer-zero">
          <i className="ti ti-lock" />
          NO DATA STORED. ZERO PERSISTENCE MODEL ACTIVE.
        </div>
      </div>
    </footer>
  );
}
