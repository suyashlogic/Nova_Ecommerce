import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import OrderTimeline from '../components/OrderTimeline';
import OrderTotals from '../components/OrderTotals';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import Skeleton from '../components/Skeleton';
import LoadingSpinner from '../components/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import useToast from '../hooks/useToast';
import { cancelOrder, getOrder } from '../services/orderService';
import formatCurrency from '../utils/formatCurrency';
import formatDateTime from '../utils/formatDateTime';
import imageUrl from '../utils/imageUrl';

const PAYMENT_LABELS = { card: 'Card (demo)', upi: 'UPI (demo)', cod: 'Cash on delivery' };

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();
  const { data: order, loading, error, reload } = useFetch(() => getOrder(id), [id]);

  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  usePageTitle(order ? `Order ${order.orderRef}` : 'Order');

  // Set by Checkout right after a successful purchase (step 5: confirmation)
  const justPlaced = location.state?.justPlaced === true;

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelOrder(id);
      toast.success('Order cancelled');
      setConfirming(false);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="container page-section" aria-hidden="true">
        <Skeleton height={40} width="40%" className="mb-4" />
        <Skeleton height={90} radius="20px" className="mb-3" />
        <Skeleton height={260} radius="20px" />
      </div>
    );
  }

  if (error) {
    const notFound = error.status === 404 || error.status === 422;
    return (
      <div className="container page-section">
        {notFound ? (
          <EmptyState icon="search" title="Order not found" message="This order does not exist or does not belong to your account." action={{ to: '/orders', label: 'Back to my orders' }} />
        ) : (
          <ErrorState title="Unable to load this order" message={error.message} onRetry={reload} />
        )}
      </div>
    );
  }

  const { shipping } = order;

  return (
    <div className="container page-section" style={{ maxWidth: 960 }}>
      {/* ---- Step 5: confirmation ---- */}
      {justPlaced && (
        <section className="confirm-banner" role="status">
          <div className="confirm-icon"><Icon name="check" size={28} /></div>
          <h1>Thank you, your order is placed!</h1>
          <p>Your order reference is</p>
          <div className="confirm-ref">{order.orderRef}</div>
          <p className="text-muted-nova mb-4">Keep it handy. You can follow progress right here at any time.</p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Link to="/orders" className="btn btn-nova-dark">View all orders</Link>
            <Link to="/shop" className="btn btn-nova-outline">Continue shopping</Link>
          </div>
        </section>
      )}

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          {!justPlaced && <Link to="/orders" className="text-muted-nova small">&larr; All orders</Link>}
          <h2 className="mb-1 mt-1">Order {order.orderRef}</h2>
          <div className="text-muted-nova">Placed on {formatDateTime(order.createdAt)}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <section className="nova-card nova-card-pad mb-4">
        <h3 className="h6 text-uppercase text-muted-nova mb-3">Progress</h3>
        <OrderTimeline status={order.status} />
      </section>

      <div className="row g-4">
        <div className="col-lg-7">
          <section className="nova-card nova-card-pad">
            <h3 className="h6 text-uppercase text-muted-nova mb-3">Items</h3>
            <ul className="detail-items">
              {order.items.map((item) => (
                <li key={item.id}>
                  <img src={imageUrl(item.imageUrl)} alt="" loading="lazy" />
                  <div className="flex-grow-1">
                    {item.productId ? <Link to={`/products/${item.productId}`} className="fw-medium text-reset">{item.name}</Link> : <span className="fw-medium">{item.name}</span>}
                    <div className="text-muted-nova small">{formatCurrency(item.unitPrice)} &times; {item.quantity}</div>
                  </div>
                  <div className="fw-semibold">{formatCurrency(item.lineTotal)}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="col-lg-5">
          <section className="nova-card nova-card-pad mb-4">
            <h3 className="h6 text-uppercase text-muted-nova mb-3">Payment summary</h3>
            <OrderTotals subtotal={order.subtotal} tax={order.tax} shippingFee={order.shippingFee} total={order.total} />
            <div className="text-muted-nova small">Paid with: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</div>
          </section>

          <section className="nova-card nova-card-pad">
            <h3 className="h6 text-uppercase text-muted-nova mb-3">Shipping to</h3>
            <address className="address-block mb-0">
              <strong>{shipping.name}</strong><br />
              {shipping.line1}<br />
              {shipping.line2 && <>{shipping.line2}<br /></>}
              {shipping.city}, {shipping.state} {shipping.postalCode}<br />
              {shipping.country}<br />
              <span className="text-muted-nova">{shipping.phone}</span>
            </address>
          </section>
        </div>
      </div>

      {/* Admins may open any order, but the customer-side cancel only works for the owner. Admins change status in /admin/orders. */}
      {order.canCancel && order.userId === user.id && (
        <div className="mt-4">
          {!confirming ? (
            <button type="button" className="btn btn-nova-outline" onClick={() => setConfirming(true)}>Cancel order</button>
          ) : (
            <div className="alert alert-danger d-flex flex-wrap align-items-center gap-3 mb-0" role="alert">
              <span className="me-auto">Cancel this order? The items go back into stock.</span>
              <button type="button" className="btn btn-nova-dark btn-sm" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <LoadingSpinner inline label="Cancelling" /> : 'Yes, cancel order'}
              </button>
              <button type="button" className="btn btn-nova-outline btn-sm" onClick={() => setConfirming(false)} disabled={cancelling}>Keep order</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
