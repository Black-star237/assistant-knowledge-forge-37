
import React, { useState } from "react";
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
import { Plus, Edit, Trash2, Copy, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  code: z.string().min(3, "Le code doit contenir au moins 3 caractères"),
  odds: z.string().min(1, "La cote est requise"),
  expiryDate: z.string().min(1, "La date d'expiration est requise"),
});

// Définir le type de coupon pour assurer la cohérence
interface Coupon {
  id: number;
  title: string;
  description: string;
  code: string;
  odds: string;
  expiryDate: string;
  createdAt: string;
}

const Coupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 1,
      title: "Combiné Football du weekend",
      description: "PSG vs Marseille, Bayern vs Dortmund, Real Madrid vs Barcelona",
      code: "FOOT-2023-1",
      odds: "5.75",
      expiryDate: "2025-05-15",
      createdAt: "2025-05-10",
    },
    {
      id: 2,
      title: "Tennis - Roland Garros",
      description: "Prédictions pour les demi-finales de Roland Garros",
      code: "TENNIS-RG-24",
      odds: "3.25",
      expiryDate: "2025-05-20",
      createdAt: "2025-05-08",
    },
    {
      id: 3,
      title: "Basketball NBA",
      description: "Lakers vs Celtics, Nets vs Heat",
      code: "NBA-2023-45",
      odds: "4.50",
      expiryDate: "2025-05-18",
      createdAt: "2025-05-11",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

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
    setCoupons(coupons.filter((coupon) => coupon.id !== id));
    toast({
      title: "Coupon supprimé",
      description: "Le coupon a été supprimé avec succès.",
    });
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    form.reset({
      title: coupon.title,
      description: coupon.description,
      code: coupon.code,
      odds: coupon.odds,
      expiryDate: coupon.expiryDate,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingCoupon) {
      setCoupons(
        coupons.map((coupon) =>
          coupon.id === editingCoupon.id ? { ...coupon, ...values } : coupon
        )
      );
      toast({
        title: "Coupon modifié !",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    } else {
      // Utiliser le typage explicite pour s'assurer que tous les champs requis sont présents
      const newCoupon: Coupon = {
        id: Math.max(0, ...coupons.map((c) => c.id)) + 1,
        title: values.title,
        description: values.description,
        code: values.code,
        odds: values.odds,
        expiryDate: values.expiryDate,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCoupons([newCoupon, ...coupons]);
      toast({
        title: "Coupon ajouté !",
        description: "Le nouveau coupon a été créé avec succès.",
      });
    }
    setDialogOpen(false);
    setEditingCoupon(null);
    form.reset();
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

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {coupons.map((coupon) => (
                  <Card key={coupon.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle>{coupon.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>Cote: {coupon.odds}</span>
                        <span>•</span>
                        <span>Expire: {coupon.expiryDate}</span>
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
                        <span>Créé le {coupon.createdAt}</span>
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
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {coupons.length === 0 && (
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
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" />
                  {editingCoupon ? "Enregistrer les modifications" : "Ajouter le coupon"}
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
