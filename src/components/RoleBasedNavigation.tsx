import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Users, Scissors, Sparkles } from 'lucide-react';

const RoleBasedNavigation = () => {
  const navigate = useNavigate();

  const navigationCards = [
    {
      role: 'coiffeur',
      title: 'Coiffeurs Experts',
      description: 'Spécialistes en coupe homme, barbe et styling masculin',
      path: '/coiffeurs',
      icon: <Scissors className="h-8 w-8" />,
      color: 'bg-blue-500',
      count: 'Voir tous les coiffeurs'
    },
    {
      role: 'coiffeuse',
      title: 'Coiffeuses Expertes',
      description: 'Spécialistes en coupe femme, couleur et coiffage',
      path: '/coiffeuses',
      icon: <Scissors className="h-8 w-8" />,
      color: 'bg-pink-500',
      count: 'Voir toutes les coiffeuses'
    },
    {
      role: 'cosmetique',
      title: 'Experts Cosmétique',
      description: 'Spécialistes en soins du visage, maquillage et esthétique',
      path: '/cosmetique',
      icon: <Sparkles className="h-8 w-8" />,
      color: 'bg-purple-500',
      count: 'Voir les experts cosmétique'
    },
    {
      role: 'all',
      title: 'Tous les Professionnels',
      description: 'Découvrez tous nos experts certifiés',
      path: '/professionals',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-green-500',
      count: 'Voir tous les professionnels'
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">
          Nos <span className="text-[#FFD700]">Professionnels</span> par Spécialité
        </h2>
        <p className="text-gray-600 text-lg">
          Choisissez votre expert selon vos besoins
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {navigationCards.map((card) => (
          <Card key={card.role} className="hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate(card.path)}>
            <CardHeader className="text-center pb-4">
              <div className={`${card.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <CardTitle className="text-xl font-bold">{card.title}</CardTitle>
              <CardDescription className="text-sm">
                {card.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="secondary" className="mb-4">
                {card.count}
              </Badge>
              <Button 
                className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(card.path);
                }}
              >
                Découvrir
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-2">✨ Système basé sur les rôles</h3>
          <p className="text-gray-600 mb-4">
            Les professionnels sont maintenant correctement organisés selon leur rôle spécifique
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">Filtrage automatique par rôle</Badge>
            <Badge variant="outline">Mise à jour en temps réel</Badge>
            <Badge variant="outline">Navigation intuitive</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedNavigation;