import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Order matters: Bootstrap first, then our CSS, so our rules can override Bootstrap's.
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';

import App from './App.jsx';
import ToastProvider from './context/ToastProvider.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import WishlistProvider from './context/WishlistProvider.jsx';

// Providers wrap the app so any component inside can use their data.
// Wishlist needs the logged-in user, so it sits inside AuthProvider.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
