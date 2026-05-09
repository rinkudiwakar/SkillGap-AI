import { useState } from "react";

const SECTIONS = ["terms", "privacy", "data"];

const CONTENT = {
  terms: {
    title: "Terms & Conditions",
    updated: "April 25, 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: `By accessing or using SkillGap AI ("Service"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Service. These terms apply to all visitors, users, and others who access the Service.`,
      },
      {
        heading: "2. Description of Service",
        body: `SkillGap AI provides AI-powered resume analysis, job description matching, skill gap identification, resume bullet rewriting, and alternate job title suggestions. The Service is provided "as is" for informational and career assistance purposes only.`,
      },
      {
        heading: "3. User Accounts",
        body: `You may use core features without an account. Creating an account allows you to save analysis history and track applications. You are responsible for maintaining the confidentiality of your credentials and all activities under your account.`,
      },
      {
        heading: "4. Acceptable Use",
        body: `You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to any portion of the Service; (c) transmit viruses or any malicious code; (d) scrape, crawl, or use automated means to extract data; (e) impersonate any person or entity.`,
      },
      {
        heading: "5. Intellectual Property",
        body: `The Service and its original content, features, and functionality are and will remain the exclusive property of SkillGap AI and its licensors. Our trademarks may not be used in connection with any product or service without prior written consent.`,
      },
      {
        heading: "6. Disclaimer of Warranties",
        body: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding accuracy, reliability, or suitability for a particular purpose. Hiring probability scores are estimates, not guarantees of employment outcomes.`,
      },
      {
        heading: "7. Limitation of Liability",
        body: `To the maximum extent permitted by law, SkillGap AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill resulting from your use of, or inability to use, the Service.`,
      },
      {
        heading: "8. Changes to Terms",
        body: `We reserve the right to modify these terms at any time. We will notify users of significant changes via email or a prominent notice on the Service. Continued use after changes constitutes acceptance of the new terms.`,
      },
      {
        heading: "9. Governing Law",
        body: `These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.`,
      },
      {
        heading: "10. Contact",
        body: `For questions about these Terms, contact us at: legal@skillgap.ai`,
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "April 25, 2026",
    sections: [
      {
        heading: "1. Information We Collect",
        body: `We collect: (a) Account information (name, email) when you register; (b) Resume text and job descriptions you submit for analysis — these are processed transiently and not stored permanently after your session unless you explicitly save an analysis; (c) Usage data such as feature interactions and analysis counts (anonymized); (d) Technical data such as browser type, IP address, and device information.`,
      },
      {
        heading: "2. How We Use Your Information",
        body: `We use collected information to: (a) Provide and improve the Service; (b) Generate AI-powered analysis results; (c) Send transactional emails (e.g., account confirmation); (d) Analyze usage patterns to improve features; (e) Prevent fraud and ensure security.`,
      },
      {
        heading: "3. Resume Data Handling",
        body: `Resume text submitted for analysis is processed ephemerally — it is sent to our AI pipeline, analysed, and the raw text is not stored on our servers beyond the analysis session. Only structured result data (match scores, skills) is saved to your account history if you are logged in and choose to save.`,
      },
      {
        heading: "4. Data Sharing",
        body: `We do not sell, trade, or rent your personal information to third parties. We may share data with: (a) Service providers necessary to operate the platform (e.g., Supabase for database hosting); (b) Law enforcement when required by law; (c) Successors in the event of a merger or acquisition, with prior notice.`,
      },
      {
        heading: "5. Cookies",
        body: `We use essential cookies required for authentication and session management. We do not use third-party tracking cookies. You can disable cookies in your browser settings, but this may affect Service functionality.`,
      },
      {
        heading: "6. Data Retention",
        body: `Account data is retained while your account is active. Match history is retained until you delete it or close your account. Resume text submitted without an account is purged immediately after analysis. You may request deletion of all your data at any time.`,
      },
      {
        heading: "7. Your Rights",
        body: `You have the right to: (a) Access your personal data; (b) Correct inaccurate data; (c) Delete your account and data; (d) Export your data in a portable format; (e) Object to processing. Contact privacy@skillgap.ai to exercise these rights.`,
      },
      {
        heading: "8. Security",
        body: `We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), secure database hosting, and access controls. No method of electronic transmission is 100% secure, and we cannot guarantee absolute security.`,
      },
      {
        heading: "9. Children's Privacy",
        body: `The Service is not directed to individuals under 13. We do not knowingly collect personal information from children. If you become aware of any such data, please contact us immediately.`,
      },
      {
        heading: "10. Contact",
        body: `For privacy questions or data requests: privacy@skillgap.ai`,
      },
    ],
  },
  data: {
    title: "Data Handling Policy",
    updated: "April 25, 2026",
    sections: [
      {
        heading: "1. What Data Flows Through SkillGap AI",
        body: `When you submit a resume and job description, the following data flows through our system: (a) Resume text (extracted from PDF or pasted); (b) Job description text or URL; (c) Your User ID (if logged in). This data is sent to our FastAPI analysis pipeline hosted on secure infrastructure.`,
      },
      {
        heading: "2. AI Processing",
        body: `Your resume and job description are processed by our sentence-transformer models to generate embeddings and compute semantic similarity. This processing happens on our own infrastructure. We do not send your data to third-party LLMs like OpenAI or Anthropic for the core matching functionality.`,
      },
      {
        heading: "3. What Is Stored",
        body: `If you are logged in and an analysis completes: structured result data (match score, skills found/missing, job role) is saved to your account. Raw resume text is NOT stored in our database after analysis. If you are not logged in, nothing is stored — all data is discarded after the response is returned to your browser.`,
      },
      {
        heading: "4. Third-Party Services",
        body: `We use the following third-party services: (a) Supabase — database hosting (EU/US data centers, SOC 2 compliant); (b) Vercel — frontend hosting (CDN, no data storage); (c) Google Fonts — font loading (no user data transmitted). We evaluate all vendors for compliance before integration.`,
      },
      {
        heading: "5. Data Minimization",
        body: `We practice data minimization: we only store what is necessary to provide the Service. Match results store structured fields (scores, skill lists) — not raw text. User profiles store only name and email. We do not build behavioral profiles or sell data.`,
      },
      {
        heading: "6. Data Residency",
        body: `Database infrastructure is hosted via Supabase. Data may be stored in servers located within India, the EU, or the US depending on your selected project region. We default to infrastructure nearest to India for our primary users.`,
      },
      {
        heading: "7. Breach Notification",
        body: `In the event of a data breach that may affect your personal information, we will notify affected users within 72 hours of becoming aware of the breach, in accordance with applicable data protection regulations.`,
      },
      {
        heading: "8. Right to Deletion",
        body: `You can delete your account and all associated data at any time from your profile settings. Upon deletion, all match history, application records, and profile data are permanently removed within 30 days. Resume text, if ever transiently stored, is purged within 24 hours.`,
      },
      {
        heading: "9. Contact the Data Team",
        body: `For data handling enquiries: data@skillgap.ai\nFor urgent data deletion requests: Expect response within 48 hours.`,
      },
    ],
  },
};

export default function LegalPage({ initialSection = "terms" }) {
  const [active, setActive] = useState(initialSection);
  const content = CONTENT[active];

  return (
    <div style={{ paddingTop: "5rem", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg,rgba(99,102,241,0.08),transparent)", borderBottom: "1px solid var(--border)", padding: "3rem 2rem 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>Legal & Compliance</div>
          <h1 style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", marginBottom: "2rem" }}>Transparency. Trust. No surprises.</h1>
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setActive(s)} style={{ padding: "0.75rem 1.5rem", fontWeight: 600, fontSize: "0.9rem", borderBottom: `2px solid ${active === s ? "var(--accent)" : "transparent"}`, color: active === s ? "var(--accent)" : "var(--muted)", whiteSpace: "nowrap", background: "none", transition: "color 0.2s", marginBottom: "-1px" }}>
                {CONTENT[s].title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.8rem" }}>{content.title}</h2>
          <span style={{ fontSize: "0.8rem", color: "var(--muted)", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.4rem 0.8rem" }}>Last updated: {content.updated}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {content.sections.map((sec, i) => (
            <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "1.75rem 0" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text)" }}>{sec.heading}</h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.9, fontSize: "0.92rem", whiteSpace: "pre-line" }}>{sec.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "3rem", padding: "2rem", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px", display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          {[["Terms", "legal@skillgap.ai"], ["Privacy", "privacy@skillgap.ai"], ["Data", "data@skillgap.ai"]].map(([label, email]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{label} Enquiries</div>
              <a href={`mailto:${email}`} style={{ color: "var(--accent)", fontWeight: 600, fontSize: "0.9rem" }}>{email}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
