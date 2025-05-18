
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
import { createPaymentSession, verifyPayment } from "@/services/lygos";

const LicenceWhatsapp = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<"qr" | "code" | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionCode, setConnectionCode] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      
      // Nous ne modifions plus la table Licences Whatsapp directement
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
      
      // Nous ne modifions plus la table Licences Whatsapp directement
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
      
      // Nous ne modifions plus la table Licences Whatsapp directement
      
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

  // Handle purchase Lygos payment gateway
  const handlePurchase = async () => {
    setIsLoading(true);

    try {
      if (!user?.id) {
        throw new Error("Utilisateur non connecté");
      }
      
      // Generate unique ID for order
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Create order in Supabase
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          statu: 1 // Statut "en attente"
        })
        .select();
      
      if (orderError || !orderData || orderData.length === 0) {
        throw new Error("Erreur lors de la création de la commande");
      }
      
      const dbOrderId = String(orderData[0].id); // Convert to string for createPaymentSession
      
      // Call Lygos API to create payment session
      const paymentResponse = await createPaymentSession(
        dbOrderId,
        20600, // Montant en FCFA
        `${window.location.origin}/licence-whatsapp?success=true&orderId=${dbOrderId}`,
        `${window.location.origin}/licence-whatsapp?failure=true&orderId=${dbOrderId}`
      );
      
      console.log("Payment session created:", paymentResponse);
      
      // Redirect to payment page
      if (paymentResponse.link) {
        window.location.href = paymentResponse.link;
      } else {
        throw new Error("URL de paiement non trouvée dans la réponse");
      }

    } catch (error) {
      console.error("Error purchasing:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'achat",
        description: "Une erreur est survenue lors de la création du paiement",
      });
      setIsLoading(false);
    }
  };

  // Check for payment success or failure from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const failure = urlParams.get('failure');
    const orderId = urlParams.get('orderId');

    if (success === 'true' && orderId && user?.id) {
      console.log("Payment successful for order:", orderId);
      
      // Verify payment with Lygos API
      const verifyPaymentStatus = async () => {
        try {
          const verificationResponse = await verifyPayment(orderId); // orderId is already a string from URL params
          
          if (verificationResponse.status === "SUCCESS" || verificationResponse.status === "PAID") {
            // Update order status in Supabase
            await supabase
              .from("orders")
              .update({ statu: 3 }) // Statut "completed"
              .eq("id", orderId);
              
            // Update user to solvable
            await supabase
              .from("user_profiles")
              .update({ solvable: true })
              .eq("id", user.id);
              
            toast({
              title: "Paiement réussi",
              description: "Votre licence WhatsApp sera disponible sous peu"
            });
            
            // Trigger webhook to create a license
            try {
              await fetch("https://n8n.coolify.digit-service.org/webhook/3ff0f006-771c-44c5-b791-4e6250605a5e", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  id: orderId,
                  table_name: "orders"
                })
              });
            } catch (webhookError) {
              console.error("Error calling webhook:", webhookError);
            }
            
            // Refetch data to update UI
            refetch();
          } else {
            toast({
              variant: "destructive",
              title: "Paiement non confirmé",
              description: "Le statut du paiement n'a pas pu être vérifié. Veuillez contacter le support."
            });
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          toast({
            variant: "destructive",
            title: "Erreur de vérification",
            description: "Impossible de vérifier le statut du paiement"
          });
        }
      };
      
      verifyPaymentStatus();
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (failure === 'true') {
      console.log("Payment failed for order:", orderId);
      
      // Update order status in database
      if (orderId) {
        supabase
          .from("orders")
          .update({ statu: 2 }) // Statut "failed"
          .eq("id", orderId)
          .then(() => {
            toast({
              variant: "destructive",
              title: "Paiement échoué",
              description: "Le paiement n'a pas pu être traité. Veuillez réessayer."
            });
          });
      }
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, user, refetch]);

  const getStatusComponent = () => {
    if (licenceData?.n8n_connected) {
      return (
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-500 font-medium">Connecté</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <X className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-500 font-medium">Déconnecté</span>
        </div>
      );
    }
  };

  const isUserWaiting = userProfile?.solvable && !licenceData;
  const isLoadingData = isUserProfileLoading || isLicenceLoading;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto p-4 sm:p-6">
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
                <Card className="w-full max-w-3xl mx-auto">
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
                <Card className="w-full max-w-3xl mx-auto">
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
                <Card className="w-full max-w-xl mx-auto text-center">
                  <CardHeader>
                    <CardTitle>Aucune licence WhatsApp</CardTitle>
                  </CardHeader>
                  <CardContent className="py-8">
                    <p className="text-muted-foreground mb-6">
                      Vous n'avez pas encore de licence WhatsApp pour votre assistant.
                      Achetez une licence pour commencer à utiliser WhatsApp avec votre assistant.
                    </p>
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
