// cypress/support/commands.ts

Cypress.Commands.add('login', (role: 'admin' | 'client' | 'coiffeur') => {
  const users = {
    admin: { email: 'admin@test.com', role: 'admin' },
    client: { email: 'client@test.com', role: 'client' },
    coiffeur: { email: 'stylist@test.com', role: 'coiffeur' }
  }

  cy.window().then((win) => {
    win.localStorage.setItem('supabase.auth.token', JSON.stringify({
      user: users[role]
    }))
  })
})

Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('supabase.auth.token')
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(role: 'admin' | 'client' | 'coiffeur'): Chainable<void>
      logout(): Chainable<void>
    }
  }
}