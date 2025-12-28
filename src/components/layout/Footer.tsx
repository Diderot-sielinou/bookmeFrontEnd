/**
 * Footer Component
 * * Footer for public pages.
 * Contains legal links, social media, etc.
 */

import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

import { ROUTES } from '@/lib/constants';
// Correction de l'import : assurez-vous que Separator est exporté ainsi ou utilisez le chemin direct
import { Separator } from '@/components/ui/separator'; 

// ==========================================
// COMPONENT
// ==========================================

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-slate-900 text-white"> {/* "bg-charcoal" remplacé par "bg-slate-900" (standard Tailwind) ou gardez votre classe custom */}
      <div className="container mx-auto px-4 py-12">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1 - About */}
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
              The appointment booking platform that connects clients
              with the best service providers.
            </p>
          </div>

          {/* Column 2 - Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-100">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to={ROUTES.HOME} className="hover:text-cyan-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SEARCH} className="hover:text-cyan-400 transition-colors">
                  Find a Provider
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="hover:text-cyan-400 transition-colors">
                  Become a Provider
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-100">Legal Information</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/legal" className="hover:text-cyan-400 transition-colors">
                  Legal Notice
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-cyan-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-100">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                {/* CORRECTION ICI : Ajout de la balise <a> manquante */}
                <a 
                  href="mailto:contact@bookme.com"
                  className="hover:text-cyan-400 transition-colors"
                >
                  contact@bookme.com
                </a>
              </li>
              <li>
                <Link to="/help" className="hover:text-cyan-400 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>

            {/* Social media */}
            <div className="flex space-x-4 pt-2">
              {/* CORRECTIONS ICI : Balises <a> complétées */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-400">
            © {currentYear} BookMe. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Made with ❤️ by the team
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;