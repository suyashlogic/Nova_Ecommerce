import { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';

// const { isSaved, toggle } = useWishlist();
export default function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return context;
}
