/**
 * Utilitaires pour les tests et la validation
 */

export const mockStylelist = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Marie Dupont',
  email: 'marie@example.com',
  phone: '+33123456789',
  location: 'Paris 1er',
  specialties: ['Coupe', 'Couleur', 'Mèches'],
  experience: '5 ans d\'expérience',
  image_url: '/placeholder.svg',
  rating: 4.8,
  is_active: true
};

export const validateNavigation = (path: string): boolean => {
  try {
    const url = new URL(path, window.location.origin);
    return url.pathname.startsWith('/');
  } catch {
    return false;
  }
};

export const waitForElement = (selector: string, timeout = 5000): Promise<Element> => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

export const simulateUserInteraction = (element: Element, action: 'click' | 'focus' | 'blur') => {
  const event = new Event(action, { bubbles: true });
  element.dispatchEvent(event);
};

export const logSystemState = () => {
  console.log('=== État du système ===');
  console.log('URL actuelle:', window.location.href);
  console.log('Cartes stylistes:', document.querySelectorAll('[data-testid="stylist-card"]').length);
  console.log('Boutons réserver:', document.querySelectorAll('button:contains("Réserver")').length);
  console.log('Erreurs console:', window.console);
};