import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export const useFAQ = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // FAQ statique pour l'instant - peut être migré vers la DB plus tard
  const staticFAQ: FAQItem[] = [
    {
      id: '1',
      question: 'Comment prendre un rendez-vous ?',
      answer: 'Rendez-vous dans la section "Réservations" puis cliquez sur "Nouveau rendez-vous". Choisissez votre styliste, la date et l\'heure qui vous conviennent.',
      category: 'Réservations',
      order: 1
    },
    {
      id: '2',
      question: 'Puis-je annuler ou modifier mon rendez-vous ?',
      answer: 'Oui, vous pouvez annuler ou modifier votre rendez-vous jusqu\'à 24h avant la date prévue. Rendez-vous dans "Mes réservations" et utilisez les boutons d\'action.',
      category: 'Réservations',
      order: 2
    },
    {
      id: '3',
      question: 'Comment laisser un avis sur mon styliste ?',
      answer: 'Après votre prestation, vous recevrez une notification pour évaluer votre expérience. Vous pouvez aussi aller dans "Mes avis" pour noter vos prestations passées.',
      category: 'Avis',
      order: 3
    },
    {
      id: '4',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Rendez-vous dans "Mon profil" pour modifier vos informations personnelles, préférences de notifications et changer votre mot de passe.',
      category: 'Profil',
      order: 4
    },
    {
      id: '5',
      question: 'Je ne reçois pas les notifications, que faire ?',
      answer: 'Vérifiez vos préférences de notifications dans "Mon profil". Assurez-vous que votre navigateur autorise les notifications pour ce site.',
      category: 'Notifications',
      order: 5
    },
    {
      id: '6',
      question: 'Comment contacter le support ?',
      answer: 'Vous pouvez nous contacter par email à support@salon.com ou utiliser le bouton "Contacter le support" en bas de cette page.',
      category: 'Support',
      order: 6
    },
    {
      id: '7',
      question: 'Quels sont les modes de paiement acceptés ?',
      answer: 'Nous acceptons les paiements en espèces, par carte bancaire et par chèque. Le paiement se fait directement au salon après votre prestation.',
      category: 'Paiement',
      order: 7
    },
    {
      id: '8',
      question: 'Que faire si j\'arrive en retard ?',
      answer: 'Prévenez votre styliste dès que possible. En cas de retard important (>15 min), votre rendez-vous pourrait être reporté selon les disponibilités.',
      category: 'Réservations',
      order: 8
    }
  ];

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      
      // Pour l'instant, utiliser les données statiques
      // Plus tard, on peut les récupérer depuis la DB
      setFaqItems(staticFAQ);
      
      // Version future avec DB :
      /*
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      setFaqItems(data || []);
      */
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger la FAQ",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchFAQ = (query: string) => {
    if (!query.trim()) return faqItems;
    
    const lowercaseQuery = query.toLowerCase();
    return faqItems.filter(item => 
      item.question.toLowerCase().includes(lowercaseQuery) ||
      item.answer.toLowerCase().includes(lowercaseQuery) ||
      item.category.toLowerCase().includes(lowercaseQuery)
    );
  };

  const getFAQByCategory = (category: string) => {
    return faqItems.filter(item => item.category === category);
  };

  const getCategories = () => {
    return [...new Set(faqItems.map(item => item.category))];
  };

  useEffect(() => {
    fetchFAQ();
  }, []);

  return {
    faqItems,
    loading,
    searchFAQ,
    getFAQByCategory,
    getCategories,
    refetch: fetchFAQ
  };
};