// Utilitaires de validation des données pour éviter les erreurs Supabase

/**
 * Valide qu'un ID UUID est valide et non undefined
 */
export const validateUUID = (id: string | undefined | null): boolean => {
  if (!id || id === 'undefined' || id === 'null' || id.trim() === '') {
    return false;
  }
  
  // Regex UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Valide les données avant une requête Supabase
 */
export const validateSupabaseQuery = (params: Record<string, any>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Vérifier les IDs
  Object.entries(params).forEach(([key, value]) => {
    if (key.includes('id') || key.includes('Id')) {
      if (!validateUUID(value)) {
        errors.push(`${key} invalide: ${value}`);
      }
    }
    
    // Vérifier les valeurs undefined/null
    if (value === undefined || value === 'undefined') {
      errors.push(`${key} ne peut pas être undefined`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Nettoie un objet de toutes les valeurs undefined/null
 */
export const cleanObjectForSupabase = (obj: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== 'undefined' && value !== 'null') {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

/**
 * Valide une adresse email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone français
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return cleanPhone.length >= 10 && /^[\+]?[0-9]{10,15}$/.test(cleanPhone);
};

/**
 * Valide les données d'une réservation
 */
export const validateBookingData = (data: {
  stylistId?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  service?: string;
  date?: string;
  time?: string;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validation de l'ID du styliste
  if (!validateUUID(data.stylistId)) {
    errors.push('ID du styliste invalide');
  }
  
  // Validation du nom client
  if (!data.clientName || data.clientName.trim().length < 2) {
    errors.push('Le nom du client doit contenir au moins 2 caractères');
  }
  
  // Validation de l'email
  if (!data.clientEmail || !validateEmail(data.clientEmail)) {
    errors.push('Adresse email invalide');
  }
  
  // Validation du téléphone
  if (!data.clientPhone || !validatePhoneNumber(data.clientPhone)) {
    errors.push('Numéro de téléphone invalide');
  }
  
  // Validation du service
  if (!data.service || data.service.trim().length === 0) {
    errors.push('Un service doit être sélectionné');
  }
  
  // Validation de la date
  if (!data.date) {
    errors.push('Une date doit être sélectionnée');
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push('La date ne peut pas être dans le passé');
    }
    
    // Pas plus d'un an à l'avance
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (selectedDate > oneYearFromNow) {
      errors.push('La date ne peut pas dépasser 1 an');
    }
  }
  
  // Validation de l'heure
  if (!data.time) {
    errors.push('Une heure doit être sélectionnée');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Logger pour debug des erreurs de validation
 */
export const logValidationError = (context: string, error: any, data?: any) => {
  console.error(`[Validation Error - ${context}]`, {
    error: error instanceof Error ? error.message : error,
    data,
    timestamp: new Date().toISOString()
  });
};