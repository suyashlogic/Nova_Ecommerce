import Icon from './Icon';
import useWishlist from '../hooks/useWishlist';

export default function WishlistButton({ productId, className = '' }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(productId);
  return (
    <button
      type="button"
      className={`wish-btn ${saved ? 'saved' : ''} ${className}`}
      onClick={() => toggle(productId)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Icon name="heart" size={18} />
    </button>
  );
}
