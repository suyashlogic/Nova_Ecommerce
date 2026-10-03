import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import Price from '../components/Price';
import StockStatus from '../components/StockStatus';
import QuantitySelector from '../components/QuantitySelector';
import WishlistButton from '../components/WishlistButton';
import ProductGrid from '../components/ProductGrid';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Skeleton from '../components/Skeleton';
import useFetch from '../hooks/useFetch';
import useCart from '../hooks/useCart';
import usePageTitle from '../hooks/usePageTitle';
import { getProduct } from '../services/productService';
import imageUrl from '../utils/imageUrl';
import formatDate from '../utils/formatDate';

function DetailSkeleton() {
  return (
    <div className="row g-5" aria-hidden="true">
      <div className="col-lg-6"><Skeleton height="auto" radius="20px" className="detail-skeleton-img" /></div>
      <div className="col-lg-6">
        <Skeleton height={14} width="25%" className="mb-3" />
        <Skeleton height={36} width="80%" className="mb-3" />
        <Skeleton height={16} width="40%" className="mb-4" />
        <Skeleton height={30} width="35%" className="mb-4" />
        <Skeleton height={90} className="mb-4" />
        <Skeleton height={48} />
      </div>
    </div>
  );
}

// Split into two components: ProductDetail fetches, ProductView displays.
// The parent gives ProductView key={id}, so its quantity state resets for each product.
function ProductView({ data }) {
  const { product, related, reviews } = data;
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const specs = Object.entries(product.specs ?? {});

  usePageTitle(product.name);

  async function handleBuyNow() {
    const added = await addItem(product, quantity);
    if (added) navigate('/checkout');
  }

  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumb-nova">
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category.slug}`}>{product.category.name}</Link>
        <span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="row g-4 g-lg-5">
        <div className="col-lg-6">
          <div className="detail-media">
            <img src={imageUrl(product.imageUrl)} alt={product.name} />
          </div>
        </div>

        <div className="col-lg-6">
          <Link to={`/shop?category=${product.category.slug}`} className="eyebrow">{product.category.name}</Link>
          <h1 className="detail-title">{product.name}</h1>
          <div className="mb-3"><Rating value={product.rating} count={product.reviewCount} /></div>
          <Price product={product} large showBadge />
          <div className="mt-2 mb-4"><StockStatus stock={product.stock} /></div>

          <p className="detail-description">{product.description}</p>

          {product.inStock ? (
            <>
              <div className="d-flex align-items-center gap-3 mb-3">
                <span className="form-label mb-0">Quantity</span>
                <QuantitySelector value={quantity} max={product.stock} onChange={setQuantity} />
              </div>
              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-nova-primary btn-lg flex-grow-1" onClick={() => addItem(product, quantity)}>
                  Add to cart
                </button>
                <button type="button" className="btn btn-nova-dark btn-lg flex-grow-1" onClick={handleBuyNow}>
                  Buy now
                </button>
                <WishlistButton productId={product.id} className="wish-btn-lg" />
              </div>
            </>
          ) : (
            <div className="alert alert-danger" role="status">
              Product is currently out of stock.
              <div className="mt-2"><WishlistButton productId={product.id} className="wish-btn-inline" /> Save it for later</div>
            </div>
          )}
        </div>
      </div>

      {specs.length > 0 && (
        <section className="detail-section">
          <h2>Specifications</h2>
          <div className="nova-card">
            <table className="spec-table">
              <tbody>
                {specs.map(([name, value]) => (
                  <tr key={name}><th scope="row">{name}</th><td>{value}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="detail-section">
        <h2>Customer reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-muted-nova">No reviews yet for this product.</p>
        ) : (
          <div className="review-list">
            {reviews.map((review) => (
              <article key={review.id} className="review">
                <div className="d-flex flex-wrap justify-content-between gap-2">
                  <strong>{review.userName}</strong>
                  <span className="text-muted-nova small">{formatDate(review.createdAt)}</span>
                </div>
                <Rating value={review.rating} showCount={false} />
                {review.comment && <p className="mb-0 mt-2">{review.comment}</p>}
              </article>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="detail-section">
          <SectionHeader title="You might also like" subtitle={`More from ${product.category.name}`} linkTo={`/shop?category=${product.category.slug}`} />
          <ProductGrid products={related} cols="row-cols-2 row-cols-lg-4" />
        </section>
      )}
    </>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => getProduct(id), [id]);

  return (
    <div className="container page-section">
      {loading && <DetailSkeleton />}

      {/* 404 = no such product. 422 = the id in the URL wasn't even a number. */}
      {error && (error.status === 404 || error.status === 422) && (
        <EmptyState icon="search" title="Product not found" message="This product may have been removed or the link is incorrect." action={{ to: '/shop', label: 'Back to the shop' }} />
      )}

      {error && error.status !== 404 && error.status !== 422 && (
        <ErrorState title="Unable to load this product" message={error.message} onRetry={reload} />
      )}

      {!loading && data && <ProductView key={id} data={data} />}
    </div>
  );
}
