import { useEffect, useState } from 'react';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Skeleton from '../../components/Skeleton';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import usePageTitle from '../../hooks/usePageTitle';
import { listAdminUsers } from '../../services/adminService';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  usePageTitle('Users | Admin');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [debouncedSearch]);

  const { data, loading, error, reload } = useFetch(
    () => listAdminUsers({ search: debouncedSearch || undefined, page, limit: PAGE_SIZE }),
    [debouncedSearch, page]
  );

  return (
    <>
      <h1 className="admin-title">Users</h1>
      <p className="text-muted-nova mb-4">Everyone with an account. Read only.</p>

      <div className="admin-toolbar">
        <input type="search" className="form-control" placeholder="Search by name or email" aria-label="Search users" value={search} onChange={(e) => setSearch(e.target.value)} maxLength={100} />
        {data && <span className="text-muted-nova">{data.pagination.total} {data.pagination.total === 1 ? 'user' : 'users'}</span>}
      </div>

      <section className="admin-card">
        {loading && <div className="p-3" aria-hidden="true">{[1, 2, 3, 4, 5].map((n) => <Skeleton key={n} height={48} className="mb-2" />)}</div>}
        {error && <ErrorState title="Unable to load users" message={error.message} onRetry={reload} />}
        {!loading && !error && data.users.length === 0 && <EmptyState icon="user" title="No users found." message="Try a different search." />}

        {!loading && !error && data.users.length > 0 && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th className="text-end">Orders</th><th className="text-end">Total spent</th><th>Joined</th></tr></thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id}>
                    <td className="fw-medium">{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`badge-nova ${user.role === 'admin' ? 'accent' : ''}`}>{user.role}</span></td>
                    <td className="text-end">{user.orderCount}</td>
                    <td className="text-end">{formatCurrency(user.totalSpent)}</td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data && <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} />}
    </>
  );
}
