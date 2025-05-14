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
import { Plus, Edit, Trash2, Check, FileText, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

// Form schema: 'category' is still here, but DB table 'procédures' doesn't have it.
// This will need to be reconciled later if category functionality is desired.
const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"), // Maps to Titre_procedure
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"), // Maps to description
  steps: z.string().min(10, "Les étapes doivent contenir au moins 10 caractères"), // Maps to etapes_procedure
  category: z.string().min(1, "La catégorie est requise"), // No direct DB column in 'procédures'
});

// Display type for procedures
interface Procedure {
  id: number;
  title: string;
  description: string;
  steps: string;
  category: string; // Kept for UI grouping, but not from DB directly
  updated_at: string; // from created_at
}

const Procedures = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  // Fetch procedures with React Query
  const { data: proceduresData = [], isLoading } = useQuery<Tables<'procédures'>[], Error>({
    queryKey: ['procedures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('procédures')
        .select('*') // Selects Titre_procedure, description, etapes_procedure, etc.
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || []; // Ensure data is not null
    }
  });

  // Convert DB data (Tables<'procédures'>) to display format (Procedure)
  const procedures: Procedure[] = proceduresData.map((item: Tables<'procédures'>) => {
    return {
      id: item.id,
      title: item.Titre_procedure || "Procédure sans titre",
      description: item.description || "Pas de description",
      steps: item.etapes_procedure || "",
      // Category is not in item from DB. Assign a default or handle as needed.
      // For now, to make UI work, using a default. This needs review for actual category logic.
      category: "Général", // Placeholder
      updated_at: item.created_at 
    };
  });

  // Add or update procedure mutation
  const mutation = useMutation<void, Error, z.infer<typeof formSchema>>({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Map form values to DB column names from 'procédures' table
      const dbPayload = {
        Titre_procedure: values.title,
        description: values.description,
        etapes_procedure: values.steps,
        // 'user_id' is not in the form, handle implicitly via RLS or if table requires it
        // 'category' from form (values.category) is not saved as 'procédures' table lacks this column.
      };
      
      if (editingProcedure) {
        const { error } = await supabase
          .from('procédures')
          .update(dbPayload)
          .eq('id', editingProcedure.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('procédures')
          .insert(dbPayload);
          
        if (error) throw error;
      }
    },
    onSuccess: () => { // Removed result parameter
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      toast({
        title: editingProcedure ? "Procédure modifiée !" : "Procédure ajoutée !",
        description: editingProcedure 
          ? "Les modifications ont été enregistrées avec succès." 
          : "La nouvelle procédure a été créée avec succès.",
      });
      setDialogOpen(false);
      setEditingProcedure(null);
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

  // Delete procedure mutation
  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('procédures')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => { // Removed id parameter
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      toast({
        title: "Procédure supprimée",
        description: "La procédure a été supprimée avec succès.",
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
      steps: "",
      category: "Général", // Default category for form
    },
  });

  const handleDeleteProcedure = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleEditProcedure = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    form.reset({
      title: procedure.title,
      description: procedure.description,
      steps: procedure.steps,
      category: procedure.category, // Form still uses category
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const handleAddNew = () => {
    setEditingProcedure(null);
    form.reset(); // Resets to defaultValues, including category: "Général"
    setDialogOpen(true);
  };

  // Group procedures by category
  const proceduresByCategory: Record<string, Procedure[]> = {};
  procedures.forEach((procedure) => {
    if (!proceduresByCategory[procedure.category]) {
      proceduresByCategory[procedure.category] = [];
    }
    proceduresByCategory[procedure.category].push(procedure);
  });

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
                  <h1 className="text-3xl font-bold tracking-tight">Procédures</h1>
                  <p className="text-muted-foreground">
                    Créez des guides étape par étape pour vos clients
                  </p>
                </div>
                <Button onClick={handleAddNew} className="mt-4 sm:mt-0">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une procédure
                </Button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Chargement des procédures...</span>
                </div>
              ) : (
                <>
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
                                  <span>Mis à jour le {new Date(procedure.updated_at).toLocaleDateString()}</span>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleEditProcedure(procedure)}
                                      disabled={mutation.isPending || deleteMutation.isPending}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive"
                                      onClick={() => handleDeleteProcedure(procedure.id)}
                                      disabled={deleteMutation.isPending || mutation.isPending}
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
                      <Input placeholder="ex: Inscription 1xbet" {...field} />
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

              {/* Category field is in the form, but 'procédures' table doesn't have 'category' column.
                  This value won't be saved to DB unless schema changes. */}
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
                      {editingProcedure ? "Enregistrer les modifications" : "Ajouter la procédure"}
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

export default Procedures;
