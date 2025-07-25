describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('allows user to navigate to login page', () => {
    cy.get('[data-testid="login-button"]').click()
    cy.url().should('include', '/auth')
    cy.get('h1').should('contain', 'Connexion')
  })

  it('displays validation errors for empty login form', () => {
    cy.visit('/auth')
    cy.get('[data-testid="login-form"]').submit()
    cy.get('[data-testid="email-error"]').should('be.visible')
    cy.get('[data-testid="password-error"]').should('be.visible')
  })

  it('allows admin user to access admin dashboard', () => {
    // Mock successful admin login
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { email: 'admin@test.com', role: 'admin' }
      }))
    })
    
    cy.visit('/admin')
    cy.get('h1').should('contain', 'Vue d\'ensemble')
    cy.get('[data-testid="admin-sidebar"]').should('be.visible')
  })

  it('allows stylist user to access stylist dashboard', () => {
    // Mock successful stylist login
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { email: 'stylist@test.com', role: 'coiffeur' }
      }))
    })
    
    cy.visit('/stylist')
    cy.get('h1').should('contain', 'Tableau de bord stylist')
    cy.get('[data-testid="stylist-navigation"]').should('be.visible')
  })

  it('allows client user to access client dashboard', () => {
    // Mock successful client login
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { email: 'client@test.com', role: 'client' }
      }))
    })
    
    cy.visit('/client')
    cy.get('[data-testid="client-dashboard"]').should('be.visible')
  })

  it('redirects unauthorized users from admin pages', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { email: 'client@test.com', role: 'client' }
      }))
    })
    
    cy.visit('/admin')
    cy.url().should('not.include', '/admin')
    cy.get('[data-testid="unauthorized-message"]').should('be.visible')
  })
})