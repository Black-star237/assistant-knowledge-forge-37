
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

const LicenceWhatsapp = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState<"qr" | "code" | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectionCode, setConnectionCode] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch license data
  const { data: licenceData, isLoading: isLicenceLoading, refetch } = useQuery({
    queryKey: ["licenceWhatsapp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Licences Whatsapp")
        .select("*")
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
  });

  // Handle connection to WhatsApp
  const handleConnect = (method: "qr" | "code") => {
    setConnectionMethod(method);
    setDialogOpen(true);
    setIsLoading(true);

    // Simulate API call to get QR code or connection code
    setTimeout(() => {
      setIsLoading(false);
      if (method === "qr") {
        // In a real implementation, this would be a base64 encoded QR code from the API
        setQrCode("https://via.placeholder.com/250x250?text=QR+Code");
      } else {
        // In a real implementation, this would be a code from the API
        setConnectionCode("123-456-789");
      }
    }, 1500);
  };

  // Handle disconnection from WhatsApp
  const handleDisconnect = async () => {
    setIsLoading(true);

    try {
      // In a real implementation, call API to disconnect
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update database status
      if (licenceData?.id) {
        const { error } = await supabase
          .from("Licences Whatsapp")
          .update({ n8n_connected: false })
          .eq("id", licenceData.id);

        if (error) throw error;
      }

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
      // In a real implementation, call API to reboot
      await new Promise((resolve) => setTimeout(resolve, 1500));

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

  // Handle purchase of a new license
  const handlePurchase = () => {
    // In a real implementation, redirect to purchase page or open payment dialog
    toast({
      title: "Acheter une licence",
      description: "Redirection vers la page d'achat...",
    });
  };

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

              {isLicenceLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
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
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3 justify-between">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="default" 
                          onClick={() => handleConnect("qr")}
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
                            onClick={() => handleConnect("qr")}
                            className="flex flex-col items-center justify-center p-6 h-28"
                            variant={connectionMethod === "qr" ? "default" : "outline"}
                          >
                            <span className="text-xl mb-2">QR Code</span>
                            <span className="text-xs text-center">Scanner un code QR avec votre téléphone</span>
                          </Button>
                          <Button 
                            onClick={() => handleConnect("code")}
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
                    <Button onClick={handlePurchase}>
                      <Plus className="mr-2 h-4 w-4" />
                      Acheter une licence
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
