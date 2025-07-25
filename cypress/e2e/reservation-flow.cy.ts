describe('Flux de Réservation Complet', () => {
  beforeEach(() => {
    // Configuration de base
    cy.visit('/');
  });

  it('devrait permettre de faire une réservation complète depuis la liste des stylistes', () => {
    // 1. Naviguer vers la liste des stylistes
    cy.visit('/stylists');
    cy.contains('Nos Coiffeurs').should('be.visible');
    
    // 2. Cliquer sur "Réserver" pour le premier styliste
    cy.get('button').contains('Réserver').first().click();
    
    // 3. Vérifier qu'on arrive sur la page de réservation
    cy.url().should('include', '/reservation/');
    cy.contains('Retour').should('be.visible');
    
    // 4. Vérifier que les informations du styliste sont affichées
    cy.get('h1').should('exist'); // Nom du styliste
    cy.get('img').should('exist'); // Avatar du styliste
  });

  it('devrait valider les données avant d\'envoyer à Supabase', () => {
    // Naviguer directement vers une page de réservation avec un ID valide
    cy.visit('/stylists');
    cy.get('button').contains('Réserver').first().click();
    
    // Vérifier que le formulaire existe
    cy.get('form').should('exist');
    
    // Essayer de soumettre le formulaire vide
    cy.get('button[type="submit"]').click();
    
    // Vérifier que la validation fonctionne (messages d'erreur ou prévention de soumission)
    cy.get('input:invalid').should('exist').or(() => {
      cy.contains(/requis|obligatoire|erreur/i).should('be.visible');
    });
  });

  it('ne devrait pas faire de requête Supabase avec des IDs undefined', () => {
    // Intercepter les requêtes vers Supabase
    cy.intercept('POST', '**/rest/v1/**', (req) => {
      // Vérifier qu'aucune requête ne contient undefined dans l'URL ou le body
      expect(req.url).to.not.include('undefined');
      if (req.body) {
        expect(JSON.stringify(req.body)).to.not.include('undefined');
      }
    }).as('supabaseRequests');

    // Naviguer vers la liste et cliquer sur réserver
    cy.visit('/stylists');
    cy.get('button').contains('Réserver').first().click();
    
    // Attendre un moment pour voir si des requêtes problématiques sont faites
    cy.wait(2000);
    
    // Vérifier qu'on est bien sur une page de réservation valide
    cy.url().should('match', /\/reservation\/[a-zA-Z0-9-]+$/);
  });

  it('devrait gérer les erreurs de navigation gracieusement', () => {
    // Tenter d'accéder à une réservation avec un ID invalide
    cy.visit('/reservation/undefined', { failOnStatusCode: false });
    
    // Vérifier qu'on est redirigé ou qu'un message d'erreur s'affiche
    cy.url().should('not.include', 'undefined').or(() => {
      cy.contains(/erreur|introuvable|invalide/i).should('be.visible');
    });
  });

  it('devrait maintenir la cohérence des données entre les pages', () => {
    cy.visit('/stylists');
    
    // Récupérer le nom du premier styliste dans la liste
    cy.get('[role="article"]').first().within(() => {
      cy.get('h3').invoke('text').as('stylistName');
    });
    
    // Cliquer sur réserver
    cy.get('button').contains('Réserver').first().click();
    
    // Vérifier que le même nom apparaît sur la page de réservation
    cy.get('@stylistName').then((name) => {
      cy.contains(name as string).should('be.visible');
    });
  });

  it('devrait permettre de revenir en arrière sans perdre de données', () => {
    cy.visit('/stylists');
    
    // Appliquer un filtre
    cy.get('input[placeholder*="Rechercher"]').type('test');
    
    // Aller vers une réservation
    cy.get('button').contains('Réserver').first().click();
    
    // Revenir en arrière
    cy.get('button').contains('Retour').click();
    
    // Vérifier qu'on est revenu à la liste avec le filtre intact
    cy.url().should('include', '/stylists');
    cy.get('input[placeholder*="Rechercher"]').should('have.value', 'test');
  });

  it('devrait afficher des messages d\'erreur clairs en cas de problème', () => {
    // Simuler une erreur réseau
    cy.intercept('GET', '**/rest/v1/hairdressers**', { statusCode: 500 }).as('errorRequest');
    
    cy.visit('/stylists');
    
    // Attendre la requête qui échoue
    cy.wait('@errorRequest');
    
    // Vérifier qu'un message d'erreur approprié s'affiche
    cy.contains(/erreur|impossible|problème/i).should('be.visible');
  });

  it('devrait empêcher les soumissions multiples du formulaire', () => {
    cy.visit('/stylists');
    cy.get('button').contains('Réserver').first().click();
    
    // Si un formulaire de réservation existe
    cy.get('form').then(($form) => {
      if ($form.length > 0) {
        // Remplir le formulaire rapidement
        cy.get('input[type="text"]').first().type('Test Client');
        cy.get('input[type="email"]').first().type('test@example.com');
        
        // Cliquer plusieurs fois rapidement sur le bouton de soumission
        cy.get('button[type="submit"]').click().click().click();
        
        // Vérifier qu'une seule soumission est traitée (le bouton devrait être désactivé)
        cy.get('button[type="submit"]').should('be.disabled').or(() => {
          // Ou vérifier qu'on ne voit qu'un seul message de confirmation
          cy.get('[role="alert"], .toast').should('have.length.lte', 1);
        });
      }
    });
  });
});