import { Link } from 'react-router-dom';
import QuantitySelector from './QuantitySelector';
import StockStatus from './StockStatus';
import formatCurrency from '../utils/formatCurrency';
import imageUrl from '../utils/imageUrl';

// One row in the cart. It only displays and reports clicks; the cart logic lives in CartProvider.
export default function CartItem({ item, busy, onQuantityChange, onRemove }) {
  const detailsPath = `/products/${item.productId}`;
  return (
    <article className="cart-item">
      <Link to={detailsPath} className="cart-item-img">
        <img src={imageUrl(item.imageUrl)} alt={item.name} loading="lazy" />
      </Link>

      <div className="cart-item-main">
        <div className="cart-item-cat">{item.category}</div>
        <Link to={detailsPath} className="cart-item-name">{item.name}</Link>
        <div className="cart-item-price">
          {formatCurrency(item.unitPrice)}
          {item.discountPercent > 0 && <span className="price-was">{formatCurrency(item.price)}</span>}
        </div>
        {item.stock <= 5 && <StockStatus stock={item.stock} />}
      </div>

      <div className="cart-item-controls">
        <QuantitySelector value={item.quantity} max={item.stock} disabled={busy} onChange={(q) => onQuantityChange(item, q)} />
        <button type="button" className="btn btn-nova-ghost btn-sm" disabled={busy} onClick={() => onRemove(item)} aria-label={`Remove ${item.name} from cart`}>
          Remove
        </button>
      </div>

      <div className="cart-item-total">{formatCurrency(item.lineTotal)}</div>
    </article>
  );
}
