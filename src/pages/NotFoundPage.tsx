/**
 * NotFoundPage (404)
 * 
 * Page affichée lorsque l'URL demandée n'existe pas.
 */

import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary/20 select-none">404</div>
          <div className="relative -mt-16">
            <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Search className="h-16 w-16 text-primary/40" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
        <p className="text-muted-foreground mb-8">
          Oups ! La page que vous recherchez semble avoir disparu ou n'existe pas.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button asChild>
            <Link to={ROUTES.HOME}>
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Link>
          </Button>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Vous cherchez peut-être :
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to={ROUTES.SEARCH} className="text-primary hover:underline">
              Rechercher un prestataire
            </Link>
            <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
              Se connecter
            </Link>
            <Link to={ROUTES.REGISTER} className="text-primary hover:underline">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
