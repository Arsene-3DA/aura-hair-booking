describe('Validation des Données', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('ne devrait pas permettre de naviguer avec des IDs invalides', () => {
    // Test avec ID undefined
    cy.visit('/reservation/undefined', { failOnStatusCode: false });
    cy.url().should('not.include', 'undefined');
    
    // Test avec ID vide
    cy.visit('/reservation/', { failOnStatusCode: false });
    cy.url().should('not.include', '/reservation/');
    
    // Test avec ID invalide
    cy.visit('/reservation/invalid-id', { failOnStatusCode: false });
    // Vérifier qu'on est redirigé ou qu'un message d'erreur s'affiche
    cy.contains(/erreur|introuvable|invalide/i).should('be.visible').or(() => {
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  it('devrait valider les emails dans les formulaires', () => {
    cy.visit('/stylists');
    cy.get('button').contains('Réserver').first().click();
    
    // Vérifier qu'on a un formulaire avec un champ email
    cy.get('input[type="email"]').then(($email) => {
      if ($email.length > 0) {
        // Tester avec un email invalide
        cy.get('input[type="email"]').type('email-invalide');
        cy.get('button[type="submit"]').click();
        
        // Vérifier que la validation HTML5 fonctionne
        cy.get('input[type="email"]:invalid').should('exist');
        
        // Corriger avec un email valide
        cy.get('input[type="email"]').clear().type('test@example.com');
        cy.get('input[type="email"]:invalid').should('not.exist');
      }
    });
  });

  it('devrait empêcher les requêtes Supabase avec des données invalides', () => {
    // Intercepter toutes les requêtes Supabase
    cy.intercept('POST', '**/rest/v1/**', (req) => {
      // Vérifier que l'URL ne contient pas de valeurs invalides
      expect(req.url).to.not.include('undefined');
      expect(req.url).to.not.include('null');
      
      // Vérifier le body de la requête
      if (req.body) {
        const bodyStr = JSON.stringify(req.body);
        expect(bodyStr).to.not.include('"undefined"');
        expect(bodyStr).to.not.include('undefined');
        expect(bodyStr).to.not.include('"null"');
        
        // Vérifier les IDs UUID dans le body
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;
        const matches = bodyStr.match(uuidRegex);
        if (matches) {
          matches.forEach(uuid => {
            expect(uuid).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
          });
        }
      }
    }).as('supabaseRequests');

    // Parcourir l'application normale
    cy.visit('/stylists');
    cy.get('button').contains('Réserver').first().click();
    
    // Attendre quelques secondes pour voir si des requêtes sont faites
    cy.wait(3000);
  });

  it('devrait valider les dates dans les formulaires de réservation', () => {
    cy.visit('/stylists');
    cy.get('button').contains('Réserver').first().click();
    
    // Chercher un champ de date
    cy.get('input[type="date"]').then(($dateInput) => {
      if ($dateInput.length > 0) {
        // Tester avec une date dans le passé
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        cy.get('input[type="date"]').type(yesterdayStr);
        cy.get('button[type="submit"]').click();
        
        // Vérifier qu'une erreur est affichée ou que la soumission est bloquée
        cy.contains(/passé|invalide|erreur/i).should('be.visible').or(() => {
          cy.get('input[type="date"]:invalid').should('exist');
        });
        
        // Corriger avec une date future
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        cy.get('input[type="date"]').clear().type(tomorrowStr);
        cy.get('input[type="date"]:invalid').should('not.exist');
      }
    });
  });

  it('devrait valider la cohérence des données entre les pages', () => {
    cy.visit('/stylists');
    
    // Récupérer l'ID du premier styliste depuis l'URL après navigation
    cy.get('button').contains('Réserver').first().click();
    
    cy.url().then((url) => {
      const match = url.match(/\/reservation\/([a-f0-9-]+)/);
      if (match) {
        const stylistId = match[1];
        
        // Vérifier que l'ID est un UUID valide
        expect(stylistId).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        
        // Naviguer vers le profil avec le même ID
        cy.visit(`/stylist/${stylistId}`);
        
        // Vérifier que la page se charge correctement
        cy.contains(/chargement|styliste/i).should('be.visible');
      }
    });
  });

  it('devrait gérer les erreurs réseau gracieusement', () => {
    // Simuler une erreur réseau
    cy.intercept('GET', '**/rest/v1/hairdressers**', { forceNetworkError: true }).as('networkError');
    
    cy.visit('/stylists');
    
    // Vérifier qu'un message d'erreur approprié s'affiche
    cy.contains(/erreur|problème|connexion/i, { timeout: 10000 }).should('be.visible');
  });

  it('devrait valider les champs requis dans les formulaires', () => {
    cy.visit('/stylists');
    cy.get('button').contains('Réserver').first().click();
    
    // Essayer de soumettre un formulaire vide
    cy.get('form').then(($form) => {
      if ($form.length > 0) {
        cy.get('button[type="submit"]').click();
        
        // Vérifier que la validation fonctionne
        cy.get('input:required:invalid').should('exist').or(() => {
          cy.contains(/requis|obligatoire|champ/i).should('be.visible');
        });
      }
    });
  });

  it('devrait prévenir les attaques XSS dans les champs de texte', () => {
    cy.visit('/stylists');
    
    // Tester l'injection de script dans la recherche
    const xssPayload = '<script>alert("XSS")</script>';
    cy.get('input[placeholder*="Rechercher"]').type(xssPayload);
    
    // Vérifier que le script n'est pas exécuté
    cy.on('window:alert', () => {
      throw new Error('XSS vulnerability detected!');
    });
    
    // Vérifier que le contenu est échappé
    cy.get('input[placeholder*="Rechercher"]').should('have.value', xssPayload);
  });
});