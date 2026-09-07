import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import { Page, Panel, Notice, EmptyRow } from '../components/Dashboard';
const money = value => `K${Number(value).toFixed(2)}`;
export default function Reports() {
  const [report, setReport] = useState(null);
  const [notice, setNotice] = useState(null);
  const [exporting, setExporting] = useState(false);
  useEffect(() => { apiFetch('/reports/sales-report/').then(setReport).catch(error => setNotice({ text: `${error.message} Reports require a Manager or Admin account.` })); }, []);
  async function exportCsv() {
    setExporting(true); setNotice(null);
    try {
      const blob = await apiFetch('/reports/sales-report/export/csv/');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'sales_report.csv'; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setNotice({ text: error.message }); }
    finally { setExporting(false); }
  }
  return <Page title="Reports" description="Review sales performance and discover your bestselling books." action={<button className="primary-button" disabled={!report || exporting} onClick={exportCsv}>{exporting ? 'Exporting…' : 'Export CSV'}</button>}><Notice notice={notice} />{report ? <><div className="summary-grid"><div className="summary-card featured"><span>Total revenue</span><strong>{money(report.total_revenue)}</strong><p>Completed sales · all time</p></div><div className="summary-card"><span>Sales days</span><strong>{report.daily_revenue.length}</strong><p>Days with completed sales</p></div><div className="summary-card"><span>Top-selling title</span><strong className="summary-title">{report.top_titles[0]?.book__title || 'No sales yet'}</strong><p>{report.top_titles[0] ? `${report.top_titles[0].units_sold} units sold` : 'Your next sale starts the story'}</p></div></div><div className="report-grid"><Panel title="Daily revenue" badge="All time"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Date</th><th className="numeric">Revenue</th></tr></thead><tbody>{report.daily_revenue.map(day => <tr key={day.day}><td>{new Date(`${day.day}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</td><td className="numeric"><strong>{money(day.total)}</strong></td></tr>)}{!report.daily_revenue.length && <EmptyRow columns={2}>Daily revenue will appear after your first sale.</EmptyRow>}</tbody></table></div></Panel><Panel title="Top-selling titles" badge="Top 10"><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Book</th><th className="numeric">Units sold</th><th className="numeric">Revenue</th></tr></thead><tbody>{report.top_titles.map(title => <tr key={title.book__isbn}><td><strong>{title.book__title}</strong><span className="table-subtitle">{title.book__isbn}</span></td><td className="numeric">{title.units_sold}</td><td className="numeric"><strong>{money(title.revenue)}</strong></td></tr>)}{!report.top_titles.length && <EmptyRow columns={3}>Your bestselling books will appear here.</EmptyRow>}</tbody></table></div></Panel></div></> : !notice && <div className="loading-card" role="status">Loading sales report…</div>}</Page>;
}
