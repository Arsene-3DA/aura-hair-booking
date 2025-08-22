// Client-side validation utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

export const validateFrenchPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  return cleanPhone.length >= 10 && /^[\+]?[0-9]{10,15}$/.test(cleanPhone);
};

// SECURITY FIX: Enhanced validation with server-side integration
import { supabase } from "@/integrations/supabase/client";

export const validatePassword = async (password: string): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    // Use server-side validation for enhanced security
    const { data, error } = await supabase.rpc('validate_password_strength', { password });
    
    if (error) {
      console.error('Server password validation failed:', error);
      // Fallback to client-side validation
      return validatePasswordClient(password);
    }
    
    return {
      isValid: (data as any)?.valid || false,
      errors: (data as any)?.errors || []
    };
  } catch (error) {
    console.error('Password validation error:', error);
    return validatePasswordClient(password);
  }
};

// Client-side fallback validation
const validatePasswordClient = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || password.length < 12) {
    errors.push('Le mot de passe doit contenir au moins 12 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  if (/password|123456|qwerty|admin|user/i.test(password)) {
    errors.push('Le mot de passe ne doit pas contenir de motifs courants');
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

export const sanitizeInput = (input: string, isNotes = false): string => {
  // SECURITY FIX: Enhanced input sanitization with special handling for notes
  if (isNotes) {
    // Pour les notes, préserver les espaces et caractères normaux
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags but keep content
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .slice(0, 1000); // Limit length to prevent buffer overflow
  }
  
  // Pour les autres champs, sanitisation plus stricte
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/&/g, '&amp;') // Escape ampersands
    .replace(/"/g, '&quot;') // Escape quotes
    .replace(/'/g, '&#x27;') // Escape single quotes
    .slice(0, 1000); // Limit length to prevent buffer overflow
};

// SECURITY FIX: Add CSRF token generation and validation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  if (!token || !expectedToken) return false;
  return token === expectedToken;
};

// SECURITY FIX: Add rate limiting helper
export const checkRateLimit = (key: string, maxAttempts: number, windowMs: number): boolean => {
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]');
  
  // Remove old attempts outside the window
  const validAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (validAttempts.length >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  // Add current attempt
  validAttempts.push(now);
  localStorage.setItem(`rateLimit_${key}`, JSON.stringify(validAttempts));
  
  return true; // Within rate limit
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s-']+$/.test(name);
};