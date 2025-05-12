import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  code: z.string().min(3, "Le code doit contenir au moins 3 caractères"),
  odds: z.string().min(1, "La cote est requise"),
  expiryDate: z.string().min(1, "La date d'expiration est requise"),
});

// Définition du type selon la structure réelle de la table Supabase
interface DbCoupon {
  id: number;
  code_du_coupon: string | null;
  commentaire: string | null;
  "description visuelle": string | null;
  image_url: string | null;
  jour: string | null;
  Heure: string | null;
  created_at: string;
  user_id: string | null;
}

// Interface pour mapper les données de Supabase vers notre format d'affichage
interface CouponDisplay {
  id: number;
  title: string;
  description: string;
  code: string;
  odds: string;
  expiry_date: string;
  created_at: string;
}

const Coupons = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponDisplay | null>(null);

  // Fetch coupons with React Query
  const { data: couponsData = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DbCoupon[];
    }
  });

  // Convert Supabase data to our display format
  const coupons: CouponDisplay[] = couponsData.map(coupon => ({
    id: coupon.id,
    title: coupon.commentaire || "Sans titre",
    description: coupon["description visuelle"] || "Pas de description",
    code: coupon.code_du_coupon || "",
    odds: "1.00", // Valeur par défaut car ce champ n'existe pas dans votre table
    expiry_date: coupon.jour || new Date().toISOString().split('T')[0],
    created_at: coupon.created_at
  }));

  // Add or update coupon mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (editingCoupon) {
        const { error } = await supabase
          .from('Coupons')
          .update({
            commentaire: values.title,
            "description visuelle": values.description,
            code_du_coupon: values.code,
            jour: values.expiryDate,
          })
          .eq('id', editingCoupon.id);
          
        if (error) throw error;
        return { action: 'update', values };
      } else {
        const { error } = await supabase
          .from('Coupons')
          .insert({
            commentaire: values.title,
            "description visuelle": values.description,
            code_du_coupon: values.code,
            jour: values.expiryDate,
          });
          
        if (error) throw error;
        return { action: 'insert', values };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({
        title: result.action === 'update' ? "Coupon modifié !" : "Coupon ajouté !",
        description: result.action === 'update' 
          ? "Les modifications ont été enregistrées avec succès." 
          : "Le nouveau coupon a été créé avec succès.",
      });
      setDialogOpen(false);
      setEditingCoupon(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Une erreur s'est produite: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete coupon mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('Coupons')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({
        title: "Coupon supprimé",
        description: "Le coupon a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Une erreur s'est produite: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      odds: "",
      expiryDate: "",
    },
  });

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copié !",
      description: "Le code du coupon a été copié dans le presse-papiers.",
    });
  };

  const handleDeleteCoupon = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleEditCoupon = (coupon: CouponDisplay) => {
    setEditingCoupon(coupon);
    form.reset({
      title: coupon.title,
      description: coupon.description,
      code: coupon.code,
      odds: coupon.odds,
      expiryDate: coupon.expiry_date.split('T')[0],
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const handleAddNew = () => {
    setEditingCoupon(null);
    form.reset({
      title: "",
      description: "",
      code: "",
      odds: "",
      expiryDate: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto p-4 sm:p-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
                  <p className="text-muted-foreground">
                    Gérez les coupons de paris que votre assistant pourra partager
                  </p>
                </div>
                <Button onClick={handleAddNew} className="mt-4 sm:mt-0">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un coupon
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Chargement des coupons...</span>
                </div>
              ) : (
                <>
                  {coupons.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {coupons.map((coupon) => (
                        <Card key={coupon.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <CardTitle>{coupon.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <span>Cote: {coupon.odds}</span>
                              <span>•</span>
                              <span>Expire: {new Date(coupon.expiry_date).toLocaleDateString()}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{coupon.description}</p>
                            <div className="mt-3 flex items-center gap-2 rounded-md bg-muted p-2">
                              <code className="text-xs font-semibold">{coupon.code}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6"
                                onClick={() => handleCopyCoupon(coupon.code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                          <CardFooter className="border-t bg-muted/50 px-6 py-3">
                            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                              <span>Créé le {new Date(coupon.created_at).toLocaleDateString()}</span>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEditCoupon(coupon)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                      <div className="rounded-full bg-primary/10 p-4 text-primary">
                        <Plus className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">Aucun coupon</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Vous n'avez pas encore créé de coupon. Ajoutez-en un maintenant.
                      </p>
                      <Button onClick={handleAddNew} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un coupon
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Modifier le coupon" : "Ajouter un nouveau coupon"}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon
                ? "Modifiez les détails du coupon ci-dessous"
                : "Remplissez les détails pour créer un nouveau coupon"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Combiné Football du weekend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez les matchs ou événements inclus dans ce coupon"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: FOOT-2023-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="odds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cote</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: 5.75" type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'expiration</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {editingCoupon ? "Enregistrer les modifications" : "Ajouter le coupon"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Coupons;
