describe('Admin Dashboard E2E Tests', () => {
  beforeEach(() => {
    // Mock authenticated admin user
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { email: 'admin@test.com', role: 'admin' }
      }))
    })
    cy.visit('/admin')
  })

  it('displays admin dashboard overview', () => {
    cy.get('[data-testid="admin-overview"]').should('be.visible')
    cy.get('[data-testid="stats-cards"]').should('be.visible')
    cy.get('[data-testid="revenue-chart"]').should('be.visible')
  })

  it('allows navigation to user management', () => {
    cy.get('[data-testid="nav-users"]').click()
    cy.url().should('include', '/admin/users')
    cy.get('[data-testid="users-table"]').should('be.visible')
  })

  it('allows filtering users', () => {
    cy.visit('/admin/users')
    cy.get('[data-testid="user-search"]').type('test@example.com')
    cy.get('[data-testid="role-filter"]').select('client')
    cy.get('[data-testid="users-table"] tbody tr').should('have.length.lessThan', 10)
  })

  it('allows promoting user roles', () => {
    cy.visit('/admin/users')
    cy.get('[data-testid="user-actions"]').first().click()
    cy.get('[data-testid="promote-admin"]').click()
    cy.get('[data-testid="success-toast"]').should('be.visible')
  })

  it('allows viewing bookings management', () => {
    cy.get('[data-testid="nav-bookings"]').click()
    cy.url().should('include', '/admin/bookings')
    cy.get('[data-testid="bookings-table"]').should('be.visible')
    cy.get('[data-testid="export-csv"]').should('be.visible')
  })

  it('allows filtering bookings by status', () => {
    cy.visit('/admin/bookings')
    cy.get('[data-testid="status-filter"]').select('en_attente')
    cy.get('[data-testid="bookings-table"] tbody tr').should('exist')
  })

  it('allows exporting bookings to CSV', () => {
    cy.visit('/admin/bookings')
    cy.get('[data-testid="export-csv"]').click()
    // Note: In a real test, you'd verify file download
    cy.get('[data-testid="export-success"]').should('be.visible')
  })

  it('displays platform settings', () => {
    cy.get('[data-testid="nav-settings"]').click()
    cy.url().should('include', '/admin/settings')
    cy.get('[data-testid="platform-settings"]').should('be.visible')
    cy.get('[data-testid="supabase-quotas"]').should('be.visible')
  })

  it('shows audit trail', () => {
    cy.get('[data-testid="nav-audit"]').click()
    cy.url().should('include', '/admin/audit')
    cy.get('[data-testid="audit-events"]').should('be.visible')
    cy.get('[data-testid="severity-filter"]').should('be.visible')
  })
})