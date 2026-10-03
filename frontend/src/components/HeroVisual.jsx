import { Link } from 'react-router-dom';
import imageUrl from '../utils/imageUrl';

// Three product images in a mosaic. Uses real products, so it never goes stale.
export default function HeroVisual({ products = [], loading = false }) {
  return (
    <div className="hero-visual">
      {[0, 1, 2].map((i) => {
        const product = products[i];
        if (!product) {
          return <div key={i} className={`hero-tile hero-tile-${i} ${loading ? 'skeleton' : 'hero-tile-empty'}`} aria-hidden="true" />;
        }
        return (
          <Link key={product.id} to={`/products/${product.id}`} className={`hero-tile hero-tile-${i}`}>
            <img src={imageUrl(product.imageUrl)} alt={product.name} />
            <span className="hero-tile-label">{product.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
