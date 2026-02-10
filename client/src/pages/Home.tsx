import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/glossary");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">📚 Mon Glossaire</h1>
          <p className="text-lg text-muted-foreground">Organisez vos connaissances par thème</p>
        </div>
        
        <div className="space-y-3 text-sm text-foreground">
          <p>✨ Navigation alphabétique intuitive</p>
          <p>🔍 Recherche rapide par mot-clé</p>
          <p>📝 Support Markdown pour les définitions</p>
          <p>🖼️ Ajoutez des images à vos termes</p>
          <p>📚 Gérez plusieurs glossaires</p>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={() => window.location.href = getLoginUrl()}
        >
          Se connecter pour commencer
        </Button>
      </div>
    </div>
  );
}
