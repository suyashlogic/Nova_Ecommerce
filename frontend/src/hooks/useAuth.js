import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Usage in any component: const { user, login, logout } = useAuth();
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
