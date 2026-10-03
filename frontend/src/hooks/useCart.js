import useToast from './useToast';

// TEMPORARY placeholder. Phase 8 replaces this file with the real cart
// (CartContext with localStorage + server sync). Components call the same
// addItem(product, quantity) function, so none of them change.
export default function useCart() {
  const toast = useToast();

  async function addItem() {
    toast.info('The cart arrives in Phase 8. This button is already wired up.');
    return false; // false = nothing was added
  }

  return { addItem };
}
