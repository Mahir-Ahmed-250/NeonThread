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
}

// Industry-standard fix for "White Screen" after new deployments on Render/Vercel
// Automatically reloads the page if a chunk fails to load or a dynamic import fails
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (/Loading chunk|Failed to fetch dynamically imported module/i.test(e.message)) {
      console.warn("Chunk load failure detected, reloading page to fetch latest version...");
      window.location.reload();
    }
  }, true);

  window.addEventListener('unhandledrejection', (e) => {
    if (/Loading chunk|Failed to fetch dynamically imported module/i.test(e.reason?.message || '')) {
      console.warn("Chunk load failure in promise detected, reloading page...");
      window.location.reload();
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
