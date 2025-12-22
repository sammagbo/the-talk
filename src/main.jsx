import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import './i18n'; // Import i18n configuration
import App from './App.jsx'

// Initialize Sentry only in production with proper error handling
let Sentry = null;
if (import.meta.env.VITE_SENTRY_DSN && import.meta.env.PROD) {
  try {
    import('@sentry/react').then((SentryModule) => {
      SentryModule.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [
          SentryModule.browserTracingIntegration(),
        ],
        tracesSampleRate: 0.5,
      });
      Sentry = SentryModule;
    }).catch(() => {
      console.warn('Sentry failed to load');
    });
  } catch (e) {
    console.warn('Sentry initialization failed:', e);
  }
}

// Simple render without StrictMode to avoid iOS Safari issues
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}

