import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api/client';
import { Page, Panel, Notice, EmptyRow } from '../components/Dashboard';

export default function Inventory() {
  const [stock, setStock] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustment, setAdjustment] = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  useEffect(() => {
    let active = true;
    Promise.all([apiFetch('/stock/'), apiFetch('/alerts/')]).then(([entries, warnings]) => { if (active) { setStock(entries); setAlerts(warnings); } }).catch(error => { if (active) setNotice({ text: error.message }); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function adjust(event) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; setBusy(true); setNotice(null);
    try {
      await apiFetch(`/stock/${adjustment.entry.id}/adjust/`, { method: 'POST', body: JSON.stringify({ delta: adjustment.delta, reason }) });
      setAdjustment(null); setReason('');
      const [entries, warnings] = await Promise.all([apiFetch('/stock/'), apiFetch('/alerts/')]);
      setStock(entries); setAlerts(warnings);
      setNotice({ type: 'success', text: 'Stock adjustment saved.' });
    } catch (error) { setNotice({ text: error.message }); }
    finally { pending.current = false; setBusy(false); }
  }
  return <Page title="Inventory" description="Keep your shelves stocked and manage book quantities in one place."><Notice notice={notice} /><div className="summary-grid"><div className="summary-card"><span>Catalog titles</span><strong>{loading ? '—' : stock.length}</strong><p>Books tracked in inventory</p></div><div className="summary-card"><span>Units on hand</span><strong>{loading ? '—' : stock.reduce((sum, entry) => sum + entry.quantity_on_hand, 0)}</strong><p>Total available stock</p></div><div className="summary-card"><span>Low-stock alerts</span><strong>{loading ? '—' : alerts.length}</strong><p>Titles needing attention</p></div></div>{alerts.length > 0 && <div className="stock-alert"><strong>Low stock · {alerts.length} {alerts.length === 1 ? 'title' : 'titles'}</strong><p>{alerts.map(alert => alert.title).join(' · ')}</p></div>}{adjustment && <Panel title={`Adjust stock: ${adjustment.entry.title}`} className="adjustment-panel"><form className="dashboard-form" onSubmit={adjust}><p className="muted">{adjustment.delta > 0 ? 'Add' : 'Remove'} 1 unit. Include a reason for the stock history.</p><label htmlFor="adjust-reason">Adjustment reason<input id="adjust-reason" autoFocus required maxLength={255} value={reason} onChange={event => setReason(event.target.value)} placeholder="e.g. New delivery or damaged copy" /></label><div className="button-group"><button className="primary-button" disabled={busy}>{busy ? 'Saving…' : 'Save Adjustment'}</button><button type="button" className="secondary-button" disabled={busy} onClick={() => setAdjustment(null)}>Cancel</button></div></form></Panel>}<Panel title="Stock overview" badge={`${stock.length} titles`}><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Book</th><th>ISBN</th><th>On hand</th><th>Reorder at</th><th>Adjust stock</th></tr></thead><tbody>{stock.map(entry => <tr key={entry.id}><td><strong>{entry.title}</strong></td><td className="identifier">{entry.isbn}</td><td><span className={`status-badge ${entry.quantity_on_hand <= entry.reorder_threshold ? 'warning' : 'positive'}`}>{entry.quantity_on_hand} units</span></td><td>{entry.reorder_threshold} units</td><td><div className="button-group"><button className="table-button" disabled={busy} aria-label={`Add one ${entry.title}`} onClick={() => { setAdjustment({ entry, delta: 1 }); setReason(''); }}>+1</button><button className="table-button" disabled={busy || entry.quantity_on_hand <= 0} aria-label={`Remove one ${entry.title}`} onClick={() => { setAdjustment({ entry, delta: -1 }); setReason(''); }}>−1</button></div></td></tr>)}{!stock.length && <EmptyRow columns={5}>{loading ? 'Loading inventory…' : notice ? 'Inventory could not be loaded.' : 'No inventory entries yet.'}</EmptyRow>}</tbody></table></div></Panel></Page>;
}
