import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon';
import Rating from './Rating';
import Price from './Price';
import StockStatus from './StockStatus';
import WishlistButton from './WishlistButton';
import useCart from '../hooks/useCart';
import imageUrl from '../utils/imageUrl';

// One product tile. Used on Home, Shop, Wishlist and "Related products" so it exists only once.
export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const detailsPath = `/products/${product.id}`;

  // Brief "Added" confirmation on the button itself, so feedback appears where the eyes already are
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleAdd() {
    const added = await addItem(product, 1);
    if (!added) return;
    setJustAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 1600);
  }

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
            className={`btn btn-sm flex-grow-1 ${justAdded ? 'btn-added' : 'btn-nova-dark'}`}
            onClick={handleAdd}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
          >
            {justAdded ? (
              <><Icon name="check" size={16} className="me-1" />Added</>
            ) : (
              <>
                <span className="d-none d-sm-inline">Add to cart</span>
                <span className="d-sm-none">Add</span>
              </>
            )}
          </button>
          <Link to={detailsPath} className="btn btn-nova-outline btn-sm" aria-label={`View details for ${product.name}`}>
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
