
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Edit, Trash2, Check, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  steps: z.string().min(10, "Les étapes doivent contenir au moins 10 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
});

const Procedures = () => {
  const { toast } = useToast();
  const [procedures, setProcedures] = useState([
    {
      id: 1,
      title: "Comment créer un compte",
      description: "Procédure pour créer un nouveau compte utilisateur",
      steps: "1. Accédez à la page d'inscription\n2. Remplissez le formulaire avec vos informations\n3. Vérifiez votre email\n4. Confirmez votre inscription en cliquant sur le lien\n5. Complétez votre profil",
      category: "Inscription",
      updatedAt: "2025-05-08",
    },
    {
      id: 2,
      title: "Comment placer un pari",
      description: "Étapes pour placer un pari sur notre plateforme",
      steps: "1. Connectez-vous à votre compte\n2. Accédez à la section paris\n3. Sélectionnez l'événement sportif\n4. Choisissez votre type de pari\n5. Entrez le montant\n6. Confirmez votre mise",
      category: "Paris",
      updatedAt: "2025-05-10",
    },
    {
      id: 3,
      title: "Procédure de retrait",
      description: "Comment effectuer un retrait de vos gains",
      steps: "1. Allez dans la section 'Mon compte'\n2. Sélectionnez 'Retrait'\n3. Choisissez votre méthode de retrait\n4. Entrez le montant souhaité\n5. Confirmez la transaction\n6. Attendez la validation (24-48h)",
      category: "Paiement",
      updatedAt: "2025-05-11",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      steps: "",
      category: "",
    },
  });

  const handleDeleteProcedure = (id: number) => {
    setProcedures(procedures.filter((procedure) => procedure.id !== id));
    toast({
      title: "Procédure supprimée",
      description: "La procédure a été supprimée avec succès.",
    });
  };

  const handleEditProcedure = (procedure: any) => {
    setEditingProcedure(procedure);
    form.reset({
      title: procedure.title,
      description: procedure.description,
      steps: procedure.steps,
      category: procedure.category,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingProcedure) {
      setProcedures(
        procedures.map((procedure) =>
          procedure.id === editingProcedure.id
            ? { ...procedure, ...values, updatedAt: new Date().toISOString().split("T")[0] }
            : procedure
        )
      );
      toast({
        title: "Procédure modifiée !",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    } else {
      const newProcedure = {
        id: Math.max(0, ...procedures.map((p) => p.id)) + 1,
        ...values,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setProcedures([newProcedure, ...procedures]);
      toast({
        title: "Procédure ajoutée !",
        description: "La nouvelle procédure a été créée avec succès.",
      });
    }
    setDialogOpen(false);
    setEditingProcedure(null);
    form.reset();
  };

  const handleAddNew = () => {
    setEditingProcedure(null);
    form.reset();
    setDialogOpen(true);
  };

  // Group procedures by category
  const proceduresByCategory: Record<string, typeof procedures> = {};
  procedures.forEach((procedure) => {
    if (!proceduresByCategory[procedure.category]) {
      proceduresByCategory[procedure.category] = [];
    }
    proceduresByCategory[procedure.category].push(procedure);
  });

  return (
    <SidebarProvider defaultCollapsed={false} collapsedWidth={70}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto p-4 sm:p-6">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Procédures</h1>
                  <p className="text-muted-foreground">
                    Créez des guides étape par étape pour vos clients
                  </p>
                </div>
                <Button onClick={handleAddNew} className="mt-4 sm:mt-0">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une procédure
                </Button>
              </div>

              {Object.keys(proceduresByCategory).length > 0 ? (
                Object.entries(proceduresByCategory).map(([category, categoryProcedures]) => (
                  <div key={category} className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">{category}</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {categoryProcedures.map((procedure) => (
                        <Card key={procedure.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{procedure.title}</CardTitle>
                              <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                                <FileText className="h-4 w-4" />
                              </div>
                            </div>
                            <CardDescription>{procedure.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="steps">
                                <AccordionTrigger className="text-sm font-medium py-2">
                                  Voir les étapes
                                </AccordionTrigger>
                                <AccordionContent className="text-sm">
                                  <div className="whitespace-pre-line">
                                    {procedure.steps}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </CardContent>
                          <CardFooter className="border-t bg-muted/50 px-6 py-3">
                            <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                              <span>Mis à jour le {procedure.updatedAt}</span>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEditProcedure(procedure)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDeleteProcedure(procedure.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Aucune procédure</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Vous n'avez pas encore créé de procédure. Ajoutez-en une maintenant.
                  </p>
                  <Button onClick={handleAddNew} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une procédure
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
              {editingProcedure ? "Modifier la procédure" : "Ajouter une nouvelle procédure"}
            </DialogTitle>
            <DialogDescription>
              {editingProcedure
                ? "Modifiez les détails de la procédure ci-dessous"
                : "Créez une nouvelle procédure étape par étape"}
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
                      <Input placeholder="ex: Comment créer un compte" {...field} />
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
                      <Input
                        placeholder="ex: Procédure pour créer un nouveau compte utilisateur"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Inscription, Paris, Paiement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="steps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Étapes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez les étapes (une par ligne)&#10;1. Première étape&#10;2. Deuxième étape&#10;..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Entrez chaque étape sur une ligne distincte, de préférence numérotée
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" />
                  {editingProcedure ? "Enregistrer les modifications" : "Ajouter la procédure"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Procedures;
