import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import useCart from '../hooks/useCart';
import useAuth from '../hooks/useAuth';
import usePageTitle from '../hooks/usePageTitle';
import formatCurrency from '../utils/formatCurrency';

export default function Cart() {
  usePageTitle('Your cart');
  const { user } = useAuth();
  const { items, summary, adjustments, loading, error, busy, updateQuantity, removeItem, reload, dismissAdjustments } = useCart();

  if (loading) {
    return (
      <div className="container page-section">
        <h1 className="page-title">Your cart</h1>
        <div className="row g-4 mt-2" aria-hidden="true">
          <div className="col-lg-8"><Skeleton height={130} radius="20px" className="mb-3" /><Skeleton height={130} radius="20px" /></div>
          <div className="col-lg-4"><Skeleton height={300} radius="20px" /></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container page-section">
        <ErrorState title="Unable to load your cart" message={error.message} onRetry={reload} />
      </div>
    );
  }

  const taxPercent = Math.round(summary.taxRate * 100);
  const freeShippingProgress = summary.freeShippingThreshold
    ? Math.min(100, (summary.subtotal / summary.freeShippingThreshold) * 100)
    : 0;

  return (
    <div className="container page-section">
      <h1 className="page-title">Your cart</h1>
      <p className="page-subtitle">
        {items.length === 0 ? 'Nothing here yet.' : `${summary.itemCount} ${summary.itemCount === 1 ? 'item' : 'items'} ready for checkout.`}
      </p>

      {/* Notices such as "Only 2 left. Quantity was reduced" */}
      {adjustments.length > 0 && (
        <div className="alert alert-warning d-flex justify-content-between gap-3" role="alert">
          <ul className="mb-0 ps-3">{adjustments.map((a, i) => <li key={`${a.productId}-${i}`}>{a.message}</li>)}</ul>
          <button type="button" className="btn-close" aria-label="Dismiss notice" onClick={dismissAdjustments} />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon="cart" title="Your cart is empty." message="Browse the collection and add something you like." action={{ to: '/shop', label: 'Continue shopping' }} />
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="cart-list">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} busy={busy} onQuantityChange={updateQuantity} onRemove={removeItem} />
              ))}
            </div>
            <Link to="/shop" className="btn btn-nova-ghost mt-3">&larr; Continue shopping</Link>
          </div>

          <div className="col-lg-4">
            <aside className="nova-card nova-card-pad cart-summary" aria-label="Order summary">
              <h2 className="h5 mb-3">Order summary</h2>

              {summary.amountToFreeShipping > 0 ? (
                <div className="ship-note">
                  <span>Add <strong>{formatCurrency(summary.amountToFreeShipping)}</strong> more for free shipping</span>
                  <div className="ship-progress" role="progressbar" aria-valuenow={Math.round(freeShippingProgress)} aria-valuemin="0" aria-valuemax="100">
                    <div style={{ width: `${freeShippingProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="ship-note ship-note-done">You have unlocked free shipping.</div>
              )}

              <dl className="summary-rows">
                <div><dt>Subtotal</dt><dd>{formatCurrency(summary.subtotal)}</dd></div>
                <div><dt>Tax ({taxPercent}%)</dt><dd>{formatCurrency(summary.tax)}</dd></div>
                <div><dt>Shipping</dt><dd>{summary.shippingFee === 0 ? 'Free' : formatCurrency(summary.shippingFee)}</dd></div>
                <div className="summary-total"><dt>Total</dt><dd>{formatCurrency(summary.total)}</dd></div>
              </dl>

              {/* Guests are sent to login first by ProtectedRoute, then straight back to checkout */}
              <Link to="/checkout" className={`btn btn-nova-primary btn-lg w-100 ${busy ? 'disabled' : ''}`}>Checkout</Link>
              {!user && (
                <p className="field-hint text-center mt-3 mb-0">
                  You will be asked to <Link to="/login" state={{ from: { pathname: '/checkout' } }}>sign in</Link> first. Your cart is saved to your account.
                </p>
              )}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
