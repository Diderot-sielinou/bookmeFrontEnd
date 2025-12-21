/**
 * Composant Footer
 * 
 * Pied de page pour les pages publiques.
 * Contient les liens légaux, réseaux sociaux, etc.
 */

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
import { Separator } from '@/components/ui';

// ==========================================
// COMPOSANT
// ==========================================

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-charcoal text-white">
      <div className="container px-4 py-12">
        {/* Grille principale */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Colonne 1 - À propos */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-white font-bold">
                B
              </div>
              <span className="font-bold text-xl">
                Book<span className="text-cyan-400">Me</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              La plateforme de réservation de rendez-vous qui connecte les clients
              aux meilleurs prestataires de services.
            </p>
          </div>

          {/* Colonne 2 - Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to={ROUTES.HOME} className="hover:text-cyan-400 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SEARCH} className="hover:text-cyan-400 transition-colors">
                  Trouver un prestataire
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="hover:text-cyan-400 transition-colors">
                  Devenir prestataire
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 - Légal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Informations légales</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/mentions-legales" className="hover:text-cyan-400 transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/cgu" className="hover:text-cyan-400 transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="hover:text-cyan-400 transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-cyan-400 transition-colors">
                  Gestion des cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 - Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="mailto:contact@bookme.fr"
                  className="hover:text-cyan-400 transition-colors"
                >
                  contact@bookme.fr
                </a>
              </li>
              <li>
                <Link to="/aide" className="hover:text-cyan-400 transition-colors">
                  Centre d'aide
                </Link>
              </li>
            </ul>

            {/* Réseaux sociaux */}
            <div className="flex space-x-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-400">
            © {currentYear} BookMe. Tous droits réservés.
          </p>
          <p className="text-sm text-gray-400">
            Fait avec ❤️ en France
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
