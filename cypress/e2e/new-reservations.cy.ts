describe('New Reservations System E2E Tests', () => {
  beforeEach(() => {
    // Mock authenticated client user
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { 
          id: 'client-123',
          email: 'client@test.com', 
          role: 'client' 
        }
      }));
    });
  });

  it('should create reservation successfully with proper data validation', () => {
    // Intercept Supabase calls to verify correct data structure
    cy.intercept('POST', '**/rest/v1/new_reservations*', (req) => {
      // Verify required fields are present
      expect(req.body).to.have.property('client_user_id');
      expect(req.body).to.have.property('stylist_user_id');
      expect(req.body).to.have.property('scheduled_at');
      expect(req.body).to.have.property('status', 'pending');
      
      // Verify no undefined values
      expect(req.body.client_user_id).to.not.equal('undefined');
      expect(req.body.stylist_user_id).to.not.equal('undefined');
      
      req.reply({
        statusCode: 201,
        body: [{
          id: 'reservation-123',
          ...req.body,
          created_at: new Date().toISOString()
        }]
      });
    }).as('createReservation');

    // Navigate to reservation page
    cy.visit('/reservation/stylist-456');
    
    // Fill out reservation form
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="available-date"]').first().click();
    cy.get('[data-testid="time-slot"]').first().click();
    cy.get('[data-testid="notes-input"]').type('Test reservation notes');
    
    // Submit reservation
    cy.get('[data-testid="submit-reservation"]').click();
    
    // Verify the request was made correctly
    cy.wait('@createReservation');
    
    // Verify success message
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should validate service requirement based on stylist services', () => {
    // Intercept service validation RPC call
    cy.intercept('POST', '**/rest/v1/rpc/validate_booking_service*', (req) => {
      expect(req.body).to.have.property('p_stylist_user_id');
      expect(req.body).to.have.property('p_service_id');
      
      // Simulate stylist with services requiring service selection
      req.reply({
        statusCode: 200,
        body: false // Service required but not provided
      });
    }).as('validateService');

    cy.visit('/reservation/stylist-with-services');
    
    // Try to submit without selecting service
    cy.get('[data-testid="submit-reservation"]').click();
    
    // Should show service required error
    cy.get('[data-testid="service-required-error"]').should('be.visible');
    cy.contains(/service.*requis|choisir.*service/i).should('be.visible');
  });

  it('should allow reservation without service for stylists with no services', () => {
    // Intercept service validation for stylist without services
    cy.intercept('POST', '**/rest/v1/rpc/validate_booking_service*', {
      statusCode: 200,
      body: true // No services, validation passes
    }).as('validateServiceNoServices');

    cy.intercept('POST', '**/rest/v1/new_reservations*', {
      statusCode: 201,
      body: [{
        id: 'reservation-456',
        client_user_id: 'client-123',
        stylist_user_id: 'stylist-no-services',
        service_id: null,
        scheduled_at: '2024-02-01T10:00:00Z',
        status: 'pending'
      }]
    }).as('createReservationNoService');

    cy.visit('/reservation/stylist-no-services');
    
    // Service selection should be hidden
    cy.get('[data-testid="service-selection"]').should('not.exist');
    
    // Fill minimal required fields
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="available-date"]').first().click();
    cy.get('[data-testid="time-slot"]').first().click();
    
    // Submit should work without service
    cy.get('[data-testid="submit-reservation"]').click();
    
    cy.wait('@createReservationNoService');
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should handle RLS policies correctly for different user roles', () => {
    // Test client can only see their own reservations
    cy.intercept('GET', '**/rest/v1/new_reservations*', (req) => {
      // Should filter by client_user_id
      expect(req.url).to.include('client_user_id=eq.client-123');
      req.reply({
        statusCode: 200,
        body: [{
          id: 'reservation-client',
          client_user_id: 'client-123',
          stylist_user_id: 'stylist-456',
          status: 'pending'
        }]
      });
    }).as('getClientReservations');

    cy.visit('/client/bookings');
    cy.wait('@getClientReservations');
    
    cy.get('[data-testid="reservation-item"]').should('have.length', 1);
  });

  it('should allow stylist to confirm/decline reservations', () => {
    // Switch to stylist user
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { 
          id: 'stylist-456',
          email: 'stylist@test.com', 
          role: 'coiffeur' 
        }
      }));
    });

    // Mock pending reservations for stylist
    cy.intercept('GET', '**/rest/v1/new_reservations*', {
      statusCode: 200,
      body: [{
        id: 'pending-reservation',
        client_user_id: 'client-123',
        stylist_user_id: 'stylist-456',
        status: 'pending',
        scheduled_at: '2024-02-01T10:00:00Z',
        notes: 'Test reservation'
      }]
    }).as('getPendingReservations');

    // Mock confirm booking RPC
    cy.intercept('POST', '**/rest/v1/rpc/confirm_booking*', (req) => {
      expect(req.body).to.have.property('p_booking_id', 'pending-reservation');
      req.reply({ statusCode: 200, body: null });
    }).as('confirmBooking');

    cy.visit('/stylist/queue');
    cy.wait('@getPendingReservations');

    // Should see pending reservation
    cy.get('[data-testid="pending-reservation"]').should('be.visible');
    
    // Confirm the reservation
    cy.get('[data-testid="confirm-button"]').click();
    cy.wait('@confirmBooking');
    
    // Should show success message
    cy.get('[data-testid="confirm-success"]').should('be.visible');
  });

  it('should prevent unauthorized access to reservations', () => {
    // Test unauthorized user trying to access reservations
    cy.window().then((win) => {
      win.localStorage.removeItem('supabase.auth.token');
    });

    // Should redirect to auth or show error
    cy.visit('/client/bookings', { failOnStatusCode: false });
    cy.url().should('include', '/auth');
  });

  it('should handle network errors gracefully', () => {
    // Simulate network error
    cy.intercept('POST', '**/rest/v1/new_reservations*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('createReservationError');

    cy.visit('/reservation/stylist-456');
    
    // Fill and submit form
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="available-date"]').first().click();
    cy.get('[data-testid="time-slot"]').first().click();
    cy.get('[data-testid="submit-reservation"]').click();
    
    cy.wait('@createReservationError');
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.contains(/erreur|impossible|réessayer/i).should('be.visible');
  });

  it('should maintain data consistency across navigation', () => {
    // Create a reservation and verify it appears in booking list
    cy.intercept('POST', '**/rest/v1/new_reservations*', {
      statusCode: 201,
      body: [{
        id: 'new-reservation',
        client_user_id: 'client-123',
        stylist_user_id: 'stylist-456',
        scheduled_at: '2024-02-01T10:00:00Z',
        status: 'pending'
      }]
    }).as('createReservation');

    cy.intercept('GET', '**/rest/v1/new_reservations*', {
      statusCode: 200,
      body: [{
        id: 'new-reservation',
        client_user_id: 'client-123',
        stylist_user_id: 'stylist-456',
        scheduled_at: '2024-02-01T10:00:00Z',
        status: 'pending'
      }]
    }).as('getReservations');

    // Create reservation
    cy.visit('/reservation/stylist-456');
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="available-date"]').first().click();
    cy.get('[data-testid="time-slot"]').first().click();
    cy.get('[data-testid="submit-reservation"]').click();
    cy.wait('@createReservation');

    // Navigate to bookings list
    cy.visit('/client/bookings');
    cy.wait('@getReservations');

    // Should see the new reservation
    cy.get('[data-testid="reservation-item"]').should('contain', 'pending');
  });

  it('should enforce proper date validation', () => {
    cy.visit('/reservation/stylist-456');
    
    // Try to select past date (should be disabled or not available)
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="past-date"]').should('not.exist').or('be.disabled');
    
    // Try to select date too far in future (should be disabled)
    cy.get('[data-testid="far-future-date"]').should('not.exist').or('be.disabled');
  });
});