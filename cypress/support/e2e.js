// Cypress E2E Support File
// This file is processed before each test file

// Import commands.js (if needed)
// import './commands'

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
    // Return false to prevent Cypress from failing the test
    return false;
});
