describe('Client Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Login as client user
    cy.visit('/auth');
    cy.get('[data-cy=email-input]').type('client@example.com');
    cy.get('[data-cy=password-input]').type('password123');
    cy.get('[data-cy=login-button]').click();
    
    // Wait for redirect to dashboard
    cy.url().should('include', '/app');
  });

  it('should display 3 upcoming bookings on dashboard', () => {
    // Navigate to client dashboard
    cy.visit('/app');
    
    // Verify upcoming bookings section exists
    cy.get('[data-cy=upcoming-bookings]').should('exist');
    
    // Check that we have upcoming booking cards (up to 3)
    cy.get('[data-cy=upcoming-booking-card]').should('have.length.at.most', 3);
    
    // Verify booking card contains required information
    cy.get('[data-cy=upcoming-booking-card]').first().within(() => {
      cy.get('[data-cy=service-name]').should('be.visible');
      cy.get('[data-cy=booking-date]').should('be.visible');
      cy.get('[data-cy=booking-status]').should('be.visible');
    });
  });

  it('should allow quick reservation flow', () => {
    cy.visit('/app');
    
    // Click quick reserve button
    cy.get('[data-cy=quick-reserve-button]').click();
    
    // Quick reserve modal should open
    cy.get('[data-cy=quick-reserve-modal]').should('be.visible');
    
    // Select a stylist
    cy.get('[data-cy=stylist-select]').click();
    cy.get('[data-cy=stylist-option]').first().click();
    
    // Select a service
    cy.get('[data-cy=service-select]').click();
    cy.get('[data-cy=service-option]').first().click();
    
    // Select a date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    cy.get('[data-cy=date-picker]').type(dateString);
    
    // Select a time
    cy.get('[data-cy=time-select]').click();
    cy.get('[data-cy=time-option]').first().click();
    
    // Add optional comment
    cy.get('[data-cy=comments-input]').type('Test reservation via E2E');
    
    // Confirm reservation
    cy.get('[data-cy=confirm-reservation-button]').click();
    
    // Verify success toast appears
    cy.get('.toast').should('contain', 'Votre demande de réservation a été envoyée');
    
    // Verify modal closes
    cy.get('[data-cy=quick-reserve-modal]').should('not.exist');
    
    // Verify new booking appears in upcoming list
    cy.get('[data-cy=upcoming-booking-card]').should('contain', 'Test reservation via E2E');
  });

  it('should allow leaving a review and see it in reviews page', () => {
    // First navigate to booking history
    cy.visit('/app/history');
    
    // Find a completed booking without review
    cy.get('[data-cy=completed-booking]').first().within(() => {
      // Click leave review button
      cy.get('[data-cy=leave-review-button]').click();
    });
    
    // Review modal should open
    cy.get('[data-cy=review-modal]').should('be.visible');
    
    // Select 5 stars rating
    cy.get('[data-cy=star-5]').click();
    
    // Verify 5 stars are selected
    cy.get('[data-cy=star-rating]').should('have.attr', 'data-rating', '5');
    
    // Add review comment
    cy.get('[data-cy=review-comment]').type('Excellente prestation ! Très satisfait du service reçu. Je recommande vivement ce salon.');
    
    // Submit review
    cy.get('[data-cy=submit-review-button]').click();
    
    // Verify success toast
    cy.get('.toast').should('contain', 'Votre avis a été publié');
    
    // Navigate to reviews page
    cy.visit('/app/reviews');
    
    // Verify review appears in the list
    cy.get('[data-cy=my-reviews]').should('contain', 'Excellente prestation ! Très satisfait du service reçu');
    
    // Verify rating is displayed
    cy.get('[data-cy=review-item]').first().within(() => {
      cy.get('[data-cy=review-stars]').should('contain', '5');
      cy.get('[data-cy=review-text]').should('contain', 'Excellente prestation ! Très satisfait du service reçu');
    });
  });

  it('should show active promotions carousel', () => {
    cy.visit('/app');
    
    // Verify promotions section exists
    cy.get('[data-cy=promotions-carousel]').should('exist');
    
    // Check if there are promotion cards
    cy.get('[data-cy=promotion-card]').then(($cards) => {
      if ($cards.length > 0) {
        // Verify promotion card content
        cy.get('[data-cy=promotion-card]').first().within(() => {
          cy.get('[data-cy=promotion-title]').should('be.visible');
          cy.get('[data-cy=promotion-description]').should('be.visible');
        });
        
        // Test carousel navigation if multiple promotions
        if ($cards.length > 1) {
          cy.get('[data-cy=carousel-next]').click();
          cy.wait(500); // Wait for transition
          
          cy.get('[data-cy=carousel-prev]').click();
          cy.wait(500);
        }
      }
    });
  });

  it('should manage notifications', () => {
    cy.visit('/app');
    
    // Click notifications bell
    cy.get('[data-cy=notifications-bell]').click();
    
    // Notifications panel should open
    cy.get('[data-cy=notifications-panel]').should('be.visible');
    
    // Check if there are notifications
    cy.get('[data-cy=notification-item]').then(($notifications) => {
      if ($notifications.length > 0) {
        // Click on first notification to mark as read
        cy.get('[data-cy=notification-item]').first().click();
        
        // Verify notification is marked as read (visual indicator change)
        cy.get('[data-cy=notification-item]').first().should('not.have.class', 'unread');
        
        // Test mark all as read if multiple notifications
        if ($notifications.length > 1) {
          cy.get('[data-cy=mark-all-read]').click();
          cy.get('.toast').should('contain', 'Toutes les notifications ont été marquées comme lues');
        }
      }
    });
    
    // Navigate to full notifications center
    cy.get('[data-cy=view-all-notifications]').click();
    cy.url().should('include', '/app/notifications');
    
    // Verify notifications center page
    cy.get('[data-cy=notifications-center]').should('exist');
  });

  it('should navigate through client dashboard sections', () => {
    // Test navigation between different sections
    const sections = [
      { path: '/app', cy: 'dashboard-overview' },
      { path: '/app/history', cy: 'booking-history' },
      { path: '/app/profile', cy: 'client-profile' },
      { path: '/app/reviews', cy: 'my-reviews' },
      { path: '/app/notifications', cy: 'notifications-center' }
    ];
    
    sections.forEach(section => {
      cy.visit(section.path);
      cy.get(`[data-cy=${section.cy}]`).should('exist');
    });
  });

  it('should display proper booking status badges', () => {
    cy.visit('/app/history');
    
    // Check different status badges are displayed correctly
    const statusTypes = ['pending', 'confirmed', 'completed', 'declined'];
    
    statusTypes.forEach(status => {
      cy.get(`[data-cy=booking-status-${status}]`).then(($badges) => {
        if ($badges.length > 0) {
          cy.get(`[data-cy=booking-status-${status}]`).first().should('be.visible');
        }
      });
    });
  });
});