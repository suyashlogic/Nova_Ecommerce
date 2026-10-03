import formatCurrency from '../utils/formatCurrency';

// Shows the price the customer pays, and the crossed-out original when discounted.
export default function Price({ product, large = false, showBadge = false }) {
  const discounted = product.discountPercent > 0;
  return (
    <div className={`price ${large ? 'price-large' : ''}`}>
      <span className="price-now">{formatCurrency(product.salePrice)}</span>
      {discounted && <span className="price-was">{formatCurrency(product.price)}</span>}
      {discounted && showBadge && <span className="badge-nova success ms-2">Save {product.discountPercent}%</span>}
    </div>
  );
}
