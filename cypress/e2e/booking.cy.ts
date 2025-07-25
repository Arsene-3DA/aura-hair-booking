describe('Booking Flow E2E Tests', () => {
  beforeEach(() => {
    // Mock authenticated client user
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { email: 'client@test.com', role: 'client' }
      }))
    })
  })

  it('allows client to browse professionals', () => {
    cy.visit('/professionals/all')
    cy.get('[data-testid="professional-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="professional-name"]').first().should('be.visible')
    cy.get('[data-testid="professional-rating"]').first().should('be.visible')
  })

  it('allows client to filter professionals by gender', () => {
    cy.visit('/professionals/male')
    cy.get('[data-testid="gender-filter"]').should('contain', 'Hommes')
    cy.get('[data-testid="professional-card"]').should('exist')
  })

  it('allows client to select a professional and start booking', () => {
    cy.visit('/professionals/all')
    cy.get('[data-testid="book-appointment-button"]').first().click()
    cy.url().should('include', '/reservation/')
    cy.get('[data-testid="booking-form"]').should('be.visible')
  })

  it('guides user through booking process', () => {
    cy.visit('/reservation/test-hairdresser-id')
    
    // Select service
    cy.get('[data-testid="service-selection"]').should('be.visible')
    cy.get('[data-testid="service-option"]').first().click()
    
    // Select date
    cy.get('[data-testid="date-picker"]').should('be.visible')
    cy.get('[data-testid="available-date"]').first().click()
    
    // Select time
    cy.get('[data-testid="time-slots"]').should('be.visible')
    cy.get('[data-testid="time-slot"]').first().click()
    
    // Fill contact details
    cy.get('[data-testid="client-name"]').type('Test Client')
    cy.get('[data-testid="client-phone"]').type('0123456789')
    
    // Submit booking
    cy.get('[data-testid="confirm-booking"]').click()
    cy.get('[data-testid="booking-success"]').should('be.visible')
  })

  it('validates required fields in booking form', () => {
    cy.visit('/reservation/test-hairdresser-id')
    
    cy.get('[data-testid="confirm-booking"]').click()
    cy.get('[data-testid="validation-error"]').should('be.visible')
  })

  it('allows client to view booking history', () => {
    cy.visit('/client/history')
    cy.get('[data-testid="booking-history"]').should('be.visible')
    cy.get('[data-testid="booking-item"]').should('exist')
  })
})