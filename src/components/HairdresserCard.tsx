
import { Button } from "@/components/ui/button";
import { Star, User } from 'lucide-react';

interface HairdresserCardProps {
  name: string;
  photo: string;
  tags: string[];
  rating: number;
  onChoose: () => void;
}

const HairdresserCard = ({ name, photo, tags, rating, onChoose }: HairdresserCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:scale-104 transition-transform duration-200 cursor-pointer">
      {/* Photo ronde 96px */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <img 
            src={photo}
            alt={name}
            className="w-24 h-24 rounded-full object-cover border-4 border-luxury-gold-200"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
        </div>
      </div>

      {/* Nom */}
      <h3 className="text-xl font-bold text-luxury-charcoal text-center mb-3">{name}</h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {tags.map((tag, index) => (
          <span key={index} className="px-3 py-1 bg-luxury-gold-100 text-luxury-gold-700 rounded-full text-sm font-medium">
            {tag}
          </span>
        ))}
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex space-x-1 mr-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <span className="text-sm text-luxury-charcoal/70 font-medium">{rating}.0</span>
      </div>

      {/* Bouton Choisir */}
      <Button 
        onClick={onChoose}
        className="w-full bg-luxury-gold-500 hover:bg-luxury-gold-600 text-luxury-black px-6 py-3 rounded-xl font-bold transition-colors duration-200"
      >
        <User className="h-5 w-5 mr-2" />
        Choisir
      </Button>
    </div>
  );
};

export default HairdresserCard;
