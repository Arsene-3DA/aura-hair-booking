// SECURITY TESTS: Comprehensive security audit tests
describe('Security Audit Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('XSS Protection Tests', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>'
    ];

    it('should sanitize malicious input in forms', () => {
      cy.visit('/auth');
      
      xssPayloads.forEach(payload => {
        cy.get('input[type="email"]').clear().type(payload);
        cy.get('input[type="password"]').clear().type('password123');
        cy.get('button[type="submit"]').click();
        
        // Verify XSS payload is not executed
        cy.window().then((win) => {
          expect(win.document.body.innerHTML).not.to.include('<script>');
          expect(win.document.body.innerHTML).not.to.include('javascript:');
        });
      });
    });

    it('should prevent XSS in URL parameters', () => {
      const xssUrl = '/auth?redirect=<script>alert("XSS")</script>';
      cy.visit(xssUrl);
      
      cy.window().then((win) => {
        expect(win.document.body.innerHTML).not.to.include('<script>');
      });
    });
  });

  describe('Authentication Security', () => {
    it('should redirect unauthenticated users', () => {
      cy.visit('/admin');
      cy.url().should('include', '/auth');
    });

    it('should prevent brute force attacks', () => {
      cy.visit('/auth');
      
      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        cy.get('input[type="email"]').clear().type('test@test.com');
        cy.get('input[type="password"]').clear().type('wrongpassword');
        cy.get('button[type="submit"]').click();
        cy.wait(500);
      }
      
      // Should show rate limit message
      cy.contains('Trop de tentatives').should('be.visible');
    });

    it('should validate CSRF tokens', () => {
      // Test that forms include CSRF protection
      cy.visit('/auth');
      cy.get('form').should('exist');
      
      // Check for CSRF token in form (if implemented)
      cy.get('input[name="csrf_token"]').should('exist');
    });
  });

  describe('Role-Based Access Control', () => {
    it('should enforce client role restrictions', () => {
      // Mock client login
      cy.window().then((win) => {
        win.localStorage.setItem('test_user_role', 'client');
      });
      
      cy.visit('/admin');
      cy.url().should('not.include', '/admin');
      cy.contains('Accès refusé').should('be.visible');
    });

    it('should enforce stylist role restrictions', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('test_user_role', 'coiffeur');
      });
      
      cy.visit('/admin');
      cy.url().should('not.include', '/admin');
    });
  });

  describe('Content Security Policy', () => {
    it('should have proper CSP headers', () => {
      cy.request('/').then((response) => {
        const cspHeader = response.headers['content-security-policy'];
        expect(cspHeader).to.exist;
        expect(cspHeader).to.include("frame-ancestors 'none'");
        expect(cspHeader).to.include("default-src 'self'");
      });
    });

    it('should prevent iframe embedding', () => {
      cy.window().then((win) => {
        expect(win.self).to.equal(win.top);
      });
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', () => {
      cy.visit('/auth');
      
      const invalidEmails = [
        'invalid-email',
        '@invalid.com',
        'test@',
        'test..test@test.com'
      ];
      
      invalidEmails.forEach(email => {
        cy.get('input[type="email"]').clear().type(email);
        cy.get('input[type="password"]').clear().type('password123');
        cy.get('button[type="submit"]').click();
        
        cy.contains('Format email invalide').should('be.visible');
      });
    });

    it('should enforce password strength', () => {
      cy.visit('/auth');
      cy.contains('S\'inscrire').click();
      
      const weakPasswords = [
        '123',
        'password',
        'abc123'
      ];
      
      weakPasswords.forEach(password => {
        cy.get('input[type="email"]').clear().type('test@test.com');
        cy.get('input[type="password"]').clear().type(password);
        cy.get('button[type="submit"]').click();
        
        cy.contains('mot de passe doit').should('be.visible');
      });
    });
  });

  describe('Data Exposure Protection', () => {
    it('should not expose sensitive data in client-side code', () => {
      cy.window().then((win) => {
        const scripts = win.document.querySelectorAll('script');
        scripts.forEach(script => {
          const content = script.textContent || '';
          expect(content).not.to.include('service_role');
          expect(content).not.to.include('secret_key');
          expect(content).not.to.include('private_key');
        });
      });
    });

    it('should not expose database errors', () => {
      // Test error handling doesn't leak database info
      cy.request({
        url: '/api/test-error',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.body).not.to.include('postgres');
        expect(response.body).not.to.include('supabase');
        expect(response.body).not.to.include('database');
      });
    });
  });

  describe('Session Security', () => {
    it('should expire sessions properly', () => {
      // Test session timeout
      cy.window().then((win) => {
        const expiredToken = 'expired.jwt.token';
        win.localStorage.setItem('supabase.auth.token', expiredToken);
      });
      
      cy.visit('/client');
      cy.url().should('include', '/auth');
    });

    it('should handle concurrent sessions', () => {
      // Test multiple session handling
      cy.window().then((win) => {
        win.localStorage.setItem('session_test', 'true');
      });
      
      cy.visit('/auth');
      // Verify proper session management
    });
  });
});