
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Menu, X, Search } from 'lucide-react';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import { useProfileRole } from '@/hooks/useProfileRole';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { profile } = useGoogleAuth();
  const { data: role } = useProfileRole(profile?.id);

  const handleProfessionalLogin = () => {
    navigate('/auth');
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/post-auth`
      }
    });

    if (error) {
      console.error('Erreur Google OAuth:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Logique de recherche ici
      console.log('Recherche:', searchQuery);
    }
  };

  return (
    <header className="bg-gradient-to-r from-luxury-gold-500 via-luxury-gold-600 to-luxury-gold-700 shadow-luxury sticky top-0 z-50"
      style={{
        background: 'linear-gradient(135deg, hsl(45, 100%, 60%) 0%, hsl(45, 95%, 55%) 50%, hsl(45, 90%, 50%) 100%)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Aura</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-white/90 hover:text-white transition-colors font-medium">
              Accueil
            </Link>
            <Link to="/professionals" className="text-white/90 hover:text-white transition-colors font-medium">
              Nos coiffeurs
            </Link>
            <Link to="/services" className="text-white/90 hover:text-white transition-colors font-medium">
              Services
            </Link>
            <Link to="/tarifs" className="text-white/90 hover:text-white transition-colors font-medium">
              Tarifs
            </Link>
            {role === 'admin' && (
              <Link to="/admin" className="text-yellow-300 hover:text-yellow-100 transition-colors font-medium">
                Dashboard Admin
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un coiffeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/95 border-0 rounded-full h-12 text-gray-800 placeholder:text-gray-500 focus:bg-white"
              />
            </form>
          </div>

          {/* Google Login Button */}
          <Button 
            onClick={handleGoogleLogin}
            className="hidden md:flex bg-white text-gray-700 hover:bg-gray-50 border-0 rounded-full px-6"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Se connecter avec Google
          </Button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20"
            style={{
              background: 'linear-gradient(135deg, hsl(45, 95%, 55%) 0%, hsl(45, 90%, 50%) 100%)'
            }}
          >
            <nav className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="px-2 mb-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher un coiffeur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/95 border-0 rounded-full h-12 text-gray-800 placeholder:text-gray-500"
                  />
                </form>
              </div>
              
              <Link 
                to="/" 
                className="text-white/90 hover:text-white transition-colors font-medium px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/professionals" 
                className="text-white/90 hover:text-white transition-colors font-medium px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Nos coiffeurs
              </Link>
              <Link 
                to="/services" 
                className="text-white/90 hover:text-white transition-colors font-medium px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/tarifs" 
                className="text-white/90 hover:text-white transition-colors font-medium px-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Tarifs
              </Link>
              
              {role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="text-yellow-300 hover:text-yellow-100 transition-colors font-medium px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard Admin
                </Link>
              )}
              
              <div className="px-2 pt-4">
                <Button 
                  onClick={() => {
                    handleGoogleLogin();
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-white text-gray-700 hover:bg-gray-50 border-0 rounded-full"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Se connecter avec Google
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
