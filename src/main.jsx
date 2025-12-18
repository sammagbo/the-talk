import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import * as Sentry from '@sentry/react'
import './index.css'
import './i18n'; // Import i18n configuration
import App from './App.jsx'

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  tracesSampleRate: 1.0,
  // Capture Replay for 10% of all sessions, plus 100% of sessions with errors
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Fallback UI component for error boundary
const FallbackComponent = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>😅 Oops!</h1>
    <p style={{ fontSize: '1.25rem', color: '#a0a0a0', marginBottom: '2rem' }}>
      Algo deu errado. Por favor, tente recarregar a página.
    </p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '0.75rem 2rem',
        fontSize: '1rem',
        backgroundColor: '#8b5cf6',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
    >
      Recarregar página
    </button>
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<FallbackComponent />} showDialog>
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </HelmetProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
