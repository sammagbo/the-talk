import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';

// Mock Home page to avoid complexity of real Home component
vi.mock('./pages/Home', () => ({
    default: () => (
        <div>
            <h1>THE TALK</h1>
            <p>By Mijean Rochus &amp; Gleid</p>
        </div>
    )
}));

// Mock global fetch
global.fetch = vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ contents: '<rss></rss>' }),
    })
);

describe('App', () => {
    it('renders the home route with THE TALK branding', async () => {
        render(
            <HelmetProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </HelmetProvider>
        );

        // Check for "THE TALK" branding
        const logoText = await screen.findByText(/THE TALK/i);
        expect(logoText).toBeDefined();

        // Check for the hosts credit
        const subText = await screen.findByText(/By Mijean Rochus/i);
        expect(subText).toBeDefined();
    });
});
