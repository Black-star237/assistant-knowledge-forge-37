
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Github, Lock, MessageCircle, User, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Section de gauche */}
      <div className="lg:w-1/2 bg-gradient-to-br from-emerald-800 to-teal-600 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="flex items-center mb-8 space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="text-emerald-600 w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">WhatsApp Agent</h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isLogin ? "Bon retour parmi nous" : "Créez votre compte"}
          </h2>
          
          <p className="text-white/80 mb-8 text-lg">
            Accédez à votre agent WhatsApp professionnel et boostez votre communication client.
          </p>
          
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
            <CardContent className="p-6">
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
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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
                    className="w-full bg-white hover:bg-gray-100 text-emerald-700 font-medium"
                  >
                    {isLoading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-white/80">
            {isLogin ? "Pas encore de compte ? " : "Vous avez déjà un compte ? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-white font-medium hover:underline"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>

      {/* Section de droite */}
      <div className="hidden lg:flex lg:w-1/2 bg-white p-12 items-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Votre Agent WhatsApp Professionnel</h2>
          
          <p className="text-gray-600 mb-8 text-lg">
            Automatisez vos réponses, gérez vos conversations et améliorez votre relation client 
            grâce à notre solution d'agent WhatsApp intelligent.
          </p>
          
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-emerald-50 p-6 rounded-lg border-l-4 border-emerald-500">
              <h3 className="font-medium text-gray-800 flex items-center gap-2 mb-2">
                <span className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                </span>
                Automatisation intelligente
              </h3>
              <p className="text-gray-600">
                Réponses personnalisées basées sur l'IA pour offrir une expérience client exceptionnelle
              </p>
            </div>
            
            <div className="bg-teal-50 p-6 rounded-lg border-l-4 border-teal-500">
              <h3 className="font-medium text-gray-800 flex items-center gap-2 mb-2">
                <span className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-teal-600" />
                </span>
                Suivi client avancé
              </h3>
              <p className="text-gray-600">
                Historique complet des conversations et analyses détaillées pour améliorer vos échanges
              </p>
            </div>
            
            <div className="bg-cyan-50 p-6 rounded-lg border-l-4 border-cyan-500">
              <h3 className="font-medium text-gray-800 flex items-center gap-2 mb-2">
                <span className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-cyan-600" />
                </span>
                Intégration fluide
              </h3>
              <p className="text-gray-600">
                Connexion facile avec vos outils existants pour une gestion centralisée de votre communication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
