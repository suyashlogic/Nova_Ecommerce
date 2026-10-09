import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import Icon from '../../components/Icon';
import Skeleton from '../../components/Skeleton';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import usePageTitle from '../../hooks/usePageTitle';
import useToast from '../../hooks/useToast';
import { listProducts } from '../../services/productService';
import { deleteProduct, updateProductStock } from '../../services/adminProductService';
import formatCurrency from '../../utils/formatCurrency';
import imageUrl from '../../utils/imageUrl';

const PAGE_SIZE = 10;
const LOW_STOCK = 5;

// Inventory editor: type a new number, press Save. Resets itself when the stock changes.
function StockEditor({ product, onSaved }) {
  const toast = useToast();
  const [value, setValue] = useState(String(product.stock));
  const [saving, setSaving] = useState(false);
  const changed = value !== String(product.stock);
  const valid = /^\d+$/.test(value) && Number(value) <= 100000;

  async function save() {
    setSaving(true);
    try {
      await updateProductStock(product.id, Number(value));
      toast.success(`Stock for ${product.name} set to ${value}`);
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stock-editor">
      <input type="number" min="0" className={`form-control form-control-sm ${changed && !valid ? 'is-invalid' : ''}`}
        value={value} onChange={(e) => setValue(e.target.value)} aria-label={`Stock for ${product.name}`} />
      {changed && (
        <button type="button" className="btn btn-nova-dark btn-sm" onClick={save} disabled={!valid || saving}>Save</button>
      )}
      {!changed && product.stock === 0 && <span className="badge-nova danger">Out</span>}
      {!changed && product.stock > 0 && product.stock <= LOW_STOCK && <span className="badge-nova warning">Low</span>}
    </div>
  );
}

export default function AdminProducts() {
  usePageTitle('Products | Admin');
  const toast = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // A new search always starts from page 1
  useEffect(() => setPage(1), [debouncedSearch]);

  const { data, loading, error, reload } = useFetch(
    () => listProducts({ search: debouncedSearch || undefined, page, limit: PAGE_SIZE, sort: 'newest' }),
    [debouncedSearch, page]
  );

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteProduct(toDelete.id);
      toast.success(`${toDelete.name} deleted`);
      // Deleted the last row of a later page? Step back one page.
      if (data.products.length === 1 && page > 1) setPage(page - 1);
      reload();
      setToDelete(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1 className="admin-title">Products</h1>
          <p className="text-muted-nova mb-0">Add, edit and manage inventory.</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-nova-primary"><Icon name="plus" size={18} className="me-1" /> Add product</Link>
      </div>

      <div className="admin-toolbar">
        <input type="search" className="form-control" placeholder="Search products" aria-label="Search products" value={search} onChange={(e) => setSearch(e.target.value)} maxLength={100} />
        {data && <span className="text-muted-nova">{data.pagination.total} {data.pagination.total === 1 ? 'product' : 'products'}</span>}
      </div>

      <section className="admin-card">
        {loading && <div className="p-3" aria-hidden="true">{[1, 2, 3, 4, 5].map((n) => <Skeleton key={n} height={56} className="mb-2" />)}</div>}
        {error && <ErrorState title="Unable to load products" message={error.message} onRetry={reload} />}
        {!loading && !error && data.products.length === 0 && (
          <EmptyState icon="package" title="No products found." message={debouncedSearch ? 'Try a different search.' : 'Add your first product to get started.'} action={debouncedSearch ? undefined : { to: '/admin/products/new', label: 'Add product' }} />
        )}

        {!loading && !error && data.products.length > 0 && (
          <div className="table-responsive">
            <table className="admin-table">
              <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {data.products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="cell-product">
                        <img src={imageUrl(product.imageUrl)} alt="" loading="lazy" />
                        <div>
                          <Link to={`/products/${product.id}`} className="fw-medium text-reset">{product.name}</Link>
                          <div className="text-muted-nova small">{product.category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {formatCurrency(product.salePrice)}
                      {product.discountPercent > 0 && <div className="text-muted-nova small"><s>{formatCurrency(product.price)}</s> (-{product.discountPercent}%)</div>}
                    </td>
                    <td><StockEditor key={`${product.id}-${product.stock}`} product={product} onSaved={reload} /></td>
                    <td>{product.isFeatured ? <span className="badge-nova accent">Featured</span> : <span className="text-muted-nova small">Standard</span>}</td>
                    <td className="text-end">
                      <div className="row-actions">
                        <Link to={`/admin/products/${product.id}/edit`} className="btn btn-nova-outline btn-sm" aria-label={`Edit ${product.name}`}><Icon name="edit" size={16} /></Link>
                        <button type="button" className="btn btn-nova-outline btn-sm" onClick={() => setToDelete(product)} aria-label={`Delete ${product.name}`}><Icon name="trash" size={16} /></button>
                      </div>
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
        open={Boolean(toDelete)} danger busy={deleting} confirmLabel="Delete product"
        title={`Delete ${toDelete?.name ?? 'product'}?`}
        message="This removes the product from the shop and from customers' carts. Past orders keep their details."
        onConfirm={confirmDelete} onCancel={() => setToDelete(null)}
      />
    </>
  );
}
