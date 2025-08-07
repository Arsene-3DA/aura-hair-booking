
import { Badge } from "@/components/ui/badge";
import { Scissors, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-gold">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">Tchix</h3>
                <p className="text-sm text-gray-400">Réservation en ligne</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Votre salon de coiffure de référence pour des prestations de qualité 
              dans une ambiance chaleureuse et professionnelle.
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-orange-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                <Facebook className="h-5 w-5 text-white" />
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-gold-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                <Instagram className="h-5 w-5 text-white" />
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-orange-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                <Twitter className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          {/* Services rapides */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Services Populaires</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-gold-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-gold-400 rounded-full mr-3"></span>
                  Coupe Femme
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-gold-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  Couleur & Balayage
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-gold-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-gold-400 rounded-full mr-3"></span>
                  Coupe Homme
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-gold-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                  Soins Capillaires
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-gold-400 transition-colors flex items-center">
                  <span className="w-2 h-2 bg-gold-400 rounded-full mr-3"></span>
                  Coiffure Mariée
                </a>
              </li>
            </ul>
          </div>
          
          {/* Horaires */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gold-400" />
              Horaires d'ouverture
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Lundi - Samedi</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  9h - 21h
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Dimanche</span>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  Fermé
                </Badge>
              </div>
            </div>
            <div className="bg-gradient-to-r from-gold-500/10 to-orange-500/10 p-4 rounded-lg border border-gold-500/20">
              <p className="text-sm text-gold-200">
                🎉 Réservation en ligne 24h/24
              </p>
            </div>
          </div>
          
          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gold-400 mt-0.5" />
                <div>
                  <p className="text-gray-300">Canada</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gold-400" />
                <a href="tel:+18736555275" className="text-gray-300 hover:text-gold-400 transition-colors">
                  +1 (873) 655-5275
                </a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gold-400" />
                <a href="mailto:contact@salonottawa.ca" className="text-gray-300 hover:text-gold-400 transition-colors">
                  contact@salonottawa.ca
                </a>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gold-500/10 to-orange-500/10 p-4 rounded-lg border border-gold-500/20">
              <p className="text-sm text-gold-200 mb-2">💎 Salon Premium</p>
              <p className="text-xs text-gray-400">
                Produits haut de gamme • Service personnalisé
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Tchix. Tous droits réservés.
            </div>
            <div className="flex space-x-6">
              <a href="/contact" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                Nous contacter
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                Mentions légales
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">
                CGU
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
