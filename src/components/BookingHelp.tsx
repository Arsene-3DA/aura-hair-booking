import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Clock, 
  User, 
  MessageSquare,
  CheckCircle,
  Info
} from "lucide-react";

const BookingHelp = () => {
  const steps = [
    {
      icon: <User className="h-5 w-5" />,
      title: "1. Vos informations",
      description: "Remplissez vos coordonnées (nom, téléphone, email)",
      status: "required"
    },
    {
      icon: <CalendarDays className="h-5 w-5" />,
      title: "2. Choisir un service",
      description: "Sélectionnez le service souhaité parmi ceux proposés",
      status: "required"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "3. Date et heure",
      description: "Choisissez une date sur le calendrier puis un créneau horaire",
      status: "required"
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "4. Notes (optionnel)",
      description: "Ajoutez des demandes particulières ou des informations utiles",
      status: "optional"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "5. Confirmation",
      description: "Validez votre demande de réservation",
      status: "final"
    }
  ];

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-lg text-blue-800">
          <Info className="h-5 w-5 mr-2" />
          Guide de réservation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-blue-900">{step.title}</h4>
                  <Badge 
                    variant={step.status === 'required' ? 'destructive' : step.status === 'optional' ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {step.status === 'required' ? 'Obligatoire' : step.status === 'optional' ? 'Optionnel' : 'Final'}
                  </Badge>
                </div>
                <p className="text-sm text-blue-700">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Conseil :</strong> Votre demande sera envoyée directement au coiffeur qui vous confirmera rapidement par email ou téléphone.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingHelp;