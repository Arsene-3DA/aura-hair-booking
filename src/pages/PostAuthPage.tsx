import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PostAuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtenir la session actuelle
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erreur session:', sessionError);
          toast({
            title: "Erreur d'authentification",
            description: sessionError.message,
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        if (!session) {
          console.log('❌ Pas de session, redirection vers /auth');
          navigate('/auth');
          return;
        }

        console.log('✅ Session trouvée:', session.user.email);

        // Obtenir le profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('user_id', session.user.id)
          .single();

        if (profileError) {
          console.error('Erreur profil:', profileError);
          // Si le profil n'existe pas, le créer
          if (profileError.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                user_id: session.user.id,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                role: 'client'
              });

            if (insertError) {
              console.error('Erreur création profil:', insertError);
              toast({
                title: "Erreur",
                description: "Impossible de créer votre profil",
                variant: "destructive"
              });
              navigate('/auth');
              return;
            }
            
            // Profil créé avec rôle client par défaut
            navigate('/app', { replace: true });
            return;
          }
          
          toast({
            title: "Erreur",
            description: "Impossible de récupérer votre profil",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        // Vérifier s'il y a un paramètre next
        const nextUrl = searchParams.get('next');
        if (nextUrl) {
          console.log('🔀 Redirection vers nextUrl:', nextUrl);
          navigate(nextUrl, { replace: true });
          return;
        }

        // Rediriger selon le rôle
        console.log('🚀 Redirection selon le rôle:', profile.role);
        switch (profile.role) {
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          case 'coiffeur':
            navigate('/stylist', { replace: true });
            break;
          case 'client':
          default:
            navigate('/app', { replace: true });
            break;
        }

      } catch (error) {
        console.error('Erreur inattendue:', error);
        toast({
          title: "Erreur",
          description: "Une erreur inattendue s'est produite",
          variant: "destructive"
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Connexion en cours...
        </h2>
        <p className="text-muted-foreground">
          Redirection vers votre espace personnel
        </p>
      </div>
    </div>
  );
};

export default PostAuthPage;