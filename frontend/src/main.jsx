import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Order matters: Bootstrap first, then our CSS, so our rules can override Bootstrap's.
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/cart.css';
import './styles/checkout.css';
import './styles/admin.css';
import './styles/polish.css';
import './styles/theme.css';

import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import ToastProvider from './context/ToastProvider.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import WishlistProvider from './context/WishlistProvider.jsx';
import CartProvider from './context/CartProvider.jsx';

// Providers wrap the app so any component inside can use their data.
// Wishlist and Cart both need the logged-in user, so they sit inside AuthProvider.
// ErrorBoundary is outermost so a crash anywhere shows a friendly message, not a blank page.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
