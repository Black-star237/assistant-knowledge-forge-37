
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
import { Plus, Edit, Trash2, Check, HelpCircle, Search, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  problem: z.string().min(10, "La description du problème doit contenir au moins 10 caractères"),
  solution: z.string().min(10, "La solution doit contenir au moins 10 caractères"),
  tags: z.string(),
  category: z.string().min(1, "La catégorie est requise"),
});

// Interface for display and manipulation (derived from DB schema)
interface ProblemDisplay {
  id: number;
  title: string; // Derived or from 'titre' in DB
  problem: string; // From 'Description' in DB
  solution: string; // From 'Solutions'in DB
  tags: string[]; // Parsed from 'tags' string
  category: string; // From 'category' in DB
  updated_at: string; // From 'created_at' in DB
  user_profile?: string | null; // Make user_profile optional
}

const Problems = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth(); // Get the authenticated user
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemDisplay | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch problems with React Query
  const { data: problemsData = [], isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('problemes_et_solutions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Convert DB data (Tables<'problèmes_et_solutions'>) to our display format (ProblemDisplay)
  const problems: ProblemDisplay[] = problemsData.map((item) => {
    // Use 'titre' if available, otherwise derive from 'Description'
    const title = item.titre || (item.Description || "Problème sans titre").split('\n')[0].substring(0, 50);
    
    return {
      id: item.id,
      title: item.titre || title + (item.titre && title.length >=50 ? '...' : ''),
      problem: item.Description || "", // Use item.Description for problem
      solution: item.Solutions || "",
      tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
      category: item.category || "Général",
      updated_at: item.created_at,
      user_profile: item.user_profile,
    };
  });

  type ProblemMutationVariables = z.infer<typeof formSchema> & { userId?: string };

  // Add or update problem mutation
  const mutation = useMutation({
    mutationFn: async (values: ProblemMutationVariables) => {
      if (!user && !values.userId) {
        throw new Error("Utilisateur non authentifié ou ID utilisateur manquant.");
      }
      const currentUserId = user?.id || values.userId;
      if (!currentUserId) {
        throw new Error("ID utilisateur non trouvé.");
      }

      const dbPayload = {
        titre: values.title, // 'title' from form maps to 'titre' in DB
        Description: values.problem, // 'problem' from form maps to 'Description' in DB
        Solutions: values.solution,
        tags: values.tags,
        category: values.category,
        user_profile: currentUserId // Automatically set the user_profile field with current user ID
      };

      if (editingProblem) {
        const updatePayload: TablesUpdate<'problemes_et_solutions'> = {
            ...dbPayload,
            // user_profile should not be updated generally
        };
        const { error } = await supabase
          .from('problemes_et_solutions')
          .update(updatePayload)
          .eq('id', editingProblem.id);
          
        if (error) throw error;
      } else {
        const insertPayload: TablesInsert<'problemes_et_solutions'> = {
            ...dbPayload,
        };
        const { error } = await supabase
          .from('problemes_et_solutions')
          .insert(insertPayload);
          
        if (error) throw error;
      }
    },
    onSuccess: () => { // Removed result parameter as mutationFn returns void
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast({
        title: editingProblem ? "Problème modifié !" : "Problème ajouté !",
        description: editingProblem 
          ? "Les modifications ont été enregistrées avec succès." 
          : "Le nouveau problème et sa solution ont été créés avec succès.",
      });
      setDialogOpen(false);
      setEditingProblem(null);
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

  // Delete problem mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('problemes_et_solutions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => { // Removed id parameter
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast({
        title: "Problème supprimé",
        description: "Le problème et sa solution ont été supprimés avec succès.",
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
      problem: "",
      solution: "",
      tags: "",
      category: "",
    },
  });

  const handleDeleteProblem = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleEditProblem = (problem: ProblemDisplay) => {
    setEditingProblem(problem);
    form.reset({
      title: problem.title,
      problem: problem.problem, // 'problem' in display maps to 'Description' in DB
      solution: problem.solution,
      tags: problem.tags.join(", "),
      category: problem.category,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
     if (!user?.id) {
        toast({ title: "Erreur", description: "Vous devez être connecté pour effectuer cette action.", variant: "destructive" });
        return;
    }
    mutation.mutate({ ...values, userId: user.id });
  };

  const handleAddNew = () => {
    if (!user) {
      toast({ title: "Non autorisé", description: "Veuillez vous connecter pour ajouter un problème.", variant: "destructive" });
      return;
    }
    setEditingProblem(null);
    form.reset();
    setDialogOpen(true);
  };

  // Get all unique categories
  const categories = ["all", ...Array.from(new Set(problems.map((problem) => problem.category)))];

  // Filter problems by search query and category
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === "all" || problem.category === activeCategory;

    return matchesSearch && matchesCategory;
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
                  <h1 className="text-3xl font-bold tracking-tight">Problèmes & Solutions</h1>
                  <p className="text-muted-foreground">
                    Recensez les problèmes fréquents et leurs solutions
                  </p>
                </div>
                <Button onClick={handleAddNew} className="mt-4 sm:mt-0">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un problème
                </Button>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un problème..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {!isLoading && (
                    <Tabs
                      defaultValue="all"
                      className="w-full sm:w-auto"
                      value={activeCategory}
                      onValueChange={setActiveCategory}
                    >
                      <TabsList className="w-full sm:w-auto">
                        {categories.map((category) => (
                          <TabsTrigger key={category} value={category} className="capitalize">
                            {category === "all" ? "Tous" : category}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Chargement des problèmes...</span>
                </div>
              ) : filteredProblems.length > 0 ? (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                  {filteredProblems.map((problem) => (
                    <Card key={problem.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base md:text-xl">{problem.title}</CardTitle>
                            <CardDescription className="flex flex-wrap gap-1.5 mt-1">
                              {problem.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px]">
                                  {tag}
                                </Badge>
                              ))}
                            </CardDescription>
                          </div>
                          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                            <HelpCircle className="h-4 w-4" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium">Problème:</h4>
                            <p className="text-xs md:text-sm mt-1">{problem.problem}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Solution:</h4>
                            <p className="text-xs md:text-sm mt-1 whitespace-pre-line">{problem.solution}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/50 px-3 py-2 md:px-6 md:py-3">
                        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[10px] md:text-xs">Mis à jour le {new Date(problem.updated_at).toLocaleDateString()}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="capitalize truncate text-[10px] md:text-xs">{problem.category}</span>
                          </div>
                          <div className="flex gap-1 md:gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 md:h-7 md:w-7"
                              onClick={() => handleEditProblem(problem)}
                              disabled={mutation.isPending || deleteMutation.isPending}
                            >
                              <Edit className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 md:h-7 md:w-7 text-destructive"
                              onClick={() => handleDeleteProblem(problem.id)}
                              disabled={deleteMutation.isPending || mutation.isPending}
                            >
                              {deleteMutation.isPending && deleteMutation.variables === problem.id ? 
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
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  {searchQuery ? (
                    <>
                      <h3 className="mt-4 text-lg font-semibold">Aucun résultat</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Aucun problème ne correspond à votre recherche.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="mt-4 text-lg font-semibold">Aucun problème</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {activeCategory === "all" 
                          ? "Vous n'avez pas encore ajouté de problèmes et solutions."
                          : `Aucun problème dans la catégorie "${activeCategory}".`}
                      </p>
                      <Button onClick={handleAddNew} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un problème
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
              {editingProblem ? "Modifier le problème" : "Ajouter un nouveau problème"}
            </DialogTitle>
            <DialogDescription>
              {editingProblem
                ? "Modifiez le problème et sa solution ci-dessous"
                : "Ajoutez un nouveau problème fréquent et sa solution"}
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
                      <Input placeholder="ex: Problème de connexion" {...field} />
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
                      <Input placeholder="ex: Compte, Paris, Paiement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="problem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description du problème</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez le problème de façon claire..."
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
                name="solution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solution</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Détaillez la solution étape par étape..."
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

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: connexion, authentification, mot de passe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Séparez les tags par des virgules
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
                      {editingProblem ? "Enregistrer les modifications" : "Ajouter le problème"}
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

export default Problems;
