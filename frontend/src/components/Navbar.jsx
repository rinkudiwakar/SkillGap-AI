import { useEffect, useRef, useState } from "react";

export default function Navbar({ onGetStarted, onSignIn, session, onSignOut, currentPage, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Pricing", onClick: () => setPage("pricing") },
  ];

  return (
    <>
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="nav-logo" style={{ cursor: "pointer" }} onClick={() => setPage("home")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          SkillGap AI
        </div>

        <ul className="nav-links">
          {navLinks.map((l) =>
            l.onClick ? (
              <li key={l.label}><button onClick={l.onClick} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "var(--text)"} onMouseLeave={e => e.target.style.color = "var(--muted)"}>{l.label}</button></li>
            ) : (
              <li key={l.label}><a href={l.href}>{l.label}</a></li>
            )
          )}
        </ul>

        <div className="nav-actions">
          {session ? (
            <>
              <button className="btn-ghost btn-sm" onClick={onSignOut}>Sign Out</button>
              <button className="btn-primary btn-sm" onClick={() => setPage("app")}>Dashboard →</button>
            </>
          ) : (
            <>
              <button className="btn-ghost btn-sm" onClick={onSignIn}>Sign In</button>
              <button className="btn-primary btn-sm" onClick={onGetStarted}>Get Started Free</button>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-drawer${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)}>
        <div className="mobile-drawer-panel" onClick={e => e.stopPropagation()}>
          <button className="mobile-close" onClick={() => setDrawerOpen(false)}>✕</button>
          <div className="nav-logo" style={{ marginBottom: "1rem" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            SkillGap AI
          </div>
          <ul className="mobile-nav-links">
            {navLinks.map((l) =>
              l.onClick ? (
                <li key={l.label}><a href="#" onClick={(e) => { e.preventDefault(); l.onClick(); setDrawerOpen(false); }}>{l.label}</a></li>
              ) : (
                <li key={l.label}><a href={l.href} onClick={() => setDrawerOpen(false)}>{l.label}</a></li>
              )
            )}
          </ul>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "auto" }}>
            {session ? (
              <button className="btn-primary" onClick={() => { setPage("app"); setDrawerOpen(false); }}>Dashboard →</button>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => { onSignIn(); setDrawerOpen(false); }}>Sign In</button>
                <button className="btn-primary" onClick={() => { onGetStarted(); setDrawerOpen(false); }}>Get Started Free</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
