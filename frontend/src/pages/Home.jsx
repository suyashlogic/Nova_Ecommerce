import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import useFetch from '../hooks/useFetch';
import { listProducts } from '../services/productService';
import formatCurrency from '../utils/formatCurrency';
import imageUrl from '../utils/imageUrl';

// TEMPORARY Phase 6 page. It proves React -> Express -> PostgreSQL works by loading
// featured products. Phase 7 replaces it with the full homepage and a real ProductCard.
export default function Home() {
  const { data, loading, error, reload } = useFetch(() => listProducts({ featured: true, limit: 4 }), []);

  return (
    <div className="container page-section">
      <p className="eyebrow">Product discovery</p>
      <h1 className="mb-3" style={{ maxWidth: 720 }}>Find something worth keeping.</h1>
      <p className="page-subtitle" style={{ maxWidth: 560 }}>
        Explore carefully selected products for work, play and everyday life.
      </p>
      <div style={{ maxWidth: 560 }} className="mb-5"><SearchBar large placeholder="Search headphones, desks, keyboards..." /></div>

      <h2 className="h4 mb-3">Featured right now</h2>

      {/* The four states every API-driven page handles: loading, error, empty, success */}
      {loading && (
        <div className="row g-4">
          {[1, 2, 3, 4].map((n) => (
            <div className="col-6 col-lg-3" key={n}>
              <Skeleton height={220} radius="12px" className="mb-3" />
              <Skeleton height={16} width="80%" className="mb-2" />
              <Skeleton height={16} width="40%" />
            </div>
          ))}
        </div>
      )}

      {error && <ErrorState title="Unable to load products" message={error.message} onRetry={reload} />}

      {!loading && !error && data.products.length === 0 && (
        <EmptyState title="No products found." message="Run seed.sql in pgAdmin to add demo products." />
      )}

      {!loading && !error && data.products.length > 0 && (
        <div className="row g-4">
          {data.products.map((product) => (
            <div className="col-6 col-lg-3" key={product.id}>
              <Link to={`/products/${product.id}`} className="preview-tile d-block text-reset">
                <img src={imageUrl(product.imageUrl)} alt={product.name} loading="lazy" />
                <div className="mt-3 fw-medium">{product.name}</div>
                <div className="text-muted-nova small">{product.category.name}</div>
                <div>
                  <span className="price-now">{formatCurrency(product.salePrice)}</span>
                  {product.discountPercent > 0 && <span className="price-was">{formatCurrency(product.price)}</span>}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
