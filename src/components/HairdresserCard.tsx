
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Calendar } from 'lucide-react';

interface HairdresserProps {
  id: number;
  name: string;
  specialties: string[];
  rating: number;
  image: string;
  availability: string;
  experience: string;
}

const HairdresserCard = ({ hairdresser }: { hairdresser: HairdresserProps }) => {
  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-gold-100 to-orange-100 flex items-center justify-center">
        {/* Profile Avatar */}
        <div className="w-24 h-24 bg-gradient-gold rounded-full flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-white">
            {hairdresser.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        
        {/* Availability Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-500 text-white hover:bg-green-600">
            Disponible
          </Badge>
        </div>
        
        {/* Rating */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="h-4 w-4 text-gold-500 fill-current" />
          <span className="text-sm font-medium">{hairdresser.rating}</span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{hairdresser.name}</h3>
            <p className="text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {hairdresser.experience}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {hairdresser.specialties.map((specialty) => (
              <Badge 
                key={specialty} 
                variant="secondary" 
                className="bg-gold-100 text-gold-800 hover:bg-gold-200"
              >
                {specialty}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-green-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{hairdresser.availability}</span>
            </div>
            
            <Button 
              className="bg-gradient-gold hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all duration-300"
              size="sm"
            >
              Réserver
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HairdresserCard;
