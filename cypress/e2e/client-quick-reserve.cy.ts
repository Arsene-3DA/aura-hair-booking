describe('Client Quick Reserve E2E Tests', () => {
  beforeEach(() => {
    // Login as client
    cy.visit('/auth');
    cy.get('[data-cy=email-input]').type('client@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();
    cy.url().should('include', '/app');
  });

  it('should complete full reservation flow with validation', () => {
    cy.visit('/app');
    
    // Open quick reserve modal
    cy.get('[data-cy=quick-reserve-button]').click();
    cy.get('[data-cy=quick-reserve-modal]').should('be.visible');
    
    // Test form validation - try to submit empty form
    cy.get('[data-cy=confirm-reservation-button]').click();
    cy.get('[data-cy=form-errors]').should('be.visible');
    
    // Fill form step by step
    // Select stylist
    cy.get('[data-cy=stylist-select]').click();
    cy.get('[data-cy=stylist-option]').contains('Sophie Martin').click();
    
    // Select service
    cy.get('[data-cy=service-select]').click();
    cy.get('[data-cy=service-option]').contains('Coupe femme').click();
    
    // Select date (next week)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateString = nextWeek.toISOString().split('T')[0];
    
    cy.get('[data-cy=date-picker]').type(dateString);
    
    // Select available time slot
    cy.get('[data-cy=time-select]').click();
    cy.get('[data-cy=time-option]').contains('10:00').click();
    
    // Add preferences/comments
    cy.get('[data-cy=comments-input]').type('Première visite, coupe dégradée souhaitée');
    
    // Submit reservation
    cy.get('[data-cy=confirm-reservation-button]').click();
    
    // Verify success feedback
    cy.get('.toast').should('contain', 'Votre demande de réservation a été envoyée');
    
    // Modal should close
    cy.get('[data-cy=quick-reserve-modal]').should('not.exist');
    
    // New booking should appear in upcoming list
    cy.get('[data-cy=upcoming-bookings]').within(() => {
      cy.get('[data-cy=upcoming-booking-card]').should('contain', 'Sophie Martin');
      cy.get('[data-cy=upcoming-booking-card]').should('contain', 'Coupe femme');
      cy.get('[data-cy=booking-status]').should('contain', 'En attente');
    });
  });

  it('should validate date and time selection', () => {
    cy.visit('/app');
    cy.get('[data-cy=quick-reserve-button]').click();
    
    // Try to select past date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];
    
    cy.get('[data-cy=date-picker]').type(pastDate);
    cy.get('[data-cy=date-error]').should('contain', 'Impossible de réserver dans le passé');
    
    // Select valid future date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().split('T')[0];
    
    cy.get('[data-cy=date-picker]').clear().type(futureDate);
    cy.get('[data-cy=date-error]').should('not.exist');
    
    // Test time slot availability
    cy.get('[data-cy=stylist-select]').click();
    cy.get('[data-cy=stylist-option]').first().click();
    
    // Available time slots should be shown
    cy.get('[data-cy=time-select]').click();
    cy.get('[data-cy=time-option]').should('have.length.greaterThan', 0);
    
    // Unavailable slots should be disabled
    cy.get('[data-cy=time-option][disabled]').should('exist');
  });

  it('should show stylist availability and working hours', () => {
    cy.visit('/app');
    cy.get('[data-cy=quick-reserve-button]').click();
    
    // Select a stylist
    cy.get('[data-cy=stylist-select]').click();
    cy.get('[data-cy=stylist-option]').first().click();
    
    // Working hours should be displayed
    cy.get('[data-cy=working-hours]').should('be.visible');
    cy.get('[data-cy=working-hours]').should('contain', 'Horaires');
    
    // Select a date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    cy.get('[data-cy=date-picker]').type(dateString);
    
    // Available slots should reflect working hours
    cy.get('[data-cy=time-select]').click();
    cy.get('[data-cy=time-option]').each(($el) => {
      const time = $el.text();
      // Verify times are within business hours (e.g., 9:00-18:00)
      const hour = parseInt(time.split(':')[0]);
      expect(hour).to.be.at.least(9);
      expect(hour).to.be.at.most(18);
    });
  });
});