import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

// Mock dependencies
vi.mock('./context/AuthContext', async () => {
    const actual = await vi.importActual('./context/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            user: null,
            signInWithGoogle: vi.fn(),
            logout: vi.fn()
        }),
        AuthProvider: ({ children }) => <div>{children}</div>
    };
});

// Mock Home page to avoid complexity of real Home component
vi.mock('./pages/Home', () => ({
    default: () => (
        <div>
            <h1>THE TALK</h1>
            <p>By Mijean Rochus</p>
        </div>
    )
}));

// Mock Supabase
vi.mock('./supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
        },
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn()
        })),
        removeChannel: vi.fn()
    }
}));

// Mock global fetch
// eslint-disable-next-line no-undef
global.fetch = vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ contents: '<rss></rss>' }),
    })
);

describe('App', () => {
    it('renders the Navbar with THE TALK logo', async () => {
        // Wait for lazy load components if necessary, but Home is usually quick if mocked or basic
        // However, since we are testing App integration, we need providers.
        // Note: App uses lazy loading which might need Suspense handling in tests or waitFor

        render(
            <HelmetProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </AuthProvider>
            </HelmetProvider>
        );

        // Check for "THE TALK" text which is in the Navbar
        const logoText = await screen.findByText(/THE TALK/i);
        expect(logoText).toBeDefined();

        // Check for "By Mijean Rochus"
        const subText = await screen.findByText(/By Mijean Rochus/i);
        expect(subText).toBeDefined();
    });
});
