import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { store } from './store';
import { logout } from './store/slices/authSlice';

// Listen for 401 session-expired events from the axios interceptor.
// This is the safe way to dispatch Redux actions from outside React
// without creating a circular import (axiosInstance → store).
window.addEventListener('auth:session-expired', () => {
  store.dispatch(logout());
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
