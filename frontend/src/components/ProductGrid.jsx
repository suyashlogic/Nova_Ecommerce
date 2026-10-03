import ProductCard from './ProductCard';
import Skeleton from './Skeleton';

function ProductCardSkeleton() {
  return (
    <div className="product-card" aria-hidden="true">
      <Skeleton height="auto" radius="0" className="product-card-skeleton-img" />
      <div className="product-card-body">
        <Skeleton height={12} width="35%" />
        <Skeleton height={18} width="85%" />
        <Skeleton height={14} width="50%" />
        <Skeleton height={18} width="40%" />
        <Skeleton height={32} />
      </div>
    </div>
  );
}

// Responsive grid of ProductCards. While `loading` it shows grey placeholder cards
// of the same shape, so the page doesn't jump when the data arrives.
export default function ProductGrid({ products = [], loading = false, skeletonCount = 8, cols = 'row-cols-2 row-cols-md-3 row-cols-xl-4' }) {
  return (
    <div className={`row g-3 g-lg-4 ${cols}`}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, i) => (
            <div className="col" key={i}><ProductCardSkeleton /></div>
          ))
        : products.map((product) => (
            <div className="col" key={product.id}><ProductCard product={product} /></div>
          ))}
    </div>
  );
}
