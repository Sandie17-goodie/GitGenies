// OWNER: Person 5 - Reports & Database (UC5 View Sales Report, UC12 Export CSV)
import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

const BASE_URL = 'http://localhost:8000/api';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/reports/sales-report/').then(setReport).catch(err => setError(err.message));
  }, []);

  // UC12: Export Report (CSV) - hits the export endpoint directly with the auth header
  function exportCsv() {
    const tokens = JSON.parse(localStorage.getItem('pos_tokens') || '{}');
    fetch(`${BASE_URL}/reports/sales-report/export/csv/`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales_report.csv';
        a.click();
      });
  }

  if (error) return <p style={{ color: 'crimson', padding: 20 }}>{error} (Reports require Manager or Admin login)</p>;
  if (!report) return <p style={{ padding: 20 }}>Loading report…</p>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h2>Sales Report (UC5)</h2>
      <p><strong>Total Revenue: K{report.total_revenue}</strong></p>

      <h3>Daily Revenue</h3>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', marginBottom: 20 }}>
        <thead><tr><th>Day</th><th>Total</th></tr></thead>
        <tbody>
          {report.daily_revenue.map(d => <tr key={d.day}><td>{d.day}</td><td>K{d.total}</td></tr>)}
        </tbody>
      </table>

      <h3>Top-Selling Titles</h3>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', marginBottom: 20 }}>
        <thead><tr><th>Title</th><th>Units Sold</th><th>Revenue</th></tr></thead>
        <tbody>
          {report.top_titles.map(t => (
            <tr key={t.book__isbn}><td>{t.book__title}</td><td>{t.units_sold}</td><td>K{t.revenue}</td></tr>
          ))}
        </tbody>
      </table>

      <button onClick={exportCsv}>Export as CSV (UC12)</button>
    </div>
  );
}
