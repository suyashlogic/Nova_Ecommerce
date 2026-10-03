import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import usePageTitle from '../hooks/usePageTitle';
import { listProducts } from '../services/productService';
import { listCategories } from '../services/categoryService';

const PAGE_SIZE = 12;
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

const isValidPrice = (text) => text === '' || (Number.isFinite(Number(text)) && Number(text) >= 0);

export default function Shop() {
  usePageTitle('Shop');

  // THE URL IS THE SOURCE OF TRUTH for filters. That makes pages shareable and
  // bookmarkable, and the browser Back button just works.
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const inStock = searchParams.get('inStock') === 'true';
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  // Changes some params; empty values are removed. Any filter change returns to page 1.
  const updateParams = useCallback(
    (changes) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        for (const [key, value] of Object.entries(changes)) {
          if (value === '' || value === null || value === undefined || value === false) next.delete(key);
          else next.set(key, String(value));
        }
        if (!('page' in changes)) next.delete('page');
        return next;
      });
    },
    [setSearchParams]
  );

  // Local copies of text inputs: typing is instant, the URL (and the API call) updates after a pause
  const [searchText, setSearchText] = useState(urlSearch);
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);
  const [priceError, setPriceError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile only

  // Keep inputs in sync when the URL changes from elsewhere (navbar search, Back button)
  useEffect(() => setSearchText(urlSearch), [urlSearch]);
  useEffect(() => {
    setMinInput(minPrice);
    setMaxInput(maxPrice);
  }, [minPrice, maxPrice]);

  const debouncedSearch = useDebounce(searchText, 400);
  useEffect(() => {
    if (debouncedSearch.trim() !== urlSearch) updateParams({ search: debouncedSearch.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Fetch whenever the URL's query string changes
  const { data, loading, error, reload } = useFetch(
    () =>
      listProducts({
        search: urlSearch || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
        page,
        limit: PAGE_SIZE,
        inStock: inStock || undefined,
      }),
    [searchParams.toString()]
  );

  // Categories for the sidebar. If this fails the shop still works, so no error UI.
  const categories = useFetch(listCategories, []);

  // If filters shrink the results while on a later page, jump back to the last real page
  useEffect(() => {
    if (data && data.pagination.total > 0 && page > data.pagination.totalPages) {
      updateParams({ page: data.pagination.totalPages });
    }
  }, [data, page, updateParams]);

  function applyPrice(event) {
    event.preventDefault();
    const low = minInput.trim();
    const high = maxInput.trim();
    if (!isValidPrice(low) || !isValidPrice(high)) return setPriceError('Enter valid amounts');
    if (low && high && Number(low) > Number(high)) return setPriceError('Minimum cannot be above maximum');
    setPriceError('');
    updateParams({ minPrice: low, maxPrice: high });
  }

  function changePage(next) {
    updateParams({ page: next > 1 ? next : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeFilterCount = [urlSearch, category, minPrice || maxPrice, inStock].filter(Boolean).length;
  const total = data?.pagination.total ?? 0;

  const filters = (
    <>
      <div className="filter-block">
        <label htmlFor="shop-search" className="filter-title">Search</label>
        <input id="shop-search" type="search" className="form-control" placeholder="Search products"
          value={searchText} onChange={(e) => setSearchText(e.target.value)} maxLength={100} />
      </div>

      <div className="filter-block">
        <div className="filter-title">Category</div>
        <ul className="filter-list">
          <li>
            <button type="button" className={`filter-option ${category === '' ? 'active' : ''}`} onClick={() => updateParams({ category: '' })}>
              All products
            </button>
          </li>
          {categories.data?.map((c) => (
            <li key={c.id}>
              <button type="button" className={`filter-option ${category === c.slug ? 'active' : ''}`} onClick={() => updateParams({ category: c.slug })}>
                <span>{c.name}</span>
                <span className="filter-count">{c.productCount}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form className="filter-block" onSubmit={applyPrice} noValidate>
        <div className="filter-title">Price</div>
        <div className="d-flex align-items-center gap-2">
          <input type="number" min="0" inputMode="decimal" className={`form-control ${priceError ? 'is-invalid' : ''}`} placeholder="Min" aria-label="Minimum price" value={minInput} onChange={(e) => setMinInput(e.target.value)} />
          <span className="text-muted-nova">to</span>
          <input type="number" min="0" inputMode="decimal" className={`form-control ${priceError ? 'is-invalid' : ''}`} placeholder="Max" aria-label="Maximum price" value={maxInput} onChange={(e) => setMaxInput(e.target.value)} />
        </div>
        {priceError && <div className="field-error">{priceError}</div>}
        <button type="submit" className="btn btn-nova-outline btn-sm w-100 mt-2">Apply price</button>
      </form>

      <div className="filter-block">
        <div className="form-check">
          <input id="in-stock" type="checkbox" className="form-check-input" checked={inStock} onChange={(e) => updateParams({ inStock: e.target.checked })} />
          <label htmlFor="in-stock" className="form-check-label">In stock only</label>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button type="button" className="btn btn-nova-ghost btn-sm w-100" onClick={() => setSearchParams({})}>
          Clear all filters
        </button>
      )}
    </>
  );

  return (
    <div className="container page-section">
      <h1 className="page-title">Shop</h1>
      <p className="page-subtitle">Everything in the collection, filtered your way.</p>

      <div className="row g-4">
        <div className="col-lg-3">
          {/* Mobile: a button reveals the filters. Desktop: always visible. */}
          <button type="button" className="btn btn-nova-outline w-100 d-lg-none mb-3" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
            <Icon name="filter" size={18} className="me-2" />
            Filters{activeFilterCount > 0 && <span className="badge-nova accent ms-2">{activeFilterCount}</span>}
          </button>
          <aside className={`shop-filters nova-card ${filtersOpen ? '' : 'd-none'} d-lg-block`} aria-label="Filters">
            {filters}
          </aside>
        </div>

        <div className="col-lg-9">
          <div className="shop-toolbar">
            <div className="text-muted-nova" aria-live="polite">
              {loading ? 'Loading...' : `${total} ${total === 1 ? 'product' : 'products'}`}
            </div>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="sort" className="text-muted-nova small mb-0">Sort by</label>
              <select id="sort" className="form-select form-select-sm w-auto" value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
                {SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>

          {error && <ErrorState title="Unable to load products" message={error.message} onRetry={reload} />}

          {!error && !loading && data.products.length === 0 && (
            <EmptyState icon="search" title="No products found." message="Try different keywords, or clear your filters." action={{ to: '/shop', label: 'Clear filters' }} />
          )}

          {!error && (loading || data.products.length > 0) && (
            <ProductGrid products={data?.products} loading={loading} skeletonCount={PAGE_SIZE} cols="row-cols-2 row-cols-md-3" />
          )}

          {!error && data && <Pagination page={page} totalPages={data.pagination.totalPages} onChange={changePage} />}
        </div>
      </div>
    </div>
  );
}
