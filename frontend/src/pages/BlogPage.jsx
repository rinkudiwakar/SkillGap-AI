const POSTS = [
  {
    slug: "how-ats-filters-work",
    tag: "ATS & Resume",
    date: "May 6, 2026",
    title: "How ATS Systems Actually Filter Your Resume (And How to Beat Them)",
    summary: "Most candidates think ATS means keyword stuffing. The reality is more nuanced — and understanding it gives you a real edge over 90% of applicants.",
    readTime: "6 min read",
    emoji: "🤖",
  },
  {
    slug: "skill-gap-vs-experience-gap",
    tag: "Career Strategy",
    date: "May 2, 2026",
    title: "The Difference Between a Skill Gap and an Experience Gap — and Why It Matters",
    summary: "Many candidates fail interviews not because they lack skills, but because they can't demonstrate relevant experience. Here's how to tell the difference and address both.",
    readTime: "5 min read",
    emoji: "📊",
  },
  {
    slug: "indian-resume-mistakes",
    tag: "Resume Writing",
    date: "Apr 27, 2026",
    title: "7 Resume Mistakes Indian Developers Make That Get Them Filtered Instantly",
    summary: "From objective statements that say nothing to project descriptions that read like a changelog — these are the patterns that silently kill your applications.",
    readTime: "7 min read",
    emoji: "📄",
  },
  {
    slug: "semantic-similarity-explained",
    tag: "Behind the AI",
    date: "Apr 20, 2026",
    title: "How SkillGap AI Computes Your Match Score — Semantic Similarity Explained",
    summary: "We don't count keywords. We compute meaning. This is a plain-English explanation of how sentence-transformers and cosine similarity work under the hood.",
    readTime: "8 min read",
    emoji: "🧠",
  },
  {
    slug: "job-description-signals",
    tag: "Career Strategy",
    date: "Apr 14, 2026",
    title: "Reading Between the Lines: What Job Descriptions Actually Signal About a Role",
    summary: "\"Must have 5 years of experience with a 3-year-old technology\" — decoding what JDs really mean and how to respond strategically.",
    readTime: "5 min read",
    emoji: "🔍",
  },
  {
    slug: "rewriting-bullets",
    tag: "Resume Writing",
    date: "Apr 8, 2026",
    title: "How to Rewrite Your Resume Bullets to Match Any JD in Under 30 Minutes",
    summary: "The formula is simple: Result + Action + Context + Metric. Here's a step-by-step walkthrough with before/after examples from real Indian tech resumes.",
    readTime: "9 min read",
    emoji: "✍️",
  },
];

const TAG_COLORS = {
  "ATS & Resume":     "badge-red",
  "Career Strategy":  "badge-indigo",
  "Resume Writing":   "badge-amber",
  "Behind the AI":    "badge-green",
};

export default function BlogPage() {
  return (
    <div style={{ paddingTop: "5rem", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg,rgba(99,102,241,0.08),transparent)", borderBottom: "1px solid var(--border)", padding: "4rem 2rem 3rem" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: "0.75rem" }}>SkillGap AI Blog</div>
          <h1 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", marginBottom: "1rem" }}>
            Career intelligence, resume strategy,<br />and the AI behind the score
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
            Practical advice for Indian job seekers — written by people who have seen both sides of the hiring table.
          </p>
        </div>
      </div>

      {/* Post grid */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "4rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="panel"
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem", cursor: "pointer", transition: "border-color 200ms, transform 200ms" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ fontSize: "2rem" }}>{post.emoji}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span className={`badge ${TAG_COLORS[post.tag] || "badge-muted"}`}>{post.tag}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--hint)" }}>{post.date}</span>
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.45 }}>{post.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.7, flex: 1 }}>{post.summary}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--hint)" }}>{post.readTime}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 600 }}>Read →</span>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className="panel" style={{ maxWidth: 560, margin: "3rem auto 0", textAlign: "center", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>📬</div>
          <h3 style={{ marginBottom: "0.4rem" }}>Get new posts in your inbox</h3>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            No spam. One email per week with career tips and SkillGap AI updates.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input type="email" placeholder="you@example.com" style={{ flex: 1, height: 40, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "0 0.875rem", color: "var(--text)", fontSize: "0.8125rem" }} />
            <button className="btn-primary" style={{ flexShrink: 0 }}>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}
