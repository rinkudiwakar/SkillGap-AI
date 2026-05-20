export default function DashboardTabs({ tabs, activeTab, onChange }) {
  return (
    <nav className="dash-tabs" aria-label="Workspace sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`dash-tab${activeTab === tab.id ? " active" : ""}`}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
