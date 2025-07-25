import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFAQ } from '@/hooks/useFAQ';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  HelpCircle, 
  Search, 
  Mail, 
  Phone,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

export default function SupportPage() {
  const { user } = useAuth();
  const { faqItems, loading, searchFAQ, getCategories } = useFAQ();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = getCategories();
  const filteredFAQ = searchQuery 
    ? searchFAQ(searchQuery)
    : selectedCategory 
    ? faqItems.filter(item => item.category === selectedCategory)
    : faqItems;

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Demande de support - Salon de coiffure');
    const body = encodeURIComponent(`
Bonjour,

J'ai une question concernant :

[Décrivez votre problème ici]

Mes informations :
- Email : ${user?.email || ''}
- Nom : ${user?.user_type || ''}

Cordialement,
`);
    
    window.location.href = `mailto:support@salon.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Centre d'aide</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Trouvez rapidement des réponses à vos questions ou contactez notre équipe de support
        </p>
      </div>

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleContactSupport}>
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-1">Email</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Réponse sous 24h
            </p>
            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Envoyer un email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-1">Téléphone</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Lun-Ven 9h-18h
            </p>
            <Button variant="outline" className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              01 23 45 67 89
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
            <h3 className="font-medium mb-1">Chat en direct</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Réponse immédiate
            </p>
            <Button variant="outline" className="w-full" disabled>
              <MessageCircle className="h-4 w-4 mr-2" />
              Bientôt disponible
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans la FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                Toutes
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredFAQ.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQ.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      {item.question}
                      <Badge variant="outline" className="ml-auto">
                        {item.category}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Aucun résultat</h3>
              <p className="text-muted-foreground mb-4">
                Aucune question ne correspond à votre recherche
              </p>
              <Button onClick={handleContactSupport}>
                <Mail className="h-4 w-4 mr-2" />
                Contacter le support
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-muted-foreground mb-4">
            Notre équipe de support est là pour vous aider
          </p>
          <Button onClick={handleContactSupport}>
            <Mail className="h-4 w-4 mr-2" />
            Contacter le support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}