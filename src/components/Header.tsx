import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, Menu, X, Search } from 'lucide-react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useProfileRole } from '@/hooks/useProfileRole';
import { supabase } from '@/integrations/supabase/client';
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useRoleAuth();
  const {
    data: role
  } = useProfileRole(user?.id);

  // Handle loading state to prevent context errors
  if (loading) {
    return <header className="bg-gradient-to-r from-luxury-gold-500 via-luxury-gold-600 to-luxury-gold-700 shadow-luxury sticky top-0 z-50" style={{
      background: 'linear-gradient(135deg, hsl(45, 100%, 60%) 0%, hsl(45, 95%, 55%) 50%, hsl(45, 90%, 50%) 100%)'
    }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/adc857a4-9747-4ab0-a7d9-34c15807fe8e.png" 
                alt="Tchix Logo" 
                className="h-16 w-auto"
              />
            </div>
            <div className="animate-pulse w-32 h-8 bg-white/20 rounded"></div>
          </div>
        </div>
      </header>;
  }
  const handleProfessionalLogin = () => {
    navigate('/auth');
  };
  const handleLogin = () => {
    navigate('/auth');
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Logique de recherche ici
      console.log('Recherche:', searchQuery);
    }
  };
  return <header className="bg-gradient-to-r from-luxury-gold-500 via-luxury-gold-600 to-luxury-gold-700 shadow-luxury sticky top-0 z-50" style={{
    background: 'linear-gradient(135deg, hsl(45, 100%, 60%) 0%, hsl(45, 95%, 55%) 50%, hsl(45, 90%, 50%) 100%)'
  }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/adc857a4-9747-4ab0-a7d9-34c15807fe8e.png" 
              alt="Tchix Logo" 
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-white/90 hover:text-white transition-colors font-medium">
              Accueil
            </Link>
            <Link to="/professionals" className="text-white/90 hover:text-white transition-colors font-medium">
              Nos Professionnels
            </Link>
            <Link to="/services" className="text-white/90 hover:text-white transition-colors font-medium">
              Services
            </Link>
            <Link to="/tarifs" className="text-white/90 hover:text-white transition-colors font-medium">
              Tarifs
            </Link>
            <Link to="/contact" className="text-white/90 hover:text-white transition-colors font-medium">
              Nous contacter
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
              
              
            </form>
          </div>

          {/* Login Button */}
          <Button onClick={handleLogin} className="hidden md:flex bg-white text-gray-700 hover:bg-gray-50 border-0 rounded-full px-6">
            Se connecter
          </Button>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-white/20" style={{
        background: 'linear-gradient(135deg, hsl(45, 95%, 55%) 0%, hsl(45, 90%, 50%) 100%)'
      }}>
            <nav className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="px-2 mb-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input type="text" placeholder="Rechercher un professionnel..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-white/95 border-0 rounded-full h-12 text-gray-800 placeholder:text-gray-500" />
                </form>
              </div>
              
              <Link to="/" className="text-white/90 hover:text-white transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Accueil
              </Link>
              <Link to="/professionals" className="text-white/90 hover:text-white transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Nos Professionnels
              </Link>
              <Link to="/services" className="text-white/90 hover:text-white transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Services
              </Link>
              <Link to="/tarifs" className="text-white/90 hover:text-white transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Tarifs
              </Link>
              <Link to="/contact" className="text-white/90 hover:text-white transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Nous contacter
              </Link>
              {role === 'admin' && (
                <Link to="/admin" className="text-yellow-300 hover:text-yellow-100 transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                  Dashboard Admin
                </Link>
              )}
              
              <div className="px-2 pt-4">
                <Button onClick={() => {
              handleLogin();
              setIsMenuOpen(false);
            }} className="w-full bg-white text-gray-700 hover:bg-gray-50 border-0 rounded-full">
                  Se connecter
                </Button>
              </div>
            </nav>
          </div>}
      </div>
    </header>;
};
export default Header;