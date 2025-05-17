
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
import { X, Plus, Edit, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  code: z.string().min(3, "Le code doit contenir au moins 3 caractères"),
  odds: z.string().min(1, "La cote est requise"),
  expiryDate: z.string().min(1, "La date d'expiration est requise"),
  expiryTime: z.string().optional(),
  image: z.instanceof(File).optional(),
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
  user_id: string | null; // Important: user_id est de type UUID dans la DB, mais string ici
  odds: string | null;
}

// Interface pour mapper les données de Supabase vers notre format d'affichage
interface CouponDisplay {
  id: number;
  title: string;
  description: string;
  code: string;
  odds: string;
  expiry_date: string;
  expiry_time: string;
  image_url: string | null;
  created_at: string;
  user_id: string | null; // Ajout de user_id ici aussi
}

// Type pour les valeurs du formulaire avec userId
interface FormValuesWithUserId extends z.infer<typeof formSchema> {
  userId: string;
}

const Coupons = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<CouponDisplay | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Fetch coupons with React Query
  const { data: couponsData = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Aucun utilisateur connecté, ne peut pas charger les coupons spécifiques à l'utilisateur.");
      }

      const { data, error } = await supabase
        .from('coupons')
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
    odds: coupon.odds || "1.00",
    expiry_date: coupon.jour || new Date().toISOString().split('T')[0],
    expiry_time: coupon.Heure || "",
    image_url: coupon.image_url,
    created_at: coupon.created_at,
    user_id: coupon.user_id
  }));

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      // S'assurer que le chemin correspond à la politique RLS (coupon-images/)
      const filePath = `coupon-images/${fileName}`; 
      
      const { data, error } = await supabase.storage
        .from('public') // Nom du bucket
        .upload(filePath, file);
      
      if (error) {
        console.error('Erreur Supabase Storage upload:', error);
        throw error;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('public') // Nom du bucket
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de l\'image:', error.message);
      toast({
        title: "Erreur de téléchargement d'image",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  // Add or update coupon mutation
  const mutation = useMutation({
    mutationFn: async (values: FormValuesWithUserId) => { // Accepte FormValuesWithUserId
      let imageUrl = editingCoupon?.image_url || null; // Conserve l'ancienne image par défaut
      
      if (selectedImage) { // Si une nouvelle image est sélectionnée
        const uploadedUrl = await uploadImage(selectedImage);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else if (!editingCoupon?.image_url) { 
          // Si le téléchargement échoue et qu'il n'y avait pas d'image avant (pour un nouveau coupon)
          // Ou si l'utilisateur veut explicitement supprimer l'image et que le téléchargement échoue
          // Peut-être ne pas définir imageUrl sur null ici, dépend du comportement souhaité.
          // Si le téléchargement échoue, on pourrait vouloir conserver l'ancienne image si c'est une édition.
          // Pour la création, si le téléchargement échoue, imageUrl restera null.
        }
      }
      
      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update({
            commentaire: values.title,
            "description visuelle": values.description,
            code_du_coupon: values.code,
            jour: values.expiryDate,
            Heure: values.expiryTime || null,
            odds: values.odds,
            image_url: imageUrl, // Utilise la nouvelle ou l'ancienne URL
            // user_id n'est pas mis à jour, car il est défini par la politique RLS à la création
          })
          .eq('id', editingCoupon.id);
          
        if (error) throw error;
        return { action: 'update', values };
      } else {
        // C'est ici que user_id est crucial
        const { error } = await supabase
          .from('coupons')
          .insert({
            commentaire: values.title,
            "description visuelle": values.description,
            code_du_coupon: values.code,
            jour: values.expiryDate,
            Heure: values.expiryTime || null,
            odds: values.odds,
            image_url: imageUrl,
            user_id: values.userId, // Ajout de user_id
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
      setSelectedImage(null);
      setImagePreview(null);
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
        .from('coupons')
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
      expiryTime: "",
    },
  });

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setSelectedImage(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (eventReader) => { // Renommé 'e' en 'eventReader' pour éviter conflit de portée
        setImagePreview(eventReader.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setSelectedImage(null);
      // Si aucune image n'est sélectionnée (par exemple, l'utilisateur efface le champ),
      // et que nous sommes en mode édition, nous pourrions vouloir remettre l'aperçu de l'image existante.
      // Ou le laisser vide pour indiquer que l'image sera supprimée si l'utilisateur enregistre.
      // Pour l'instant, on efface l'aperçu.
      setImagePreview(null);
    }
  };

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
    setImagePreview(coupon.image_url);
    form.reset({
      title: coupon.title,
      description: coupon.description,
      code: coupon.code,
      odds: coupon.odds,
      expiryDate: coupon.expiry_date,
      expiryTime: coupon.expiry_time || undefined,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour ajouter ou modifier un coupon.",
        variant: "destructive",
      });
      // Idéalement, rediriger vers la page de connexion ou afficher un modal de connexion
      // Pour l'instant, on empêche la soumission.
      return;
    }

    mutation.mutate({ ...values, userId: user.id });
  };

  const handleAddNew = () => {
    setEditingCoupon(null);
    setSelectedImage(null);
    setImagePreview(null);
    form.reset({
      title: "",
      description: "",
      code: "",
      odds: "",
      expiryDate: new Date().toISOString().split("T")[0], // Assurer que c'est toujours la date actuelle
      expiryTime: "",
      // image: undefined, // React Hook Form gère cela via le File input
    });
    setDialogOpen(true);
  };

  const openImagePreview = (imageUrl: string) => {
    setSelectedPreviewImage(imageUrl);
    setImagePreviewOpen(true);
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
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                      {coupons.map((coupon) => (
                        <Card key={coupon.id} className="overflow-hidden flex flex-col">
                          {coupon.image_url && (
                            <div 
                              className="cursor-pointer" 
                              onClick={() => openImagePreview(coupon.image_url!)}
                            >
                              <AspectRatio ratio={16 / 9} className="bg-muted">
                                <img 
                                  src={coupon.image_url} 
                                  alt={coupon.title} 
                                  className="object-cover w-full h-full" 
                                />
                              </AspectRatio>
                            </div>
                          )}
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base md:text-xl">{coupon.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2 flex-wrap text-xs md:text-sm">
                              <span>Cote: {coupon.odds}</span>
                              <span>•</span>
                              <span>Expire: {new Date(coupon.expiry_date).toLocaleDateString()}</span>
                              {coupon.expiry_time && (
                                <>
                                  <span>•</span>
                                  <span>à {coupon.expiry_time}</span>
                                </>
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs md:text-sm break-words">{coupon.description}</p>
                            <div className="mt-3 flex items-center gap-2 rounded-md bg-muted p-2">
                              <code className="text-xs font-semibold truncate flex-1">{coupon.code}</code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto h-6 w-6 shrink-0"
                                onClick={() => handleCopyCoupon(coupon.code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                          <CardFooter className="border-t bg-muted/50 px-3 py-2 md:px-6 md:py-3 mt-auto">
                            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                              <span className="truncate text-[10px] md:text-xs">Créé le {new Date(coupon.created_at).toLocaleDateString()}</span>
                              <div className="flex gap-1 md:gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 md:h-7 md:w-7"
                                  onClick={() => handleEditCoupon(coupon)}
                                >
                                  <Edit className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 md:h-7 md:w-7 text-destructive"
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  disabled={deleteMutation.isPending && deleteMutation.variables === coupon.id}
                                >
                                  {deleteMutation.isPending && deleteMutation.variables === coupon.id ? 
                                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> : 
                                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />}
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

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setEditingCoupon(null);
          setSelectedImage(null);
          setImagePreview(null);
          form.reset();
        }
      }}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh]">
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
          <ScrollArea className="max-h-[65vh] pr-4">
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

                {/* Image upload */}
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </FormControl>
                  <FormDescription>
                    Choisissez une image pour votre coupon (facultatif)
                  </FormDescription>
                  {imagePreview && (
                    <div className="mt-2 rounded-md overflow-hidden border">
                      <AspectRatio ratio={16 / 9}>
                        <img 
                          src={imagePreview} 
                          alt="Aperçu de l'image" 
                          className="object-cover w-full h-full" 
                        />
                      </AspectRatio>
                    </div>
                  )}
                </FormItem>

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

                <div className="grid grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="expiryTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heure d'expiration</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="pt-4 pb-2">
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
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Modal de prévisualisation d'image en grand format */}
      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 gap-0 bg-transparent border-0">
          <div className="relative w-full">
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 rounded-full z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => setImagePreviewOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedPreviewImage && (
              <img
                src={selectedPreviewImage}
                alt="Aperçu du coupon"
                className="w-full h-auto rounded-lg max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Coupons;
