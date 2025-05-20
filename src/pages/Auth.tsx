
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Github, Lock, MessageCircle, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Interface pour les images d'arrière-plan
interface Background {
  id: number;
  image_url: string;
  created_at: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  
  // État pour les images d'arrière-plan et l'image active
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Récupérer les images d'arrière-plan depuis Supabase
  useEffect(() => {
    const fetchBackgrounds = async () => {
      const { data, error } = await supabase
        .from('auth_backgrounds')
        .select('*');
      
      if (error) {
        console.error("Erreur lors de la récupération des images d'arrière-plan:", error);
        return;
      }
      
      if (data && data.length > 0) {
        setBackgrounds(data);
      }
    };
    
    fetchBackgrounds();
  }, []);

  // Effet pour changer l'image de fond toutes les 5 secondes
  useEffect(() => {
    if (backgrounds.length <= 1) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Attendre que la transition commence avant de changer l'image
      setTimeout(() => {
        setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgrounds.length);
        
        // Retirer la classe de transition après un court délai
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }, 500);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !acceptTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast.success("Connexion réussie");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (error) throw error;
        
        toast.success("Inscription réussie! Vérifiez votre email");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Erreur lors de la connexion avec ${provider}`);
    }
  };

  // Style dynamique pour l'arrière-plan
  const backgroundStyle = {
    backgroundImage: backgrounds.length > 0 ? `url(${backgrounds[currentBgIndex]?.image_url})` : undefined,
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Arrière-plan avec effet de transition */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={backgroundStyle}
      >
        {/* Overlay pour l'effet flou/sombre */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/50" />
      </div>

      {/* Carte d'authentification centrée */}
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl relative z-10 mx-4">
        <CardContent className="p-8">
          <div className="flex items-center mb-8 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <MessageCircle className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white ml-3">WhatsApp Agent</h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
            {isLogin ? "Bon retour parmi nous" : "Créez votre compte"}
          </h2>
          
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <Button 
                variant="outline" 
                className="bg-white text-gray-800 hover:bg-gray-100 border-none" 
                onClick={() => handleOAuthSignIn('google')}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isLogin ? "Se connecter" : "S'inscrire"} avec Google
              </Button>

              <Button 
                variant="outline" 
                className="bg-white text-gray-800 hover:bg-gray-100 border-none" 
                onClick={() => handleOAuthSignIn('github')}
              >
                <Github className="mr-2 h-4 w-4" />
                {isLogin ? "Se connecter" : "S'inscrire"} avec GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20"></span>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-transparent px-4 text-sm text-white/70">ou</span>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                  <Input
                    type="email"
                    placeholder="Email"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="data-[state=checked]:bg-white data-[state=checked]:text-emerald-600 border-white"
                  />
                  <label htmlFor="terms" className="text-sm text-white/80">
                    J'accepte les{" "}
                    <a href="#" className="underline hover:text-white">Conditions d'utilisation</a>
                    {" "}et la{" "}
                    <a href="#" className="underline hover:text-white">Politique de confidentialité</a>
                  </label>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium transition-all duration-200"
              >
                {isLoading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          </div>

          <p className="text-center mt-6 text-white/80">
            {isLogin ? "Pas encore de compte ? " : "Vous avez déjà un compte ? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-white font-medium hover:underline"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
            
          <div className="mt-8 text-center">
            <p className="text-sm text-white/60">
              WhatsApp Agent - Automatisez vos réponses et améliorez votre communication client
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Indicateur de position des images (pagination en bas) */}
      {backgrounds.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {backgrounds.map((_, index) => (
            <div 
              key={index} 
              className={`h-2 w-2 rounded-full transition-colors duration-300 ${index === currentBgIndex ? 'bg-white' : 'bg-white/30'}`} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Auth;
