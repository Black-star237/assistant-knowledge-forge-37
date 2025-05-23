import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Check, X, RefreshCw, Link as LinkIcon, Unlink, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { waApiService } from "@/services/waapi";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Interface for Lygos Payment Response
interface LygosPaymentResponse {
  status?: string;
  message?: string;
  id?: string;
  amount?: number;
  currency?: string;
  shop_name?: string;
  user_id?: string;
  creation_date?: string;
  link?: string;
  order_id?: string;
  success_url?: string;
  failure_url?: string;
  error?: string;
}

const LicenceWhatsapp = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<"qr" | "code" | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionCode, setConnectionCode] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Fetch user profile to check if solvable
  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch license data
  const { data: licenceData, isLoading: isLicenceLoading, refetch } = useQuery({
    queryKey: ["licenceWhatsapp", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("Licences Whatsapp")
        .select("*")
        .eq("id_user", user.id)
        .limit(1);

      if (error) {
        console.error("Error fetching licence data:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données de la licence",
        });
        return null;
      }

      return data.length > 0 ? data[0] : null;
    },
    enabled: !!user?.id,
  });

  // Handle connection to WhatsApp with QR Code
  const handleConnectQR = async () => {
    setConnectionMethod("qr");
    setDialogOpen(true);
    setIsLoading(true);

    try {
      if (!licenceData?.id_WaAPI) {
        throw new Error("ID WaAPI non trouvé");
      }

      const waApiId = String(licenceData.id_WaAPI);
      const response = await waApiService.getQrCode(waApiId);
      setQrCode(response.qrCode.data.qr_code);
      
      // Après une connexion réussie, mettons à jour le statut
      await waApiService.updateLicenceStatus(licenceData.id, true, "Connecté");
      refetch();
    } catch (error) {
      console.error("Error getting QR code:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer le QR code",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle connection to WhatsApp with Pairing Code
  const handleConnectCode = async () => {
    setConnectionMethod("code");
    setDialogOpen(true);
    setIsLoading(true);

    try {
      if (!licenceData?.id_WaAPI || !userProfile?.Numero_whatsapp_Bot) {
        throw new Error("ID WaAPI ou numéro WhatsApp non trouvé");
      }
      
      const waApiId = String(licenceData.id_WaAPI);
      const phoneNumber = String(userProfile.Numero_whatsapp_Bot);
      
      const response = await waApiService.requestPairingCode(
        waApiId, 
        phoneNumber
      );
      
      setConnectionCode(response.data.data.pairingCode);
      
      // Après une connexion réussie, mettons à jour le statut
      await waApiService.updateLicenceStatus(licenceData.id, true, "Connecté");
      refetch();
    } catch (error) {
      console.error("Error getting pairing code:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer le code de jumelage",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disconnection from WhatsApp
  const handleDisconnect = async () => {
    setIsLoading(true);

    try {
      if (!licenceData?.id_WaAPI) {
        throw new Error("ID WaAPI non trouvé");
      }

      const waApiId = String(licenceData.id_WaAPI);
      await waApiService.logout(waApiId);
      
      // Mettre à jour le statut dans la base de données
      await waApiService.updateLicenceStatus(licenceData.id, false, "Déconnecté");
      
      toast({
        title: "Déconnexion réussie",
        description: "La licence a été déconnectée de WhatsApp",
      });
      refetch();
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast({
        variant: "destructive",
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reboot/restart of the license
  const handleReboot = async () => {
    setIsLoading(true);

    try {
      if (!licenceData?.id_WaAPI) {
        throw new Error("ID WaAPI non trouvé");
      }

      const waApiId = String(licenceData.id_WaAPI);
      await waApiService.reboot(waApiId);
      
      // Mettre à jour le statut dans la base de données
      await waApiService.updateLicenceStatus(licenceData.id, true, "Redémarré");

      toast({
        title: "Redémarrage effectué",
        description: "La licence a été redémarrée avec succès",
      });
      refetch();
    } catch (error) {
      console.error("Error rebooting:", error);
      toast({
        variant: "destructive",
        title: "Erreur de redémarrage",
        description: "Une erreur est survenue lors du redémarrage",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle purchase Lygos payment gateway with improved debugging and error handling
  const handlePurchase = async () => {
    setIsLoading(true);
    setPaymentError(null);
    setDebugInfo(null);
    
    try {
      // Generate unique ID for order
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log("Generated order ID:", orderId);
      
      // Define payment details with BASE_URL for redirections
      const BASE_URL = window.location.origin;
      const successUrl = `${BASE_URL}/licence-whatsapp?success=true&orderId=${orderId}`;
      const failureUrl = `${BASE_URL}/licence-whatsapp?failure=true&orderId=${orderId}`;
      
      console.log("Success URL:", successUrl);
      console.log("Failure URL:", failureUrl);
      
      const paymentDetails = {
        amount: 200,
        shop_name: "bot whatsapp",
        message: "Achat d'une licence WhatsApp",
        success_url: successUrl,
        failure_url: failureUrl,
        order_id: orderId
      };
      
      console.log("Payment details prepared:", paymentDetails);
      setDebugInfo("Préparation du paiement - détails créés");
      
      // Verify API key presence
      const apiKey = "lygosapp-1b0aabd2-e115-4224-bc8f-254d355d62a4";
      if (!apiKey) {
        throw new Error("Clé API Lygos manquante");
      }
      
      setDebugInfo(prev => `${prev}\nConnexion à l'API Lygos...`);
      
      // Call Lygos API to create payment gateway with improved error handling
      const response = await fetch("https://api.lygosapp.com/v1/gateway", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey
        },
        body: JSON.stringify(paymentDetails)
      });
      
      setDebugInfo(prev => `${prev}\nRéponse reçue: status ${response.status}`);
      console.log("Lygos API response status:", response.status);
      
      // Handle non-JSON responses
      let data: LygosPaymentResponse;
      try {
        data = await response.json();
        console.log("Payment gateway response:", data);
        setDebugInfo(prev => `${prev}\nDonnées de réponse: ${JSON.stringify(data).substring(0, 100)}...`);
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error(`Erreur de format de réponse: ${response.statusText}`);
      }
      
      if (!response.ok) {
        const errorMessage = data.message || data.error || "Erreur inconnue";
        console.error("Payment gateway error:", errorMessage);
        throw new Error(`Erreur Lygos: ${errorMessage}`);
      }
      
      // Verify link presence - using the property "link" instead of "checkout_url"
      if (!data.link) {
        throw new Error("URL de paiement (link) non trouvée dans la réponse");
      }
      
      setDebugInfo(prev => `${prev}\nURL de paiement obtenue: ${data.link.substring(0, 30)}...`);
      console.log("Redirecting to checkout URL:", data.link);
      
      // Redirect to payment page
      window.location.href = data.link;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      console.error("Error purchasing:", error);
      setPaymentError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Erreur d'achat",
        description: `Échec du paiement: ${errorMessage}`,
      });
      
      setIsLoading(false);
    }
  };

  // Check for payment success or failure from URL params with improved logging
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const failure = urlParams.get('failure');
    const orderId = urlParams.get('orderId');

    if (success === 'true' && user?.id) {
      console.log("Payment successful for order:", orderId);
      
      // Update user to solvable
      supabase
        .from("user_profiles")
        .update({ solvable: true })
        .eq("id", user.id)
        .then(({ error, data }) => {
          if (error) {
            console.error("Error updating user profile:", error);
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Impossible de mettre à jour votre profil"
            });
          } else {
            console.log("User profile updated successfully:", data);
            toast({
              title: "Paiement réussi",
              description: "Votre licence WhatsApp sera disponible sous peu"
            });
            // Refetch data to update UI
            refetch();
          }
        });
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (failure === 'true') {
      console.log("Payment failed for order:", orderId);
      
      toast({
        variant: "destructive",
        title: "Paiement échoué",
        description: "Le paiement n'a pas pu être traité. Veuillez réessayer."
      });
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, user, refetch]);

  const getStatusComponent = () => {
    if (!licenceData) return null;

    const status = licenceData.statu || (licenceData.n8n_connected ? "Connecté" : "Déconnecté");
    
    // Définir le style en fonction du statut
    let icon, textColorClass, bgColorClass;
    
    if (status === "Redémarré" || status === "Démarrage") {
      // Style bleu pour Redémarré/Démarrage
      icon = <RefreshCw className="h-5 w-5 text-blue-500 mr-2" />;
      textColorClass = "text-blue-600";
      bgColorClass = "bg-blue-50";
    } else if (licenceData.n8n_connected || status === "Connecté") {
      // Style vert pour Connecté
      icon = <Check className="h-5 w-5 text-green-500 mr-2" />;
      textColorClass = "text-green-600";
      bgColorClass = "bg-green-50";
    } else {
      // Style rouge pour Déconnecté
      icon = <X className="h-5 w-5 text-red-500 mr-2" />;
      textColorClass = "text-red-600";
      bgColorClass = "bg-red-50";
    }

    return (
      <Badge 
        variant="outline" 
        className={`flex items-center px-3 py-1 ${bgColorClass} border-transparent`}
      >
        {icon}
        <span className={`font-medium ${textColorClass}`}>
          {status}
        </span>
      </Badge>
    );
  };

  const isUserWaiting = userProfile?.solvable && !licenceData;
  const isLoadingData = isUserProfileLoading || isLicenceLoading;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-transparent mesh-bg">
            <div className="container mx-auto p-4 sm:p-6 bg-transparent">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Licence WhatsApp</h1>
                <p className="text-muted-foreground">
                  Gérez votre connexion WhatsApp pour votre assistant
                </p>
              </div>

              {isLoadingData ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : isUserWaiting ? (
                <Card className="w-full max-w-3xl mx-auto white-card">
                  <CardHeader>
                    <CardTitle className="text-xl">Mise en place de votre assistant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-md">
                      <p className="text-orange-700">
                        <strong>Votre assistant est en cours de création.</strong> Ce processus peut prendre jusqu'à une heure maximum.
                      </p>
                      <p className="text-orange-700 mt-2">
                        Vous pouvez continuer à modifier les informations de votre assistant en attendant. Nous vous informerons dès que votre assistant sera prêt.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progression</span>
                        <span>En cours...</span>
                      </div>
                      <Progress value={33} className="h-2" />
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-4">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                      <div>
                        <p className="font-medium">Votre licence WhatsApp est en cours de préparation</p>
                        <p className="text-sm text-muted-foreground">Veuillez patienter, cela ne prendra pas longtemps.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : licenceData ? (
                <Card className="w-full max-w-3xl mx-auto white-card">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {licenceData.Nom || "Licence WhatsApp"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Statut</p>
                        {getStatusComponent()}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">ID de la licence</p>
                        <p className="font-mono text-sm">{licenceData.id || "N/A"}</p>
                      </div>
                      {licenceData.id_WaAPI && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">ID WaAPI</p>
                          <p className="font-mono text-sm">{licenceData.id_WaAPI}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3 justify-between">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          onClick={() => handleConnectQR()}
                          disabled={isLoading}
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Connecter à WhatsApp
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connecter à WhatsApp</DialogTitle>
                          <DialogDescription>
                            Choisissez votre méthode de connexion
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                          <Button 
                            onClick={handleConnectQR}
                            className="flex flex-col items-center justify-center p-6 h-28"
                            variant={connectionMethod === "qr" ? "default" : "outline"}
                          >
                            <span className="text-xl mb-2">QR Code</span>
                            <span className="text-xs text-center">Scanner un code QR avec votre téléphone</span>
                          </Button>
                          <Button 
                            onClick={handleConnectCode}
                            className="flex flex-col items-center justify-center p-6 h-28"
                            variant={connectionMethod === "code" ? "default" : "outline"}
                          >
                            <span className="text-xl mb-2">Code</span>
                            <span className="text-xs text-center">Recevoir un code à saisir manuellement</span>
                          </Button>
                        </div>
                        
                        {isLoading && (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                        )}
                        
                        {!isLoading && connectionMethod === "qr" && qrCode && (
                          <div className="flex flex-col items-center">
                            <div className="border p-2 bg-white rounded-md">
                              <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                            </div>
                            <p className="text-sm mt-4 text-center">
                              Scannez ce code QR avec votre téléphone pour connecter WhatsApp
                            </p>
                          </div>
                        )}
                        
                        {!isLoading && connectionMethod === "code" && connectionCode && (
                          <div className="flex flex-col items-center">
                            <div className="text-3xl font-mono tracking-wider border rounded-md px-6 py-4">
                              {connectionCode}
                            </div>
                            <p className="text-sm mt-4 text-center">
                              Saisissez ce code dans WhatsApp sur votre téléphone
                            </p>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={handleDisconnect}
                        disabled={isLoading || !licenceData.n8n_connected}
                      >
                        <Unlink className="mr-2 h-4 w-4" />
                        Déconnecter
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleReboot}
                        disabled={isLoading}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Redémarrer
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="w-full max-w-xl mx-auto white-card text-center">
                  <CardHeader>
                    <CardTitle>Aucune licence WhatsApp</CardTitle>
                  </CardHeader>
                  <CardContent className="py-8">
                    <p className="text-muted-foreground mb-6">
                      Vous n'avez pas encore de licence WhatsApp pour votre assistant.
                      Achetez une licence pour commencer à utiliser WhatsApp avec votre assistant.
                    </p>
                    
                    {/* Debug Info Display */}
                    {(paymentError || debugInfo) && (
                      <div className="mt-6 mb-6">
                        <Alert variant="destructive" className="mb-4">
                          <AlertTitle>Erreur de paiement détectée</AlertTitle>
                          <AlertDescription>
                            {paymentError && (
                              <p className="font-medium text-red-600 mb-2">
                                {paymentError}
                              </p>
                            )}
                            {debugInfo && (
                              <div className="mt-2">
                                <p className="font-medium">Détails techniques:</p>
                                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1 text-left whitespace-pre-wrap">
                                  {debugInfo}
                                </pre>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button onClick={handlePurchase} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Acheter une licence
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LicenceWhatsapp;
