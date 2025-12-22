describe('User Journey - Homepage to Episode', () => {
    beforeEach(() => {
        // Visit the homepage before each test
        cy.visit('/');
    });

    it('should display the THE TALK logo', () => {
        // Verify the logo is visible
        cy.contains('THE TALK').should('be.visible');
    });

    it('should navigate to episode page when clicking on first episode card', () => {
        // Wait for episodes to load
        cy.get('[class*="grid"]').should('exist');

        // Click on the first episode card (link with episode in href)
        cy.get('a[href*="/episode/"]').first().click();

        // Check if URL changed to /episode/...
        cy.url().should('include', '/episode/');
    });

    it('should show play button on episode page', () => {
        // Navigate to first episode
        cy.get('a[href*="/episode/"]').first().click();

        // Wait for page to load
        cy.url().should('include', '/episode/');

        // Check if the play button exists (contains "Écouter" or play icon)
        cy.contains(/écouter|play|jouer/i).should('exist');
    });

    it('complete user journey: homepage → episode → verify elements', () => {
        // 1. Verify homepage loaded with logo
        cy.contains('THE TALK').should('be.visible');

        // 2. Wait for content to load
        cy.get('a[href*="/episode/"]', { timeout: 10000 }).should('have.length.at.least', 1);

        // 3. Click on first episode card
        cy.get('a[href*="/episode/"]').first().click();

        // 4. Verify URL changed
        cy.url().should('include', '/episode/');

        // 5. Verify episode page elements
        cy.get('button').contains(/écouter|play/i).should('exist');
    });
});
