/**
 * Utilitaires pour nettoyer les sessions conflictuelles
 */

import { supabase } from '@/integrations/supabase/client';

export const clearAllSessions = async () => {
  try {
    console.log('🧹 Clearing all conflicting sessions...');
    
    // Déconnexion forcée globale
    await supabase.auth.signOut({ scope: 'global' });
    
    // Nettoyer TOUT le localStorage
    const allKeys = Object.keys(localStorage);
    const authKeys = allKeys.filter(key => 
      key.includes('supabase') || 
      key.includes('session') || 
      key.includes('auth') ||
      key.includes('user') ||
      key.includes('role')
    );
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed: ${key}`);
    });
    
    // Nettoyer aussi le sessionStorage
    const sessionKeys = Object.keys(sessionStorage);
    const sessionAuthKeys = sessionKeys.filter(key => 
      key.includes('supabase') || 
      key.includes('session') || 
      key.includes('auth')
    );
    
    sessionAuthKeys.forEach(key => {
      sessionStorage.removeItem(key);
      console.log(`🗑️ Session removed: ${key}`);
    });
    
    console.log('✅ All sessions cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing sessions:', error);
    return false;
  }
};

export const validateSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('⚠️ Session error detected, clearing...');
      await clearAllSessions();
      return null;
    }
    
    if (!session) {
      console.log('ℹ️ No active session found');
      return null;
    }
    
    // Vérifier si la session est valide
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('⚠️ Invalid session detected, clearing...');
      await clearAllSessions();
      return null;
    }
    
    console.log('✅ Valid session found for:', user.email);
    return session;
  } catch (error) {
    console.error('❌ Session validation error:', error);
    await clearAllSessions();
    return null;
  }
};