import { useEffect, useRef, useState } from "react";

export default function Navbar({ onGetStarted, onSignIn, session, onSignOut, currentPage, setPage }) {
  const [scrolled, setScrolled]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "Home",         onClick: () => setPage("home") },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing",      href: "#pricing" },
    { label: "FAQ",          href: "#faq" },
  ];

  return (
    <>
      {/* ── Main Navbar ── */}
      <nav
        className="stitch-nav"
        style={{ background: scrolled ? "rgba(13,14,15,0.96)" : "rgba(13,14,15,0.82)" }}
      >
        {/* Logo + nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div className="stitch-nav-logo" onClick={() => setPage("home")}>
            <span>Skillgap AI</span>
            <span className="stitch-nav-logo-sub">Resume Intelligence</span>
          </div>

          <ul className="stitch-nav-links">
            {navLinks.map((l) =>
              l.onClick ? (
                <li key={l.label}>
                  <button onClick={l.onClick}>{l.label}</button>
                </li>
              ) : (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Right actions */}
        <div className="stitch-nav-actions">
          {session ? (
            <>
              <button
                style={{ background: "none", border: "none", color: "var(--text-2)", cursor: "pointer", fontSize: "0.875rem", fontFamily: "var(--font-sans)" }}
                onClick={onSignOut}
              >
                Sign Out
              </button>
              <button className="stitch-btn-primary" style={{ padding: "8px 18px", fontSize: "0.875rem", borderRadius: 8 }} onClick={() => setPage("app")}>
                Dashboard <i className="ti ti-arrow-right" />
              </button>
            </>
          ) : (
            <>
              <button
                style={{ background: "none", border: "none", color: "var(--text-2)", cursor: "pointer", fontSize: "0.875rem", fontFamily: "var(--font-sans)", padding: "8px 14px" }}
                onClick={onSignIn}
              >
                Sign In
              </button>
              <button className="stitch-btn-primary" style={{ padding: "8px 18px", fontSize: "0.875rem", borderRadius: 8 }} onClick={onGetStarted}>
                Analyse My Resume <i className="ti ti-arrow-right" />
              </button>
            </>
          )}
        </div>

        {/* Hamburger (mobile) */}
        <button
          className="hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          style={{ display: "none" }}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div className={`mobile-drawer${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)}>
        <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
          <button className="mobile-close" onClick={() => setDrawerOpen(false)}>✕</button>
          <div className="stitch-nav-logo" style={{ marginBottom: "1.5rem" }}>
            <span>Skillgap AI</span>
          </div>
          <ul className="mobile-nav-links">
            {navLinks.map((l) =>
              l.onClick ? (
                <li key={l.label}>
                  <a href="#" onClick={(e) => { e.preventDefault(); l.onClick(); setDrawerOpen(false); }}>
                    {l.label}
                  </a>
                </li>
              ) : (
                <li key={l.label}>
                  <a href={l.href} onClick={() => setDrawerOpen(false)}>{l.label}</a>
                </li>
              )
            )}
          </ul>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "auto" }}>
            {session ? (
              <button className="stitch-btn-primary" onClick={() => { setPage("app"); setDrawerOpen(false); }}>
                Dashboard <i className="ti ti-arrow-right" />
              </button>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => { onSignIn(); setDrawerOpen(false); }}>Sign In</button>
                <button className="stitch-btn-primary" onClick={() => { onGetStarted(); setDrawerOpen(false); }}>
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
