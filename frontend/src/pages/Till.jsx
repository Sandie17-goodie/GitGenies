import { useRef, useState } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

const money = value => `K${Number(value).toFixed(2)}`;
function SearchIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>;
}
export default function Till() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notice, setNotice] = useState(null);
  const [lastSaleId, setLastSaleId] = useState(null);
  const [busy, setBusy] = useState(false);
  const transactionLock = useRef(false);
  const canVoid = ['STORE_MANAGER', 'ADMIN'].includes(user?.role);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.quantity * Number(item.price), 0);

  async function handleSearch(event) {
    event.preventDefault();
    setSearching(true);
    try {
      setResults(await apiFetch(`/books/?q=${encodeURIComponent(query)}`));
      setSearched(true);
    } catch (error) { setNotice({ type: 'error', text: error.message }); }
    finally { setSearching(false); }
  }
  function addToCart(book) {
    setCart(previous => {
      const existing = previous.find(item => item.isbn === book.isbn);
      if (existing) return previous.map(item => item.isbn === book.isbn ? { ...item, quantity: Math.min(item.quantity + 1, book.quantity_on_hand) } : item);
      return [...previous, { ...book, quantity: 1 }];
    });
  }
  function changeQuantity(isbn, delta) {
    setCart(previous => previous.map(item => item.isbn === isbn ? { ...item, quantity: Math.min(item.quantity_on_hand, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  }
  async function checkout() {
    if (transactionLock.current || !cart.length) return;
    transactionLock.current = true;
    setBusy(true);
    setNotice(null);
    try {
      const sale = await apiFetch('/sales/', { method: 'POST', body: JSON.stringify({ items: cart.map(({ isbn, quantity }) => ({ isbn, quantity })), payment_method: paymentMethod }) });
      setLastSaleId(sale.id);
      setResults(previous => previous.map(book => ({ ...book, quantity_on_hand: Math.max(0, book.quantity_on_hand - (cart.find(item => item.isbn === book.isbn)?.quantity || 0)) })));
      setCart([]);
      setNotice({ type: 'success', text: `Sale #${sale.id} completed. Total: ${money(sale.total_amount)}.` });
    } catch (error) { setNotice({ type: 'error', text: error.message }); }
    finally { transactionLock.current = false; setBusy(false); }
  }
  async function voidLastSale() {
    if (!lastSaleId || transactionLock.current || !canVoid) return;
    transactionLock.current = true;
    setBusy(true);
    try {
      await apiFetch(`/sales/${lastSaleId}/void/`, { method: 'POST' });
      setNotice({ type: 'success', text: `Sale #${lastSaleId} voided. Stock has been restored.` });
      setLastSaleId(null);
      setResults([]);
      setSearched(false);
    } catch (error) { setNotice({ type: 'error', text: error.message }); }
    finally { transactionLock.current = false; setBusy(false); }
  }
  return (
    <main className="till-page">
      <div className="page-heading"><div><p className="eyebrow">YOUR SALES WORKSPACE</p><h1>Till</h1><p className="muted">Find a book, build a cart, and make someone's next great read.</p></div><span className="workspace-label">Point of sale</span></div>
      {notice && <div className={`notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}<button aria-label="Dismiss message" onClick={() => setNotice(null)}>×</button></div>}
      <div className="till-layout">
        <section className="catalog-panel" aria-labelledby="catalog-heading">
          <div className="section-heading"><h2 id="catalog-heading">Book catalog</h2><span className="muted">Search & discover</span></div>
          <form className="search-form" onSubmit={handleSearch}><div className="search-input"><SearchIcon /><input aria-label="Search by ISBN, title, or author" placeholder="Search by ISBN, title, or author" value={query} onChange={event => setQuery(event.target.value)} /></div><button className="primary-button" disabled={searching}>{searching ? 'Searching…' : 'Search'}</button></form>
          <div className="catalog-content" aria-busy={searching}>
            {!results.length ? <div className="empty-state"><span className="empty-icon"><SearchIcon /></span><h3>{searched ? 'No books found' : 'A great read starts here'}</h3><p>{searched ? 'Try a different title, author, or ISBN.' : 'Search the catalog to find books and add them to your cart.'}</p>{!searched && <span className="empty-hint">Tip: leave the search blank to browse all books</span>}</div> : <><div className="results-heading"><span>{results.length} {results.length === 1 ? 'book' : 'books'} found</span><span>Prices in ZMW</span></div><div className="book-list">{results.map(book => {
              const inCart = cart.find(item => item.isbn === book.isbn)?.quantity || 0;
              return <article className="book-row" key={book.isbn}><div className="book-symbol" aria-hidden="true">▤</div><div className="book-details"><h3>{book.title}</h3><p>{book.author}</p><span className="isbn">ISBN {book.isbn}</span><span className={`stock-label ${book.quantity_on_hand === 0 ? 'out-of-stock' : ''}`}>{book.quantity_on_hand > 0 ? `${book.quantity_on_hand} in stock` : 'Out of stock'}</span></div><div className="book-action"><strong>{money(book.price)}</strong><button className="add-button" disabled={busy || inCart >= book.quantity_on_hand} onClick={() => addToCart(book)} aria-label={`Add ${book.title} to cart`}>{book.quantity_on_hand === 0 ? 'Unavailable' : inCart >= book.quantity_on_hand ? 'All added' : '+ Add'}</button></div></article>;
            })}</div></>}
          </div>
        </section>
        <aside className="cart-panel" aria-labelledby="cart-heading"><div className="cart-heading"><h2 id="cart-heading">Current Cart</h2><span className="count-badge">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span></div>
          <div className="cart-table-wrap"><table className="cart-table"><thead><tr><th>Title</th><th>Qty</th><th>Line Total</th></tr></thead><tbody>{cart.map(item => <tr key={item.isbn}><td><strong>{item.title}</strong><span className="unit-price">{money(item.price)} each</span></td><td><div className="quantity-stepper"><button disabled={busy} aria-label={`Decrease quantity of ${item.title}`} onClick={() => changeQuantity(item.isbn, -1)}>−</button><span>{item.quantity}</span><button disabled={busy || item.quantity >= item.quantity_on_hand} aria-label={`Increase quantity of ${item.title}`} onClick={() => changeQuantity(item.isbn, 1)}>+</button></div></td><td>{money(item.quantity * item.price)}</td></tr>)}</tbody></table></div>
          {!cart.length && <div className="cart-empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 3h2l3 12h11l2-8H6M9 19h.01M18 19h.01" strokeLinecap="round" /><circle cx="9" cy="19" r="1" /><circle cx="18" cy="19" r="1" /></svg><h3>Your cart is empty</h3><p>Add a book to get started.</p></div>}
          <div className="cart-footer"><div className="total-row"><span>Total</span><strong aria-live="polite">{money(total)}</strong></div><label className="payment-label" htmlFor="payment-method">Payment method</label><select id="payment-method" disabled={busy} value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)}><option value="CASH">Cash</option><option value="CARD">Card</option></select><button className="primary-button checkout-button" disabled={!cart.length || busy} onClick={checkout}>{busy ? 'Processing…' : 'Checkout'}<span aria-hidden="true">→</span></button><button className="void-button" disabled={!lastSaleId || busy || !canVoid} onClick={voidLastSale}>Void Last Sale</button><p className="cart-note">Voids require a Manager or Admin account.</p></div>
        </aside>
      </div>
    </main>
  );
}
