import ProductGrid from '../components/ProductGrid';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import useFetch from '../hooks/useFetch';
import useWishlist from '../hooks/useWishlist';
import usePageTitle from '../hooks/usePageTitle';
import { getWishlist } from '../services/wishlistService';

export default function Wishlist() {
  usePageTitle('Wishlist');
  const { data: products, loading, error, reload } = useFetch(getWishlist, []);
  const { isSaved } = useWishlist();

  // Un-hearting a product here keeps its card visible (so a slip can be undone with one more click).
  // We offer to refresh the list when something has been un-saved.
  const removedCount = products ? products.filter((p) => !isSaved(p.id)).length : 0;

  return (
    <div className="container page-section">
      <h1 className="page-title">Your wishlist</h1>
      <p className="page-subtitle">Products you have saved for later.</p>

      {error && <ErrorState title="Unable to load your wishlist" message={error.message} onRetry={reload} />}

      {loading && <ProductGrid loading skeletonCount={4} cols="row-cols-2 row-cols-lg-4" />}

      {!loading && !error && products.length === 0 && (
        <EmptyState icon="heart" title="Your wishlist is empty." message="Tap the heart on any product to save it here." action={{ to: '/shop', label: 'Browse the shop' }} />
      )}

      {!loading && !error && products.length > 0 && (
        <>
          {removedCount > 0 && (
            <div className="ship-note d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4" role="status">
              <span>{removedCount} {removedCount === 1 ? 'item was' : 'items were'} removed from your wishlist.</span>
              <button type="button" className="btn btn-nova-outline btn-sm" onClick={reload}>Update list</button>
            </div>
          )}
          <ProductGrid products={products} cols="row-cols-2 row-cols-lg-4" />
        </>
      )}
    </div>
  );
}
