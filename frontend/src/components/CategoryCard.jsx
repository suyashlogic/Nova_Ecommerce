import { Link } from 'react-router-dom';
import Icon from './Icon';
import { categoryHue } from '../utils/categoryStyle';

export default function CategoryCard({ category }) {
  const { slug, name, description, productCount } = category;
  return (
    <Link to={`/shop?category=${slug}`} className="category-card" style={{ '--hue': categoryHue(slug) }}>
      <span className="category-card-count">{productCount} {productCount === 1 ? 'product' : 'products'}</span>
      <span className="category-card-name">{name}</span>
      <span className="category-card-desc">{description}</span>
      <span className="category-card-arrow"><Icon name="arrowRight" size={18} /></span>
    </Link>
  );
}
