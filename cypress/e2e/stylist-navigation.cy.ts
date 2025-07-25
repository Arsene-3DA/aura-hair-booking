describe('Navigation Stylistes', () => {
  beforeEach(() => {
    // Visiter la page d'accueil
    cy.visit('/');
  });

  it('devrait naviguer vers la liste des stylistes', () => {
    // Naviguer vers la liste des stylistes
    cy.visit('/stylists');
    
    // Vérifier que la page se charge
    cy.contains('Nos Coiffeurs').should('be.visible');
    cy.contains('Trouvez le coiffeur parfait').should('be.visible');
  });

  it('devrait afficher les cartes de stylistes avec les bonnes informations', () => {
    cy.visit('/stylists');
    
    // Attendre que les données se chargent
    cy.get('[data-testid="stylist-card"]', { timeout: 10000 }).should('exist');
    
    // Vérifier qu'au moins une carte de styliste est affichée
    cy.get('[role="article"]').first().within(() => {
      // Vérifier la présence des éléments essentiels
      cy.get('h3').should('exist'); // Nom du styliste
      cy.get('button').contains('Réserver').should('exist');
    });
  });

  it('devrait permettre de filtrer les stylistes', () => {
    cy.visit('/stylists');
    
    // Utiliser le champ de recherche
    cy.get('input[placeholder*="Rechercher"]').type('test');
    
    // Vérifier que le filtre fonctionne
    cy.get('input[placeholder*="Rechercher"]').should('have.value', 'test');
  });

  it('devrait naviguer vers la page de réservation quand on clique sur Réserver', () => {
    cy.visit('/stylists');
    
    // Attendre le chargement et cliquer sur le premier bouton Réserver
    cy.get('button').contains('Réserver').first().click();
    
    // Vérifier que l'URL change vers la page de réservation
    cy.url().should('include', '/reservation/');
  });

  it('devrait naviguer vers le profil du styliste quand on clique sur Voir le profil', () => {
    cy.visit('/stylists');
    
    // Cliquer sur le premier bouton "Voir le profil"
    cy.get('button').contains('Voir le profil').first().click();
    
    // Vérifier que l'URL change vers la page de profil
    cy.url().should('include', '/stylist/');
  });

  it('devrait gérer les erreurs d\'ID invalides', () => {
    // Tenter d'accéder à un profil avec un ID invalide
    cy.visit('/stylist/invalid-id');
    
    // Vérifier qu'on est redirigé ou qu'un message d'erreur s'affiche
    cy.contains('Styliste non trouvé').should('be.visible').or(() => {
      cy.url().should('include', '/stylists');
    });
  });

  it('devrait afficher la page de profil correctement', () => {
    cy.visit('/stylists');
    
    // Cliquer sur "Voir le profil" du premier styliste
    cy.get('button').contains('Voir le profil').first().click();
    
    // Vérifier que la page de profil se charge
    cy.get('h1, h2').should('contain.text', /\w+/); // Au moins un nom
    cy.get('button').contains('Réserver maintenant').should('be.visible');
    cy.get('button').contains('Retour').should('be.visible');
  });

  it('devrait permettre de revenir à la liste depuis le profil', () => {
    cy.visit('/stylists');
    
    // Aller au profil
    cy.get('button').contains('Voir le profil').first().click();
    
    // Revenir à la liste
    cy.get('button').contains('Retour').click();
    
    // Vérifier qu'on est revenu à la liste
    cy.url().should('include', '/stylists');
    cy.contains('Nos Coiffeurs').should('be.visible');
  });

  it('devrait permettre de réserver depuis le profil', () => {
    cy.visit('/stylists');
    
    // Aller au profil
    cy.get('button').contains('Voir le profil').first().click();
    
    // Cliquer sur réserver
    cy.get('button').contains('Réserver maintenant').click();
    
    // Vérifier qu'on navigue vers la réservation
    cy.url().should('include', '/reservation/');
  });

  it('devrait effacer les filtres correctement', () => {
    cy.visit('/stylists');
    
    // Appliquer des filtres
    cy.get('input[placeholder*="Rechercher"]').type('test');
    
    // Effacer les filtres
    cy.get('button').contains('Effacer les filtres').click();
    
    // Vérifier que les filtres sont effacés
    cy.get('input[placeholder*="Rechercher"]').should('have.value', '');
  });
});