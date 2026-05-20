export default function WordCount({ text }) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const cls = words > 100 ? "ok" : words > 30 ? "" : "warn";
  const msg = words === 0 ? "" : words > 100 ? `${words} words — Good JD length ✓` : `${words} words — paste more for better results`;
  return msg ? <div className={`word-count ${cls}`}>{msg}</div> : null;
}
