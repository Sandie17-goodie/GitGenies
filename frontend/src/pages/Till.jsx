// OWNER: Person 3 - Sales & Checkout (UC1 Process Sale, UC3 Return, UC17 Void)
// Also uses Person 2's search endpoint (UC2) to find items to add to the cart.
import { useState } from 'react';
import { apiFetch } from '../api/client';

export default function Till() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]); // [{isbn, title, price, quantity}]
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [message, setMessage] = useState('');
  const [lastSaleId, setLastSaleId] = useState(null);

  // --- UC2: Search Book by ISBN (Person 2's endpoint) ---
  async function handleSearch(e) {
    e.preventDefault();
    setMessage('');
    try {
      const data = await apiFetch(`/books/?q=${encodeURIComponent(query)}`);
      setResults(data);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function addToCart(book) {
    setCart(prev => {
      const existing = prev.find(i => i.isbn === book.isbn);
      if (existing) {
        return prev.map(i => i.isbn === book.isbn ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { isbn: book.isbn, title: book.title, price: book.price, quantity: 1 }];
    });
  }

  const total = cart.reduce((sum, i) => sum + i.quantity * Number(i.price), 0);

  // --- UC1: Process Sale ---
  async function checkout() {
    setMessage('');
    try {
      const payload = {
        items: cart.map(i => ({ isbn: i.isbn, quantity: i.quantity })),
        payment_method: paymentMethod,
      };
      const sale = await apiFetch('/sales/', { method: 'POST', body: JSON.stringify(payload) });
      setLastSaleId(sale.id);
      setMessage(`Sale #${sale.id} completed. Total: K${sale.total_amount}`);
      setCart([]);
    } catch (err) {
      setMessage(err.message);
    }
  }

  // --- UC17: Void/Cancel Transaction (requires Manager/Admin login to actually succeed server-side) ---
  async function voidLastSale() {
    if (!lastSaleId) return;
    setMessage('');
    try {
      await apiFetch(`/sales/${lastSaleId}/void/`, { method: 'POST' });
      setMessage(`Sale #${lastSaleId} voided.`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h2>Till — Process Sale</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input
          placeholder="Search by ISBN, title, or author"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ padding: 8, width: 320 }}
        />
        <button type="submit" style={{ padding: 8, marginLeft: 8 }}>Search</button>
      </form>

      {results.length > 0 && (
        <table border="1" cellPadding="6" style={{ marginBottom: 20, borderCollapse: 'collapse' }}>
          <thead><tr><th>Title</th><th>ISBN</th><th>Price</th><th>In Stock</th><th></th></tr></thead>
          <tbody>
            {results.map(b => (
              <tr key={b.isbn}>
                <td>{b.title}</td>
                <td>{b.isbn}</td>
                <td>K{b.price}</td>
                <td>{b.quantity_on_hand}</td>
                <td><button onClick={() => addToCart(b)} disabled={b.quantity_on_hand <= 0}>Add</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Cart</h3>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', minWidth: 400 }}>
        <thead><tr><th>Title</th><th>Qty</th><th>Line Total</th></tr></thead>
        <tbody>
          {cart.map(i => (
            <tr key={i.isbn}>
              <td>{i.title}</td>
              <td>{i.quantity}</td>
              <td>K{(i.quantity * i.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p><strong>Total: K{total.toFixed(2)}</strong></p>

      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
        <option value="CASH">Cash</option>
        <option value="CARD">Card</option>
      </select>
      <button onClick={checkout} disabled={cart.length === 0} style={{ marginLeft: 8 }}>Checkout</button>
      <button onClick={voidLastSale} disabled={!lastSaleId} style={{ marginLeft: 8 }}>Void Last Sale (Manager/Admin only)</button>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  );
}
