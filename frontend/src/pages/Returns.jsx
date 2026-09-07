import { useRef, useState } from 'react';
import { apiFetch } from '../api/client';
import { Page, Panel, Notice } from '../components/Dashboard';

export default function Returns() {
  const [saleId, setSaleId] = useState('');
  const [isbn, setIsbn] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  async function handleSubmit(event) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setNotice(null);
    try {
      const result = await apiFetch('/returns/', { method: 'POST', body: JSON.stringify({ sale_id: Number(saleId), items: [{ isbn, quantity: Number(quantity) }], reason }) });
      setNotice({ type: 'success', text: `Return #${result.id} processed. Refund: K${Number(result.refund_amount).toFixed(2)}.` });
      setSaleId(''); setIsbn(''); setQuantity(1); setReason('');
    } catch (error) { setNotice({ text: error.message }); }
    finally { pending.current = false; setBusy(false); }
  }
  return <Page title="Returns" description="Process book returns and keep every refund connected to its original sale."><Notice notice={notice} /><div className="dashboard-split"><Panel title="Return details" badge="New return"><form className="dashboard-form" onSubmit={handleSubmit}><div className="form-grid"><label htmlFor="return-sale">Original sale ID<input id="return-sale" type="number" min="1" required placeholder="e.g. 1024" value={saleId} onChange={event => setSaleId(event.target.value)} /></label><label htmlFor="return-quantity">Quantity<input id="return-quantity" type="number" min="1" required value={quantity} onChange={event => setQuantity(event.target.value)} /></label></div><label htmlFor="return-isbn">Book ISBN<input id="return-isbn" required placeholder="Enter the ISBN of the returned book" value={isbn} onChange={event => setIsbn(event.target.value)} /></label><label htmlFor="return-reason">Reason for return<textarea id="return-reason" required maxLength={255} rows={4} placeholder="Describe why the book is being returned" value={reason} onChange={event => setReason(event.target.value)} /></label><div className="form-actions"><span className="muted">Check the details before processing.</span><button className="primary-button" disabled={busy}>{busy ? 'Processing…' : 'Process Return'}</button></div></form></Panel><Panel title="Before you process"><div className="panel-body"><ol className="guidance-list"><li><strong>Find the original sale</strong><p>Use the sale ID from the original transaction.</p></li><li><strong>Check the returned book</strong><p>Match its ISBN and confirm the quantity being returned.</p></li><li><strong>Record the reason</strong><p>The refund uses the original sale price. Returned books are added back to stock.</p></li></ol></div></Panel></div></Page>;
}
