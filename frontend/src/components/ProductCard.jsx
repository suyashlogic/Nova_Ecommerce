import { Link } from 'react-router-dom';
import Rating from './Rating';
import Price from './Price';
import StockStatus from './StockStatus';
import WishlistButton from './WishlistButton';
import useCart from '../hooks/useCart';
import imageUrl from '../utils/imageUrl';

// One product tile. Used on Home, Shop and "Related products" so it exists only once.
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const detailsPath = `/products/${product.id}`;

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link to={detailsPath} tabIndex={-1} aria-hidden="true">
          <img src={imageUrl(product.imageUrl)} alt="" loading="lazy" />
        </Link>
        {product.discountPercent > 0 && (
          <span className="badge-nova success product-card-badge">-{product.discountPercent}%</span>
        )}
        <WishlistButton productId={product.id} className="product-card-wish" />
      </div>

      <div className="product-card-body">
        <div className="product-card-cat">{product.category.name}</div>
        <h3 className="product-card-name"><Link to={detailsPath}>{product.name}</Link></h3>
        <Rating value={product.rating} count={product.reviewCount} />
        <Price product={product} />
        <StockStatus stock={product.stock} />

        <div className="product-card-actions">
          <button
            type="button"
            className="btn btn-nova-dark btn-sm flex-grow-1"
            onClick={() => addItem(product, 1)}
            disabled={!product.inStock}
          >
            <span className="d-none d-sm-inline">Add to cart</span>
            <span className="d-sm-none">Add</span>
          </button>
          <Link to={detailsPath} className="btn btn-nova-outline btn-sm" aria-label={`View details for ${product.name}`}>
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
