export default function WorkspaceTopbar({
  stats,
  profile,
  displayName,
  avatarLabel,
  session,
  accountMenuOpen,
  onToggleAccountMenu,
  onGoHome,
  onUploadAvatar,
  onOpenProfile,
  onSignOut,
  avatarInputRef,
  onAvatarChange,
}) {
  return (
    <header className="topbar">
      <button className="topbar-logo" type="button" onClick={onGoHome}>
        <span className="logo-dot" />
        SkillGap AI
      </button>
      <div className="topbar-actions">
        <div className="chip-stack" aria-label="Workspace totals">
          {stats.map((stat) => (
            <span className="chip" key={stat.label}>
              <strong>{stat.value}</strong> {stat.label}
            </span>
          ))}
        </div>
        <div className="account-menu">
          <button className="account-trigger" onClick={onToggleAccountMenu} type="button" aria-expanded={accountMenuOpen}>
            <span className="account-avatar">
              {profile.profile_picture_url ? <img src={profile.profile_picture_url} alt="" /> : avatarLabel}
            </span>
            <span className="account-name">{displayName}</span>
            <span className="account-caret">v</span>
          </button>
          {accountMenuOpen && (
            <div className="account-dropdown">
              <div className="account-card-head">
                <span className="account-avatar large">
                  {profile.profile_picture_url ? <img src={profile.profile_picture_url} alt="" /> : avatarLabel}
                </span>
                <div>
                  <strong>{displayName}</strong>
                  <span>{session.user.email}</span>
                </div>
              </div>
              <button type="button" onClick={onUploadAvatar}>Upload profile picture</button>
              <button type="button" onClick={onOpenProfile}>Profile settings</button>
              <button type="button" onClick={onGoHome}>Go to homepage</button>
              <button type="button" className="danger" onClick={onSignOut}>Sign out</button>
            </div>
          )}
          <input ref={avatarInputRef} type="file" accept="image/*" onChange={onAvatarChange} style={{ display: "none" }} />
        </div>
      </div>
    </header>
  );
}
