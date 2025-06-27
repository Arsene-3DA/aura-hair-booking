
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-gold rounded-2xl flex items-center justify-center shadow-gold group-hover:shadow-luxury transition-all duration-300 transform group-hover:scale-105">
                <span className="text-2xl font-black text-luxury-black">S</span>
              </div>
              <div className="absolute inset-0 bg-gradient-gold rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-gradient-gold tracking-tight">SalonBook</h1>
              <p className="text-xs text-luxury-charcoal/60 font-medium tracking-wide">PREMIUM BOOKING</p>
            </div>
          </div>
          
          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-12">
            <a href="#accueil" className="nav-link text-lg">
              Accueil
            </a>
            <a href="#coiffeurs" className="nav-link text-lg">
              Nos Experts
            </a>
            <a href="#services" className="nav-link text-lg">
              Services
            </a>
            <a href="#contact" className="nav-link text-lg">
              Contact
            </a>
          </nav>
          
          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="border-2 border-luxury-gold-200 text-luxury-charcoal hover:bg-luxury-gold-50 hover:border-luxury-gold-300 transition-all duration-300 px-6 py-3 rounded-xl font-semibold"
            >
              <User className="h-5 w-5 mr-2" />
              Connexion Pro
            </Button>
            <Button 
              className="luxury-button"
            >
              Réserver Maintenant
            </Button>
          </div>

          {/* Menu Mobile */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile Ouvert */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-luxury animate-fade-in">
            <nav className="px-4 py-8 space-y-6">
              <a href="#accueil" className="block nav-link text-xl py-2">Accueil</a>
              <a href="#coiffeurs" className="block nav-link text-xl py-2">Nos Experts</a>
              <a href="#services" className="block nav-link text-xl py-2">Services</a>
              <a href="#contact" className="block nav-link text-xl py-2">Contact</a>
              <div className="pt-6 space-y-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="w-full border-2 border-luxury-gold-200 text-luxury-charcoal hover:bg-luxury-gold-50 py-4 rounded-xl font-semibold"
                >
                  <User className="h-5 w-5 mr-2" />
                  Connexion Pro
                </Button>
                <Button className="w-full luxury-button">
                  Réserver Maintenant
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
