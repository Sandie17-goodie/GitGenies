// OWNER: Person 4 - Inventory (UC4 Update Inventory, UC8 Generate Low-Stock Alert)
import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export default function Inventory() {
  const [stock, setStock] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState('');

  async function loadAll() {
    try {
      const [stockData, alertData] = await Promise.all([
        apiFetch('/stock/'),
        apiFetch('/alerts/'),
      ]);
      setStock(stockData);
      setAlerts(alertData);
    } catch (err) {
      setMessage(err.message);
    }
  }

  useEffect(() => { loadAll(); }, []);

  // UC4: Update Inventory
  async function adjust(entryId, delta) {
    const reason = window.prompt(`Reason for ${delta > 0 ? 'adding' : 'removing'} ${Math.abs(delta)} unit(s)?`);
    if (!reason) return;
    setMessage('');
    try {
      await apiFetch(`/stock/${entryId}/adjust/`, {
        method: 'POST',
        body: JSON.stringify({ delta, reason }),
      });
      await loadAll();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h2>Inventory</h2>

      {alerts.length > 0 && (
        <div style={{ background: '#fff3cd', padding: 10, marginBottom: 16, border: '1px solid #ffe08a' }}>
          <strong>Low-Stock Alerts (UC8):</strong>
          <ul>
            {alerts.map(a => <li key={a.id}>{a.title} ({a.isbn})</li>)}
          </ul>
        </div>
      )}

      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th>Title</th><th>ISBN</th><th>Qty on Hand</th><th>Reorder Threshold</th><th>Actions</th></tr></thead>
        <tbody>
          {stock.map(s => (
            <tr key={s.id}>
              <td>{s.title}</td>
              <td>{s.isbn}</td>
              <td>{s.quantity_on_hand}</td>
              <td>{s.reorder_threshold}</td>
              <td>
                <button onClick={() => adjust(s.id, 1)}>+1</button>
                <button onClick={() => adjust(s.id, -1)} style={{ marginLeft: 6 }}>-1</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {message && <p style={{ marginTop: 12, color: 'crimson' }}>{message}</p>}
    </div>
  );
}
