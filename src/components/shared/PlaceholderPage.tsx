/**
 * PlaceholderPage Component
 * 
 * Page temporaire pour les fonctionnalités en cours de développement.
 */

import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  showBackButton?: boolean;
}

export function PlaceholderPage({ 
  title, 
  description = "Cette fonctionnalité est en cours de développement et sera bientôt disponible.",
  icon,
  showBackButton = true
}: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {icon || <Construction className="w-8 h-8 text-primary" />}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold">{title}</h1>

            {/* Description */}
            <p className="text-muted-foreground">{description}</p>

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              <span>En cours de développement</span>
            </div>

            {/* Back button */}
            {showBackButton && (
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlaceholderPage;
