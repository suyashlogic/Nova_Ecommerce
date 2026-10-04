import OrderCard from '../components/OrderCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import { listOrders } from '../services/orderService';

export default function Orders() {
  usePageTitle('My orders');
  const { data: orders, loading, error, reload } = useFetch(listOrders, []);

  return (
    <div className="container page-section" style={{ maxWidth: 900 }}>
      <h1 className="page-title">My orders</h1>
      <p className="page-subtitle">Track what you have ordered.</p>

      {loading && (
        <div aria-hidden="true">
          {[1, 2, 3].map((n) => <Skeleton key={n} height={170} radius="20px" className="mb-3" />)}
        </div>
      )}

      {error && <ErrorState title="Unable to load orders" message={error.message} onRetry={reload} />}

      {!loading && !error && orders.length === 0 && (
        <EmptyState icon="package" title="You have no orders yet." message="When you place an order it will show up here." action={{ to: '/shop', label: 'Start shopping' }} />
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
