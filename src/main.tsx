import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Clear localStorage once to reset all dynamic data
if (typeof window !== 'undefined' && window.localStorage) {
  if (!localStorage.getItem('ts_cleared_force_v2')) {
    try {
      localStorage.clear();
      localStorage.setItem('ts_cleared_force_v2', 'true');
    } catch (e) {
      console.warn('Failed to clear or set storage quota', e);
    }
  }

  // Ignore Vite WebSocket errors in this environment
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (
      event.reason.message?.includes('WebSocket') || 
      event.reason.message?.includes('vite') ||
      String(event.reason).includes('WebSocket closed without opened')
    )) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
