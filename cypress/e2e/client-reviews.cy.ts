describe('Client Reviews E2E Tests', () => {
  beforeEach(() => {
    // Login as client
    cy.visit('/auth');
    cy.get('[data-cy=email-input]').type('client@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/app');
  });

  it('should create, edit and delete reviews', () => {
    // Navigate to booking history
    cy.visit('/app/history');
    
    // Find a completed booking without review
    cy.get('[data-cy=completed-booking]').first().within(() => {
      cy.get('[data-cy=leave-review-button]').should('be.visible').click();
    });
    
    // Create review
    cy.get('[data-cy=review-modal]').should('be.visible');
    cy.get('[data-cy=star-4]').click(); // 4 stars
    cy.get('[data-cy=review-comment]').type('Très bon service, styliste professionnel');
    cy.get('[data-cy=submit-review-button]').click();
    
    // Verify success
    cy.get('.toast').should('contain', 'Votre avis a été publié');
    
    // Go to reviews page
    cy.visit('/app/reviews');
    
    // Verify review exists
    cy.get('[data-cy=review-item]').first().within(() => {
      cy.get('[data-cy=review-stars]').should('contain', '4');
      cy.get('[data-cy=review-text]').should('contain', 'Très bon service');
      
      // Edit review
      cy.get('[data-cy=edit-review-button]').click();
    });
    
    // Edit review modal
    cy.get('[data-cy=edit-review-modal]').should('be.visible');
    cy.get('[data-cy=star-5]').click(); // Change to 5 stars
    cy.get('[data-cy=review-comment]').clear().type('Service exceptionnel ! Je recommande fortement.');
    cy.get('[data-cy=save-review-button]').click();
    
    // Verify edit success
    cy.get('.toast').should('contain', 'Avis modifié avec succès');
    
    // Verify changes
    cy.get('[data-cy=review-item]').first().within(() => {
      cy.get('[data-cy=review-stars]').should('contain', '5');
      cy.get('[data-cy=review-text]').should('contain', 'Service exceptionnel');
      
      // Delete review
      cy.get('[data-cy=delete-review-button]').click();
    });
    
    // Confirm deletion
    cy.get('[data-cy=confirm-delete-review]').click();
    
    // Verify deletion success
    cy.get('.toast').should('contain', 'Avis supprimé');
    
    // Verify review is removed from list
    cy.get('[data-cy=review-item]').should('not.contain', 'Service exceptionnel');
  });

  it('should prevent duplicate reviews for same booking', () => {
    // Navigate to booking history
    cy.visit('/app/history');
    
    // Try to leave review on booking that already has one
    cy.get('[data-cy=booking-with-review]').first().within(() => {
      // Should show "View Review" instead of "Leave Review"
      cy.get('[data-cy=view-review-button]').should('be.visible');
      cy.get('[data-cy=leave-review-button]').should('not.exist');
    });
  });
});