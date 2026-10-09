import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import useFetch from '../../hooks/useFetch';
import usePageTitle from '../../hooks/usePageTitle';
import { getStats } from '../../services/adminService';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

export default function AdminDashboard() {
  usePageTitle('Dashboard | Admin');
  const { data, loading, error, reload } = useFetch(getStats, []);

  return (
    <>
      <h1 className="admin-title">Dashboard</h1>
      <p className="text-muted-nova mb-4">A quick look at the store.</p>

      {loading && (
        <div className="stat-grid" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => <Skeleton key={n} height={96} radius="20px" />)}
        </div>
      )}

      {error && <ErrorState title="Unable to load the dashboard" message={error.message} onRetry={reload} />}

      {data && (
        <>
          <div className="stat-grid">
            <StatCard icon="package" label="Total products" value={data.totals.products} />
            <StatCard icon="users" label="Total users" value={data.totals.users} />
            <StatCard icon="cart" label="Total orders" value={data.totals.orders} hint={`${data.totals.pendingOrders} pending`} />
            <StatCard icon="trendUp" label="Total revenue" value={formatCurrency(data.totals.revenue)} hint="Cancelled orders excluded" tone="success" />
          </div>

          {data.totals.lowStockProducts > 0 && (
            <div className="alert alert-warning mt-4 mb-0 d-flex flex-wrap justify-content-between gap-2" role="status">
              <span>{data.totals.lowStockProducts} {data.totals.lowStockProducts === 1 ? 'product has' : 'products have'} {data.lowStockLimit} or fewer units left.</span>
              <Link to="/admin/products">Manage inventory</Link>
            </div>
          )}

          <section className="admin-card mt-4">
            <div className="admin-card-head">
              <h2 className="h5 mb-0">Recent orders</h2>
              <Link to="/admin/orders" className="section-link">View all</Link>
            </div>
            {data.recentOrders.length === 0 ? (
              <EmptyState icon="package" title="No orders yet." message="Orders will appear here as customers check out." />
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="text-end">Total</th></tr></thead>
                  <tbody>
                    {data.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td><Link to={`/orders/${order.id}`} className="fw-medium">{order.orderRef}</Link></td>
                        <td>{order.customer.name}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td><StatusBadge status={order.status} /></td>
                        <td className="text-end">{formatCurrency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
