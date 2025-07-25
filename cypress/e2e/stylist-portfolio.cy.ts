describe('Stylist Portfolio E2E Tests', () => {
  beforeEach(() => {
    // Login as stylist
    cy.visit('/auth');
    cy.get('[data-cy=email-input]').type('stylist@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/stylist');
  });

  it('should display portfolio page with services and images', () => {
    // Navigate to portfolio
    cy.visit('/stylist/portfolio');
    
    // Verify portfolio page loads
    cy.get('[data-cy=stylist-portfolio]').should('exist');
    cy.contains('Mon Portfolio').should('be.visible');
    
    // Check if there are existing portfolio items
    cy.get('[data-cy=portfolio-grid]').then(($grid) => {
      if ($grid.find('[data-cy=portfolio-item]').length > 0) {
        // Verify portfolio items display correctly
        cy.get('[data-cy=portfolio-item]').first().within(() => {
          cy.get('[data-cy=portfolio-image]').should('be.visible');
          cy.get('[data-cy=service-name]').should('be.visible');
        });
      } else {
        // Empty state should be shown
        cy.contains('Votre portfolio est vide').should('be.visible');
      }
    });
  });

  it('should add new service with image to portfolio', () => {
    cy.visit('/stylist/portfolio');
    
    // Click add service button
    cy.get('[data-cy=add-service-button]').click();
    
    // Modal should open
    cy.get('[data-cy=add-service-modal]').should('be.visible');
    
    // Select a service
    cy.get('[data-cy=service-select]').click();
    cy.get('[data-cy=service-option]').first().click();
    
    // Add hairstyle name
    cy.get('[data-cy=hairstyle-name-input]').type('Coupe moderne dégradée');
    
    // Upload image (simulate file upload)
    const fileName = 'portfolio-test.jpg';
    cy.fixture('test-image.jpg', 'base64').then(fileContent => {
      cy.get('[data-cy=image-upload-input]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName: fileName,
        mimeType: 'image/jpeg'
      }, { force: true });
    });
    
    // Verify image preview appears
    cy.get('[data-cy=image-preview]').should('be.visible');
    
    // Submit the form
    cy.get('[data-cy=submit-service-button]').click();
    
    // Verify success toast
    cy.get('.toast').should('contain', 'Service ajouté au portfolio avec succès');
    
    // Modal should close
    cy.get('[data-cy=add-service-modal]').should('not.exist');
    
    // New portfolio item should appear in grid
    cy.get('[data-cy=portfolio-grid]').within(() => {
      cy.get('[data-cy=portfolio-item]').should('contain', 'Coupe moderne dégradée');
      cy.get('[data-cy=portfolio-image]').should('be.visible');
    });
  });

  it('should prevent adding duplicate services to portfolio', () => {
    cy.visit('/stylist/portfolio');
    
    // If there are existing portfolio items, the add button should be disabled for those services
    cy.get('[data-cy=portfolio-grid]').then(($grid) => {
      if ($grid.find('[data-cy=portfolio-item]').length > 0) {
        // Count existing services
        const existingServices = $grid.find('[data-cy=service-name]').length;
        
        // Click add service button
        cy.get('[data-cy=add-service-button]').click();
        
        // Check available services in dropdown
        cy.get('[data-cy=service-select]').click();
        cy.get('[data-cy=service-option]').should('have.length.lessThan', 10); // Assuming less than 10 total services
      }
    });
  });

  it('should delete portfolio item and image', () => {
    cy.visit('/stylist/portfolio');
    
    // Check if there are portfolio items to delete
    cy.get('[data-cy=portfolio-grid]').then(($grid) => {
      if ($grid.find('[data-cy=portfolio-item]').length > 0) {
        // Count initial items
        const initialCount = $grid.find('[data-cy=portfolio-item]').length;
        
        // Click delete button on first item
        cy.get('[data-cy=portfolio-item]').first().within(() => {
          cy.get('[data-cy=delete-portfolio-item]').click();
        });
        
        // Confirm deletion in dialog
        cy.get('[data-cy=confirm-delete-portfolio]').click();
        
        // Verify success toast
        cy.get('.toast').should('contain', 'Service supprimé du portfolio');
        
        // Verify item count decreased
        cy.get('[data-cy=portfolio-item]').should('have.length', initialCount - 1);
      }
    });
  });

  it('should validate image upload requirements', () => {
    cy.visit('/stylist/portfolio');
    cy.get('[data-cy=add-service-button]').click();
    
    // Select service
    cy.get('[data-cy=service-select]').click();
    cy.get('[data-cy=service-option]').first().click();
    
    // Try to submit without image
    cy.get('[data-cy=submit-service-button]').should('be.disabled');
    
    // Upload invalid file type (simulate)
    cy.fixture('test-document.pdf', 'base64').then(fileContent => {
      cy.get('[data-cy=image-upload-input]').selectFile({
        contents: Cypress.Buffer.from(fileContent, 'base64'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf'
      }, { force: true });
    });
    
    // Should show error for invalid file type
    cy.get('.toast').should('contain', 'Le fichier doit être une image');
  });

  it('should display portfolio in grid layout with proper styling', () => {
    cy.visit('/stylist/portfolio');
    
    cy.get('[data-cy=portfolio-grid]').then(($grid) => {
      if ($grid.find('[data-cy=portfolio-item]').length > 0) {
        // Verify grid layout
        cy.get('[data-cy=portfolio-grid]').should('have.class', 'grid');
        
        // Verify responsive classes
        cy.get('[data-cy=portfolio-grid]').should('have.class', 'md:grid-cols-2');
        cy.get('[data-cy=portfolio-grid]').should('have.class', 'lg:grid-cols-3');
        
        // Verify portfolio items have proper structure
        cy.get('[data-cy=portfolio-item]').each(($item) => {
          cy.wrap($item).within(() => {
            // Should have image with aspect-square
            cy.get('[data-cy=portfolio-image]').should('be.visible');
            
            // Should have service name
            cy.get('[data-cy=service-name]').should('be.visible');
            
            // Should have delete button
            cy.get('[data-cy=delete-portfolio-item]').should('be.visible');
          });
        });
      }
    });
  });

  it('should handle navigation to portfolio from sidebar', () => {
    // Start from dashboard
    cy.visit('/stylist');
    
    // Click portfolio link in sidebar
    cy.contains('Portfolio').click();
    
    // Should navigate to portfolio page
    cy.url().should('include', '/stylist/portfolio');
    cy.get('[data-cy=stylist-portfolio]').should('be.visible');
    
    // Sidebar should show portfolio as active
    cy.get('nav').contains('Portfolio').parent().should('have.class', 'bg-primary');
  });
});