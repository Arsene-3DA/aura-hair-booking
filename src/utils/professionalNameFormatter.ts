/**
 * Utilitaire pour formater l'affichage des noms des professionnels
 * Règle : afficher le nom réel ou "Professionnel" comme fallback
 */

export const formatProfessionalName = (name?: string | null): string => {
  // Vérifier si le nom existe et n'est pas juste des espaces
  if (name && name.trim().length > 0) {
    return name.trim();
  }
  
  // Fallback par défaut
  return "Professionnel";
};

/**
 * Obtenir les initiales d'un professionnel pour l'avatar
 */
export const getProfessionalInitials = (name?: string | null): string => {
  const formattedName = formatProfessionalName(name);
  
  if (formattedName === "Professionnel") {
    return "P";
  }
  
  // Extraire les initiales du nom
  const nameParts = formattedName.split(' ').filter(part => part.length > 0);
  if (nameParts.length >= 2) {
    return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
  }
  
  return nameParts[0]?.charAt(0).toUpperCase() || "P";
};