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
    return <header className="bg-black border-b border-[#FFD700]/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#FFD700]">
                <Scissors className="h-8 w-8 text-black" />
              </div>
              <span className="text-2xl font-bold text-[#FFD700]">Tchiix</span>
            </div>
            <div className="animate-pulse w-32 h-8 bg-[#FFD700]/20 rounded"></div>
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
  return <header className="bg-black border-b border-[#FFD700]/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#FFD700]">
              <Scissors className="h-8 w-8 text-black" />
            </div>
            <span className="text-2xl font-bold text-[#FFD700]">Tchiix</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 ml-12">
            <Link to="/" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium">
              Accueil
            </Link>
            <Link to="/professionals" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium">
              Nos Professionnels
            </Link>
            <Link to="/services" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium">
              Services
            </Link>
            <Link to="/tarifs" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium">
              Tarifs
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium">
              Nous contacter
            </Link>
            {role === 'admin' && (
              <Link to="/admin" className="text-[#FFD700] hover:text-[#FFD700]/80 transition-colors font-medium">
                Dashboard Admin
              </Link>
            )}
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="pl-10 bg-[#1a1a1a] border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/50" 
              />
            </form>
          </div>

          {/* Login Button */}
          <Button onClick={handleLogin} className="hidden lg:flex bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300 border-0 rounded-full px-6">
            Se connecter
          </Button>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 text-[#FFD700]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && <div className="lg:hidden py-4 border-t border-[#FFD700]/20 bg-[#1a1a1a]">
            <nav className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="px-2 mb-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Rechercher un professionnel..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    className="pl-10 bg-black border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]/50 h-12" 
                  />
                </form>
              </div>
              
              <Link to="/" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Accueil
              </Link>
              <Link to="/professionals" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Nos Professionnels
              </Link>
              <Link to="/services" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Services
              </Link>
              <Link to="/tarifs" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Tarifs
              </Link>
              <Link to="/contact" className="text-gray-300 hover:text-[#FFD700] transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                Nous contacter
              </Link>
              {role === 'admin' && (
                <Link to="/admin" className="text-[#FFD700] hover:text-[#FFD700]/80 transition-colors font-medium px-2" onClick={() => setIsMenuOpen(false)}>
                  Dashboard Admin
                </Link>
              )}
              
              <div className="px-2 pt-4">
                <Button onClick={() => {
              handleLogin();
              setIsMenuOpen(false);
            }} className="w-full bg-[#FFD700] text-black hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all duration-300 border-0 rounded-full">
                  Se connecter
                </Button>
              </div>
            </nav>
          </div>}
      </div>
    </header>;
};
export default Header;