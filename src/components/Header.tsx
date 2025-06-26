
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Scissors, Menu, X, User, LogIn } from 'lucide-react';
import { cn } from "@/lib/utils";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gold-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-gold">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">SalonBook</h1>
              <p className="text-xs text-gray-500">Réservation en ligne</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#accueil" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Accueil
            </a>
            <a href="#coiffeurs" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Nos Coiffeurs
            </a>
            <a href="#services" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Services
            </a>
            <a href="#contact" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Contact
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-gold-300 text-gold-600 hover:bg-gold-50">
              <User className="h-4 w-4 mr-2" />
              Espace Pro
            </Button>
            <Button className="bg-gradient-gold hover:opacity-90 text-white shadow-lg">
              <LogIn className="h-4 w-4 mr-2" />
              Connexion
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="py-4 space-y-4">
            <a href="#accueil" className="block text-gray-700 hover:text-orange-500 transition-colors">
              Accueil
            </a>
            <a href="#coiffeurs" className="block text-gray-700 hover:text-orange-500 transition-colors">
              Nos Coiffeurs
            </a>
            <a href="#services" className="block text-gray-700 hover:text-orange-500 transition-colors">
              Services
            </a>
            <a href="#contact" className="block text-gray-700 hover:text-orange-500 transition-colors">
              Contact
            </a>
            <div className="flex flex-col space-y-2 pt-4">
              <Button variant="outline" className="border-gold-300 text-gold-600">
                Espace Pro
              </Button>
              <Button className="bg-gradient-gold text-white">
                Connexion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
