import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        viewportWidth: 1280,
        viewportHeight: 720,
        defaultCommandTimeout: 10000,
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});
