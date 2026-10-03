const LOW_STOCK_LIMIT = 5;

export default function StockStatus({ stock }) {
  if (stock <= 0) return <span className="stock stock-out">Out of stock</span>;
  if (stock <= LOW_STOCK_LIMIT) return <span className="stock stock-low">Only {stock} left</span>;
  return <span className="stock stock-in">In stock</span>;
}
