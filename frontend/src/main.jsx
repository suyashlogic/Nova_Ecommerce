import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Order matters: Bootstrap first, then our CSS, so our rules can override Bootstrap's.
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import App from './App.jsx';
import ToastProvider from './context/ToastProvider.jsx';
import AuthProvider from './context/AuthProvider.jsx';

// Providers wrap the app so any component inside can use their data.
// AuthProvider sits inside ToastProvider so auth code could show toasts if needed.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
