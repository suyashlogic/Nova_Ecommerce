import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/Pagination';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Skeleton from '../../components/Skeleton';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import usePageTitle from '../../hooks/usePageTitle';
import useToast from '../../hooks/useToast';
import { listAdminOrders, updateOrderStatus } from '../../services/adminService';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const PAGE_SIZE = 10;
const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const label = (status) => status.charAt(0).toUpperCase() + status.slice(1);

export default function AdminOrders() {
  usePageTitle('Orders | Admin');
  const toast = useToast();

  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [pendingCancel, setPendingCancel] = useState(null); // { order }

  useEffect(() => setPage(1), [status, debouncedSearch]);

  const { data, loading, error, reload } = useFetch(
    () => listAdminOrders({ status: status || undefined, search: debouncedSearch || undefined, page, limit: PAGE_SIZE }),
    [status, debouncedSearch, page]
  );

  async function applyStatus(order, nextStatus) {
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, nextStatus);
      toast.success(`${order.orderRef} is now ${nextStatus}`);
      reload();
    } catch (err) {
      toast.error(err.message);
      reload(); // the order may have changed elsewhere; show the truth
    } finally {
      setUpdatingId(null);
      setPendingCancel(null);
    }
  }

  function handleSelect(order, nextStatus) {
    if (nextStatus === order.status) return;
    // Cancelling returns stock and cannot be undone, so ask first
    if (nextStatus === 'cancelled') setPendingCancel(order);
    else applyStatus(order, nextStatus);
  }

  return (
    <>
      <h1 className="admin-title">Orders</h1>
      <p className="text-muted-nova mb-4">Review orders and move them through fulfilment.</p>

      <div className="admin-toolbar">
        <input type="search" className="form-control" placeholder="Search by reference, name or email" aria-label="Search orders" value={search} onChange={(e) => setSearch(e.target.value)} maxLength={100} />
        <select className="form-select w-auto" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
      </div>

      <section className="admin-card">
        {loading && <div className="p-3" aria-hidden="true">{[1, 2, 3, 4, 5].map((n) => <Skeleton key={n} height={52} className="mb-2" />)}</div>}
        {error && <ErrorState title="Unable to load orders" message={error.message} onRetry={reload} />}
        {!loading && !error && data.orders.length === 0 && <EmptyState icon="package" title="No orders found." message="Try a different search or status." />}

        {!loading && !error && data.orders.length > 0 && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th className="text-end">Items</th><th className="text-end">Total</th><th>Status</th></tr></thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id}>
                    <td><Link to={`/orders/${order.id}`} className="fw-medium">{order.orderRef}</Link></td>
                    <td>
                      <div>{order.customer.name}</div>
                      <div className="text-muted-nova small">{order.customer.email}</div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className="text-end">{order.itemCount}</td>
                    <td className="text-end">{formatCurrency(order.total)}</td>
                    <td>
                      {order.allowedStatuses.length === 0 ? (
                        <StatusBadge status={order.status} />
                      ) : (
                        <select className="form-select form-select-sm status-select" aria-label={`Status for ${order.orderRef}`}
                          value={order.status} disabled={updatingId === order.id} onChange={(e) => handleSelect(order, e.target.value)}>
                          <option value={order.status}>{label(order.status)}</option>
                          {order.allowedStatuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data && <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} />}

      <ConfirmDialog
        open={Boolean(pendingCancel)} danger busy={updatingId !== null} confirmLabel="Cancel order"
        title={`Cancel ${pendingCancel?.orderRef ?? 'order'}?`}
        message="The items go back into stock. This cannot be undone."
        onConfirm={() => applyStatus(pendingCancel, 'cancelled')} onCancel={() => setPendingCancel(null)}
      />
    </>
  );
}
