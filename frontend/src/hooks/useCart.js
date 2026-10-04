import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

// const { items, summary, itemCount, addItem, updateQuantity, removeItem } = useCart();
export default function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
