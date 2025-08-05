/**
 * Utilitaires pour le formatage des prix en dollars canadiens
 */

export interface PriceFormatOptions {
  language?: 'fr' | 'en';
  showCurrency?: boolean;
  showCAD?: boolean;
}

/**
 * Formate un prix en dollars canadiens selon la langue
 * @param amount - Montant en dollars
 * @param options - Options de formatage
 * @returns Prix formaté avec le symbole $ et CAD si demandé
 */
export const formatPrice = (
  amount: number | null | undefined,
  options: PriceFormatOptions = {}
): string => {
  const {
    language = 'fr',
    showCurrency = true,
    showCAD = false
  } = options;

  // Gérer les valeurs nulles ou undefined
  if (amount === null || amount === undefined || isNaN(amount)) {
    return language === 'fr' ? 'Prix non disponible' : 'Price not available';
  }

  const formattedAmount = amount.toFixed(2);

  if (!showCurrency) {
    return formattedAmount;
  }

  // Format selon la langue
  if (language === 'fr') {
    // Format français : 25,00 $ CAD
    const frenchFormat = formattedAmount.replace('.', ',');
    return showCAD ? `${frenchFormat} $ CAD` : `${frenchFormat} $`;
  } else {
    // Format anglais : $25.00 CAD
    return showCAD ? `$${formattedAmount} CAD` : `$${formattedAmount}`;
  }
};

/**
 * Formate un prix avec la devise complète (toujours avec CAD)
 * @param amount - Montant en dollars
 * @param language - Langue pour le formatage
 * @returns Prix formaté avec CAD
 */
export const formatPriceWithCurrency = (
  amount: number | null | undefined,
  language: 'fr' | 'en' = 'fr'
): string => {
  return formatPrice(amount, { language, showCurrency: true, showCAD: true });
};

/**
 * Formate un prix sans symbole de devise
 * @param amount - Montant en dollars
 * @param language - Langue pour le formatage
 * @returns Prix formaté sans symbole
 */
export const formatPriceNumber = (
  amount: number | null | undefined,
  language: 'fr' | 'en' = 'fr'
): string => {
  return formatPrice(amount, { language, showCurrency: false });
};

/**
 * Parse un prix formaté en nombre
 * @param priceString - Prix sous forme de chaîne
 * @returns Nombre ou null si impossible à parser
 */
export const parsePrice = (priceString: string): number | null => {
  if (!priceString) return null;
  
  // Nettoyer la chaîne en supprimant les symboles et espaces
  const cleaned = priceString
    .replace(/[$\s]/g, '')
    .replace(/CAD/g, '')
    .replace(',', '.')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};