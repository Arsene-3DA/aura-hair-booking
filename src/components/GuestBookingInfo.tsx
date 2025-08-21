import { Card, CardContent } from "@/components/ui/card";
import { Info, User, Calendar, Clock } from 'lucide-react';

const GuestBookingInfo = () => {
  return (
    <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50/50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-900">
              Réservation en tant qu'invité
            </h3>
            <p className="text-blue-800 text-sm leading-relaxed">
              Vous pouvez effectuer une réservation sans créer de compte. 
              Vous recevrez une confirmation par email avec tous les détails de votre rendez-vous.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <User className="h-4 w-4" />
                <span>Aucun compte requis</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Calendar className="h-4 w-4" />
                <span>Confirmation immédiate</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Clock className="h-4 w-4" />
                <span>Notification par email</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestBookingInfo;