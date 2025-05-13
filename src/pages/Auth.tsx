
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Github, Lock } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

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

  return (
    <div className="flex min-h-screen">
      {/* Partie gauche - Formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 bg-gradient-to-br from-purple-950 to-pink-900">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
          <span className="text-white text-xl font-semibold">WhatsApp Agent</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-8">
          {isLogin ? "Connectez-vous" : "Créer votre compte"}
        </h1>
        
        <div className="max-w-md">
          {!isLogin && (
            <>
              <Button variant="outline" className="w-full mb-3 bg-transparent border border-gray-600 text-white hover:bg-white/10" onClick={() => handleOAuthSignIn('google')}>
                <Mail className="mr-2 h-4 w-4" />
                S'inscrire avec Google
              </Button>
              
              <Button variant="outline" className="w-full mb-6 bg-transparent border border-gray-600 text-white hover:bg-white/10" onClick={() => handleOAuthSignIn('github')}>
                <Github className="mr-2 h-4 w-4" />
                S'inscrire avec GitHub
              </Button>
              
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-transparent px-4 text-sm text-gray-400">OU</span>
                </div>
              </div>
            </>
          )}
          
          <form onSubmit={handleAuth}>
            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-gray-600 text-white"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-gray-600 text-white"
                  required
                />
              </div>
              
              {!isLogin && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="data-[state=checked]:bg-pink-500 border-gray-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
                    J'accepte les <a href="#" className="text-pink-500 hover:underline">Conditions d'utilisation</a> et la <a href="#" className="text-pink-500 hover:underline">Politique de confidentialité</a>
                  </label>
                </div>
              )}
              
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
              >
                {isLoading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              {isLogin ? "Vous n'avez pas de compte? " : "Vous avez déjà un compte? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-pink-500 hover:underline"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Partie droite - Informations */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-900 to-indigo-950 p-12 items-center justify-center">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-white mb-4">Agent WhatsApp Intelligent</h2>
          <p className="text-gray-300 mb-8">
            Configurez et gérez votre agent WhatsApp intelligent pour automatiser 
            vos interactions et améliorer votre relation client.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-pink-500">→</div>
              <p className="text-white">Personnalisez les réponses automatiques</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-pink-500">→</div>
              <p className="text-white">Gérez les coupons et promotions</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-pink-500">→</div>
              <p className="text-white">Suivez les interactions client</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
