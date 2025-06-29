
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface TestUser {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'coiffeur' | 'client';
  telephone?: string;
  specialties?: string[];
  experience?: string;
  location?: string;
  gender?: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin@salon.com',
    password: 'admin123',
    nom: 'Administrateur',
    prenom: 'Admin',
    role: 'admin',
    telephone: '01 23 45 67 89'
  },
  {
    email: 'marie@salon.com',
    password: 'marie123',
    nom: 'Dubois',
    prenom: 'Marie',
    role: 'coiffeur',
    telephone: '01 23 45 67 90',
    specialties: ['Coupe', 'Coloration', 'Brushing'],
    experience: '8 ans d\'expérience',
    location: 'Salon principal',
    gender: 'femme'
  },
  {
    email: 'pierre@salon.com',
    password: 'pierre123',
    nom: 'Martin',
    prenom: 'Pierre',
    role: 'coiffeur',
    telephone: '01 23 45 67 91',
    specialties: ['Coupe homme', 'Barbe', 'Styling'],
    experience: '5 ans d\'expérience',
    location: 'Salon principal',
    gender: 'homme'
  },
  {
    email: 'client@email.com',
    password: 'client123',
    nom: 'Dupont',
    prenom: 'Jean',
    role: 'client',
    telephone: '01 23 45 67 92'
  }
];

export const initializeTestData = async () => {
  const toast = useToast().toast;
  
  try {
    console.log('🚀 Début de l\'initialisation des données de test...');
    
    for (const testUser of TEST_USERS) {
      console.log(`Création de l'utilisateur: ${testUser.email}`);
      
      // 1. Créer le compte d'authentification
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nom: testUser.nom,
            prenom: testUser.prenom,
            role: testUser.role
          }
        }
      });

      if (authError) {
        console.error(`Erreur auth pour ${testUser.email}:`, authError);
        continue;
      }

      // 2. Créer le profil utilisateur
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            auth_id: authData.user.id,
            email: testUser.email,
            nom: testUser.nom,
            prenom: testUser.prenom,
            telephone: testUser.telephone,
            role: testUser.role,
            status: 'actif'
          });

        if (profileError) {
          console.error(`Erreur profil pour ${testUser.email}:`, profileError);
          continue;
        }

        // 3. Si c'est un coiffeur, créer son profil coiffeur
        if (testUser.role === 'coiffeur') {
          const { error: hairdresserError } = await supabase
            .from('hairdressers')
            .insert({
              auth_id: authData.user.id,
              name: `${testUser.prenom} ${testUser.nom}`,
              email: testUser.email,
              phone: testUser.telephone,
              specialties: testUser.specialties,
              experience: testUser.experience,
              location: testUser.location,
              gender: testUser.gender,
              is_active: true,
              rating: 4.5
            });

          if (hairdresserError) {
            console.error(`Erreur coiffeur pour ${testUser.email}:`, hairdresserError);
          }
        }
      }

      console.log(`✅ Utilisateur ${testUser.email} créé avec succès`);
    }

    toast({
      title: "✅ Initialisation réussie",
      description: "Tous les comptes de test ont été créés avec succès"
    });

    console.log('🎉 Initialisation terminée avec succès !');
    return { success: true };

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    toast({
      title: "❌ Erreur d'initialisation",
      description: "Une erreur est survenue lors de la création des comptes",
      variant: "destructive"
    });
    return { success: false, error };
  }
};

export const checkExistingTestData = async () => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('email')
      .in('email', TEST_USERS.map(u => u.email));

    if (error) throw error;

    return {
      existingUsers: users || [],
      hasExistingData: (users || []).length > 0
    };
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return { existingUsers: [], hasExistingData: false };
  }
};
