import { Card, CardContent } from "@/components/ui/card";
import { Info } from 'lucide-react';

const GuestBookingInfo = () => {
  return (
    <Card className="border-[#FFD700]/30 bg-[#FFD700]/10">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3">
          <Info className="h-5 w-5 text-[#FFD700] flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-[#FFD700] mb-2">Réservation rapide</h3>
            <p className="text-gray-300 text-sm">
              Aucun compte requis ! Remplissez simplement vos informations ci-dessous et nous vous contacterons pour confirmer votre rendez-vous.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestBookingInfo;