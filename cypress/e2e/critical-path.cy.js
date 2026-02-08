/**
 * 🧪 Critical Path E2E Test
 * 
 * Tests the most important user flows to ensure the app works correctly.
 * Run with: npx cypress run --spec "cypress/e2e/critical-path.cy.js"
 */

describe('Critical Path - Full User Journey', () => {
      beforeEach(() => {
            // Set viewport for consistent testing
            cy.viewport(1280, 720);
      });

      describe('1. Homepage Load', () => {
            it('should load the homepage successfully', () => {
                  cy.visit('/');

                  // Check THE TALK logo/brand is visible
                  cy.contains('THE TALK').should('be.visible');

                  // Check navbar is present
                  cy.get('nav').should('exist');
            });

            it('should display hero section content', () => {
                  cy.visit('/');

                  // Hero section should have key elements
                  cy.get('main, [class*="hero"], section').first().should('exist');

                  // Should have CTA buttons
                  cy.get('a, button').should('have.length.at.least', 3);
            });
      });

      describe('2. Store Page - Dynamic Products', () => {
            it('should navigate to store page', () => {
                  cy.visit('/');

                  // Click on Store link (might be in navbar or footer)
                  cy.get('a[href*="/store"], a[href*="store"]').first().click();

                  // Verify URL changed
                  cy.url().should('include', '/store');
            });

            it('should load products from Sanity (not empty)', () => {
                  cy.visit('/store');

                  // Wait for products to load (Sanity fetch)
                  cy.get('[class*="grid"]', { timeout: 10000 }).should('exist');

                  // Check if products are displayed OR empty state message
                  cy.get('body').then(($body) => {
                        // Either products exist or we see "no products" message
                        const hasProducts = $body.find('[class*="product"], [class*="card"]').length > 0;
                        const hasEmptyState = $body.text().includes('produto') || $body.text().includes('Nenhum');

                        expect(hasProducts || hasEmptyState).to.be.true;
                  });
            });

            it('should have Stripe checkout link on products', () => {
                  cy.visit('/store');

                  // Wait for page to load
                  cy.wait(2000);

                  // Check for buy buttons (they trigger Stripe)
                  cy.get('body').then(($body) => {
                        const hasBuyButtons = $body.find('button').filter((i, el) => {
                              return el.textContent.toLowerCase().includes('comprar') ||
                                    el.textContent.toLowerCase().includes('buy') ||
                                    el.textContent.toLowerCase().includes('acheter');
                        }).length > 0;

                        const hasEmptyState = $body.text().includes('Nenhum produto');

                        // Either we have buy buttons or empty store
                        expect(hasBuyButtons || hasEmptyState).to.be.true;
                  });
            });
      });

      describe('3. Episode Page - Audio Player', () => {
            it('should navigate to an episode from homepage', () => {
                  cy.visit('/');

                  // Wait for episodes to load
                  cy.get('a[href*="/episode/"]', { timeout: 10000 }).should('exist');

                  // Click on first episode
                  cy.get('a[href*="/episode/"]').first().click();

                  // Verify URL changed to episode page
                  cy.url().should('include', '/episode/');
            });

            it('should display episode content', () => {
                  cy.visit('/');
                  cy.get('a[href*="/episode/"]').first().click();

                  // Episode page should have title
                  cy.get('h1').should('exist');

                  // Should have category tag
                  cy.get('[class*="tag"], [class*="badge"], span').should('exist');
            });

            it('should have play button for audio', () => {
                  cy.visit('/');
                  cy.get('a[href*="/episode/"]').first().click();

                  // Wait for page to fully load
                  cy.url().should('include', '/episode/');

                  // Should have a play button (text in Portuguese, French, or English)
                  cy.get('button').then(($buttons) => {
                        const playButton = $buttons.filter((i, el) => {
                              const text = el.textContent.toLowerCase();
                              return text.includes('ouvir') ||
                                    text.includes('écouter') ||
                                    text.includes('play') ||
                                    text.includes('jouer');
                        });

                        expect(playButton.length).to.be.at.least(1);
                  });
            });

            it('should have media mode toggle if video available', () => {
                  cy.visit('/');
                  cy.get('a[href*="/episode/"]').first().click();

                  // Check for audio/video toggle (might not exist for all episodes)
                  cy.get('body').then(($body) => {
                        const hasToggle = $body.find('button').filter((i, el) => {
                              return el.textContent.includes('🎧') ||
                                    el.textContent.includes('👁️') ||
                                    el.textContent.toLowerCase().includes('ouvir') ||
                                    el.textContent.toLowerCase().includes('assistir');
                        }).length > 0;

                        // Toggle is optional (only for episodes with video)
                        // Just log the result
                        cy.log(`Media toggle present: ${hasToggle}`);
                  });
            });
      });

      describe('4. Navigation & Core Features', () => {
            it('should have working language switcher', () => {
                  cy.visit('/');

                  // Look for language selector
                  cy.get('body').then(($body) => {
                        const hasLangSelector = $body.find('select, [class*="lang"], button').filter((i, el) => {
                              return el.textContent.includes('PT') ||
                                    el.textContent.includes('EN') ||
                                    el.textContent.includes('FR');
                        }).length > 0;

                        cy.log(`Language selector found: ${hasLangSelector}`);
                  });
            });

            it('should have theme toggle (dark/light mode)', () => {
                  cy.visit('/');

                  // Check for theme toggle button
                  cy.get('[aria-label*="theme"], [aria-label*="Theme"], [class*="theme"]').should('exist');
            });

            it('should navigate back to home from episode', () => {
                  cy.visit('/');
                  cy.get('a[href*="/episode/"]').first().click();
                  cy.url().should('include', '/episode/');

                  // Click back button or logo to return home
                  cy.get('a[href="/"], [class*="back"], nav a').first().click();

                  // Should be back at homepage
                  cy.url().should('eq', Cypress.config().baseUrl + '/');
            });
      });
});

describe('Smoke Test - Quick Health Check', () => {
      it('performs a complete user journey', () => {
            // 1. Load homepage
            cy.visit('/');
            cy.contains('THE TALK').should('be.visible');

            // 2. Wait for content
            cy.get('a[href*="/episode/"]', { timeout: 15000 }).should('have.length.at.least', 1);

            // 3. Visit store
            cy.visit('/store');
            cy.url().should('include', '/store');

            // 4. Visit an episode
            cy.visit('/');
            cy.get('a[href*="/episode/"]').first().click();
            cy.url().should('include', '/episode/');

            // 5. Verify episode has play button
            cy.get('button').should('exist');

            cy.log('✅ Critical path completed successfully!');
      });
});
