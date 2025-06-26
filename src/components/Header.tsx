
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gold-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-gold rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">SalonBook</h1>
              <p className="text-xs text-gray-600">Réservation Premium</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#accueil" className="text-gray-700 hover:text-gold-600 transition-colors font-medium">
              Accueil
            </a>
            <a href="#coiffeurs" className="text-gray-700 hover:text-gold-600 transition-colors font-medium">
              Nos Coiffeurs
            </a>
            <a href="#services" className="text-gray-700 hover:text-gold-600 transition-colors font-medium">
              Services
            </a>
            <a href="#contact" className="text-gray-700 hover:text-gold-600 transition-colors font-medium">
              Contact
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/login')}
              className="border-gold-200 text-gold-700 hover:bg-gold-50"
            >
              <User className="h-4 w-4 mr-2" />
              Connexion Pro
            </Button>
            <Button 
              className="bg-gradient-gold text-white hover:opacity-90 shadow-md"
              size="sm"
            >
              Réserver
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
