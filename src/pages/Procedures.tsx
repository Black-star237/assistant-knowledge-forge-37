import React, { useState } from "react";
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Check, FileText, Search, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  steps: z.string().min(10, "Les étapes doivent contenir au moins 10 caractères"),
});

// Interface for display and manipulation (derived from DB schema)
interface ProcedureDisplay {
  id: number;
  title: string; // From Titre_procedure in DB
  description: string; // From description in DB
  steps: string; // From etapes_procedure in DB
  created_at: string;
  user_id?: string | null; // Make user_id optional
}

const Procedures = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<ProcedureDisplay | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch procedures with React Query
  const { data: proceduresData = [], isLoading } = useQuery({
    queryKey: ['procedures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Convert DB data to our display format
  const procedures: ProcedureDisplay[] = proceduresData.map((item: Tables<'procedures'>) => {
    return {
      id: item.id,
      title: item.Titre_procedure || "Procédure sans titre",
      description: item.description || "",
      steps: item.etapes_procedure || "",
      created_at: item.created_at,
      user_id: item.user_id,
    };
  });

  // Add or update procedure mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!user?.id) {
        throw new Error("Utilisateur non authentifié");
      }

      const dbPayload = {
        Titre_procedure: values.title,
        description: values.description,
        etapes_procedure: values.steps,
        user_id: user.id // Automatically set the user_id with current user
      };

      if (editingProcedure) {
        const { error } = await supabase
          .from('procedures')
          .update(dbPayload)
          .eq('id', editingProcedure.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('procedures')
          .insert(dbPayload);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
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
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('procedures')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
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
    },
  });

  const handleDeleteProcedure = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleEditProcedure = (procedure: ProcedureDisplay) => {
    setEditingProcedure(procedure);
    form.reset({
      title: procedure.title,
      description: procedure.description,
      steps: procedure.steps,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast({ title: "Erreur", description: "Vous devez être connecté pour effectuer cette action.", variant: "destructive" });
      return;
    }
    mutation.mutate(values);
  };

  const handleAddNew = () => {
    if (!user) {
      toast({ title: "Non autorisé", description: "Veuillez vous connecter pour ajouter une procédure.", variant: "destructive" });
      return;
    }
    setEditingProcedure(null);
    form.reset();
    setDialogOpen(true);
  };

  // Filter procedures by search query
  const filteredProcedures = procedures.filter((procedure) =>
    procedure.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    procedure.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    procedure.steps.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une procédure..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Chargement des procédures...</span>
                </div>
              ) : filteredProcedures.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredProcedures.map((procedure) => (
                    <Card key={procedure.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{procedure.title}</CardTitle>
                          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                            <FileText className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium">Description:</h4>
                            <p className="text-sm mt-1">{procedure.description}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Étapes:</h4>
                            <p className="text-sm mt-1 whitespace-pre-line">{procedure.steps}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/50 px-6 py-3">
                        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                          <span>Créé le {new Date(procedure.created_at).toLocaleDateString()}</span>
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
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <div className="rounded-full bg-primary/10 p-4 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  {searchQuery ? (
                    <>
                      <h3 className="mt-4 text-lg font-semibold">Aucun résultat</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Aucune procédure ne correspond à votre recherche.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-4 text-lg font-semibold">Aucune procédure</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Vous n'avez pas encore ajouté de procédures.
                      </p>
                      <Button onClick={handleAddNew} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une procédure
                      </Button>
                    </>
                  )}
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
                ? "Modifiez la procédure et ses étapes ci-dessous"
                : "Ajoutez une nouvelle procédure étape par étape"}
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
                      <Input placeholder="ex: Comment réinitialiser mon mot de passe" {...field} />
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
                        placeholder="Décrivez la procédure de façon claire..."
                        className="min-h-[80px]"
                        {...field}
                      />
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
                        placeholder="Détaillez chaque étape sur une ligne distincte..."
                        className="min-h-[120px]"
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
                <Button type="submit" disabled={mutation.isPending}>
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
