import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

// Usage: const toast = useToast(); toast.success('Saved!'); toast.error('Failed');
export default function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
