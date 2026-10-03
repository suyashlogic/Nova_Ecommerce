import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WishlistContext } from './WishlistContext';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import * as wishlistService from '../services/wishlistService';

// Remembers WHICH products the logged-in user has saved, so every heart button
// in the app can show the right state without each one calling the API.
export default function WishlistProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = user?.id;

  // A Set of product ids gives instant "is this saved?" lookups
  const [savedIds, setSavedIds] = useState(() => new Set());

  // Load the list when someone logs in; clear it when they log out
  useEffect(() => {
    if (!userId) {
      setSavedIds(new Set());
      return undefined;
    }
    let ignore = false;
    wishlistService
      .getWishlist()
      .then((products) => {
        if (!ignore) setSavedIds(new Set(products.map((p) => p.id)));
      })
      .catch(() => {}); // hearts simply start empty if this fails
    return () => {
      ignore = true;
    };
  }, [userId]);

  const toggle = useCallback(
    async (productId) => {
      if (!userId) {
        toast.info('Sign in to save products to your wishlist');
        navigate('/login', { state: { from: location } });
        return;
      }

      const wasSaved = savedIds.has(productId);

      // Optimistic update: change the heart instantly, undo if the server says no.
      const apply = (shouldBeSaved) =>
        setSavedIds((current) => {
          const next = new Set(current);
          if (shouldBeSaved) next.add(productId);
          else next.delete(productId);
          return next;
        });

      apply(!wasSaved);
      try {
        if (wasSaved) await wishlistService.removeFromWishlist(productId);
        else await wishlistService.addToWishlist(productId);
      } catch (err) {
        apply(wasSaved); // roll back
        toast.error(err.message);
      }
    },
    [userId, savedIds, toast, navigate, location]
  );

  const value = useMemo(
    () => ({ isSaved: (productId) => savedIds.has(productId), toggle }),
    [savedIds, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
