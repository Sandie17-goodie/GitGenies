// OWNER: Person 3 - Sales & Checkout (UC3 Handle Return / Refund)
import { useState } from 'react';
import { apiFetch } from '../api/client';

export default function Returns() {
  const [saleId, setSaleId] = useState('');
  const [isbn, setIsbn] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        sale_id: Number(saleId),
        items: [{ isbn, quantity: Number(quantity) }],
        reason,
      };
      const ret = await apiFetch('/returns/', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(`Return #${ret.id} processed. Refund: K${ret.refund_amount}`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h2>Returns / Refunds</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Original Sale ID</label><br />
          <input value={saleId} onChange={e => setSaleId(e.target.value)} style={{ width: '100%', padding: 6 }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>ISBN being returned</label><br />
          <input value={isbn} onChange={e => setIsbn(e.target.value)} style={{ width: '100%', padding: 6 }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Quantity</label><br />
          <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', padding: 6 }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Reason</label><br />
          <input value={reason} onChange={e => setReason(e.target.value)} style={{ width: '100%', padding: 6 }} />
        </div>
        <button type="submit">Process Return</button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
