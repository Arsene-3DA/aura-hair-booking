
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Scissors, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfessionalLogin = () => {
    navigate('/auth');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-gold rounded-full flex items-center justify-center">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Salon Expert</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gold-600 transition-colors">
              Accueil
            </Link>
            <Link to="/services" className="text-gray-700 hover:text-gold-600 transition-colors">
              Services
            </Link>
            <Link to="/professionals/male" className="text-gray-700 hover:text-gold-600 transition-colors">
              Coiffeurs
            </Link>
            <Link to="/professionals/female" className="text-gray-700 hover:text-gold-600 transition-colors">
              Coiffeuses
            </Link>
            
            {/* Liens de développement */}
            <Link to="/admin" className="text-blue-600 hover:text-blue-800 transition-colors text-sm">
              Admin
            </Link>
            <Link to="/coiffeur" className="text-green-600 hover:text-green-800 transition-colors text-sm">
              Coiffeur
            </Link>
            
            <Button 
              onClick={handleProfessionalLogin}
              variant="outline"
              className="border-gold-300 text-gold-700 hover:bg-gold-50"
            >
              Espace Pro
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-gold-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/services" 
                className="text-gray-700 hover:text-gold-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/professionals/male" 
                className="text-gray-700 hover:text-gold-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Coiffeurs
              </Link>
              <Link 
                to="/professionals/female" 
                className="text-gray-700 hover:text-gold-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Coiffeuses
              </Link>
              
              {/* Liens de développement mobile */}
              <Link 
                to="/admin" 
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin (Dev)
              </Link>
              <Link 
                to="/coiffeur" 
                className="text-green-600 hover:text-green-800 transition-colors text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Coiffeur (Dev)
              </Link>
              
              <Button 
                onClick={() => {
                  handleProfessionalLogin();
                  setIsMenuOpen(false);
                }}
                variant="outline"
                className="border-gold-300 text-gold-700 hover:bg-gold-50 w-fit"
              >
                Espace Pro
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
