import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartContext } from './CartContext';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import * as cartService from '../services/cartService';

// ===================== CART PERSISTENCE STRATEGY =====================
//  Guest        -> only [{ productId, quantity }] lives in localStorage, so a refresh
//                  never loses the cart. Prices come fresh from the server (/cart/preview).
//  Logged in    -> the cart lives in PostgreSQL (carts + cart_items) and follows the user
//                  across devices.
//  On login     -> the guest lines are merged into the saved cart, then removed locally.
// Components never care which mode is active: they use addItem / updateQuantity / removeItem.
// =====================================================================

const GUEST_KEY = 'nova_guest_cart';

const EMPTY_CART = {
  items: [],
  summary: { itemCount: 0, subtotal: 0, taxRate: 0, tax: 0, shippingFee: 0, total: 0, freeShippingThreshold: 0, amountToFreeShipping: 0 },
};

// localStorage can throw (private mode, disabled storage) or contain junk, so be defensive
function readGuestLines() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_KEY));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((l) => Number.isInteger(l?.productId) && Number.isInteger(l?.quantity) && l.quantity > 0);
  } catch {
    return [];
  }
}

function writeGuestLines(lines) {
  try {
    if (lines.length === 0) localStorage.removeItem(GUEST_KEY);
    else localStorage.setItem(GUEST_KEY, JSON.stringify(lines));
  } catch {
    // storage unavailable: the cart just won't survive a refresh
  }
}

const toLines = (items) => items.map((item) => ({ productId: item.productId, quantity: item.quantity }));

export default function CartProvider({ children }) {
  const { user, authLoading } = useAuth();
  const toast = useToast();
  const userId = user?.id;

  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false); // true while an add/update/remove is in flight
  const [adjustments, setAdjustments] = useState([]); // notices like "Only 2 left, quantity reduced"
  const [reloadCount, setReloadCount] = useState(0);

  const applyView = useCallback((view) => {
    setCart({ items: view.items, summary: view.summary });
    if (view.adjustments?.length) setAdjustments(view.adjustments);
  }, []);

  // ---- Load the cart whenever we learn who the user is (or they log in / out) ----
  useEffect(() => {
    if (authLoading) return undefined; // wait until we know if someone is logged in
    let ignore = false;

    async function sync() {
      setLoading(true);
      setError(null);
      try {
        const guestLines = readGuestLines();
        let view;

        if (userId) {
          // Merge is safe to repeat (larger quantity wins), so React StrictMode's
          // double-run in development can never double the cart.
          view = guestLines.length > 0 ? await cartService.mergeCart(guestLines) : await cartService.getCart();
          if (guestLines.length > 0) writeGuestLines([]); // only after the merge succeeded
        } else if (guestLines.length > 0) {
          view = await cartService.previewCart(guestLines);
          writeGuestLines(toLines(view.items)); // drop lines that no longer exist or have no stock
        } else {
          view = { ...EMPTY_CART, adjustments: [] };
        }
        if (!ignore) applyView(view);
      } catch (err) {
        if (!ignore) setError(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    sync();
    return () => {
      ignore = true;
    };
  }, [authLoading, userId, reloadCount, applyView]);

  // Runs one cart change, shows the result, and reports failures as a toast
  const run = useCallback(
    async (action) => {
      setBusy(true);
      try {
        applyView(await action());
        return true;
      } catch (err) {
        toast.error(err.message);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [applyView, toast]
  );

  // Guest change: save lines locally, then refresh totals from the server
  const saveGuestLines = useCallback(async (lines) => {
    writeGuestLines(lines);
    const view = await cartService.previewCart(lines);
    writeGuestLines(toLines(view.items));
    return view;
  }, []);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (product.stock <= 0) {
        toast.error('This product is out of stock');
        return false;
      }
      const ok = await run(async () => {
        if (userId) return cartService.addItem(product.id, quantity);

        const lines = readGuestLines();
        const inCart = lines.find((l) => l.productId === product.id)?.quantity ?? 0;
        if (inCart + quantity > product.stock) {
          throw new Error(
            inCart > 0
              ? `Only ${product.stock} available (you already have ${inCart} in your cart)`
              : `Only ${product.stock} available`
          );
        }
        const next = inCart > 0
          ? lines.map((l) => (l.productId === product.id ? { ...l, quantity: inCart + quantity } : l))
          : [...lines, { productId: product.id, quantity }];
        return saveGuestLines(next);
      });
      if (ok) toast.success(`${product.name} added to cart`);
      return ok;
    },
    [userId, run, saveGuestLines, toast]
  );

  const updateQuantity = useCallback(
    (item, quantity) =>
      run(() => {
        if (userId) return cartService.updateItem(item.id, quantity);
        const next = readGuestLines().map((l) => (l.productId === item.productId ? { ...l, quantity } : l));
        return saveGuestLines(next);
      }),
    [userId, run, saveGuestLines]
  );

  const removeItem = useCallback(
    (item) =>
      run(() => {
        if (userId) return cartService.removeItem(item.id);
        return saveGuestLines(readGuestLines().filter((l) => l.productId !== item.productId));
      }),
    [userId, run, saveGuestLines]
  );

  const reload = useCallback(() => setReloadCount((n) => n + 1), []);
  const dismissAdjustments = useCallback(() => setAdjustments([]), []);

  const value = useMemo(
    () => ({
      items: cart.items,
      summary: cart.summary,
      itemCount: cart.summary.itemCount,
      adjustments,
      loading,
      error,
      busy,
      addItem,
      updateQuantity,
      removeItem,
      reload,
      dismissAdjustments,
    }),
    [cart, adjustments, loading, error, busy, addItem, updateQuantity, removeItem, reload, dismissAdjustments]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
