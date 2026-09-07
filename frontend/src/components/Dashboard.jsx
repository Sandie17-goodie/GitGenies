export function Page({ title, description, action, children }) {
  return <main className="till-page"><div className="page-heading"><div><p className="eyebrow">YOUR SALES WORKSPACE</p><h1>{title}</h1><p className="muted">{description}</p></div>{action || <span className="workspace-label">Point of sale</span>}</div>{children}</main>;
}
export function Panel({ title, badge, children, className = '' }) {
  return <section className={`dashboard-panel ${className}`}><div className="section-heading"><h2>{title}</h2>{badge && <span className="count-badge">{badge}</span>}</div>{children}</section>;
}
export function Notice({ notice }) {
  return notice ? <div className={`notice ${notice.type || 'error'}`} role={notice.type === 'success' ? 'status' : 'alert'}>{notice.text}</div> : null;
}
export function EmptyRow({ columns, children }) {
  return <tr><td colSpan={columns} className="table-empty">{children}</td></tr>;
}
