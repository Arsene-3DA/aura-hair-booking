// Client-side validation utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

export const validateFrenchPhone = (phone: string): boolean => {
  // French phone number format: +33 or 0 followed by 9 digits
  const phoneRegex = /^(\+33|0)[1-9]([0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBookingData = (data: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  bookingDate: string;
  time: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate required fields
  if (!data.clientName.trim()) {
    errors.push('Le nom est requis');
  }
  
  if (!data.clientEmail.trim()) {
    errors.push('L\'email est requis');
  } else if (!validateEmail(data.clientEmail)) {
    errors.push('L\'email n\'est pas valide');
  }
  
  if (!data.clientPhone.trim()) {
    errors.push('Le téléphone est requis');
  } else if (!validateFrenchPhone(data.clientPhone)) {
    errors.push('Le numéro de téléphone n\'est pas valide (format français attendu)');
  }
  
  if (!data.service.trim()) {
    errors.push('Le service est requis');
  }
  
  if (!data.bookingDate) {
    errors.push('La date est requise');
  } else {
    const selectedDate = new Date(data.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.push('La date ne peut pas être dans le passé');
    }
    
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    
    if (selectedDate > maxDate) {
      errors.push('La date ne peut pas dépasser 1 an');
    }
  }
  
  if (!data.time.trim()) {
    errors.push('L\'heure est requise');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s-']+$/.test(name);
};