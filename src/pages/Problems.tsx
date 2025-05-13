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
import { Plus, Edit, Trash2, Check, HelpCircle, Search, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  problem: z.string().min(10, "La description du problème doit contenir au moins 10 caractères"),
  solution: z.string().min(10, "La solution doit contenir au moins 10 caractères"),
  tags: z.string(),
  category: z.string().min(1, "La catégorie est requise"),
});

// Interface pour les données brutes de la base de données
interface DbProblem {
  id: number;
  Problèmes: string | null;
  Solutions: string | null;
  user_id: string | null;
  created_at: string;
  category: string | null;
  tags: string | null;
}

// Interface pour l'affichage et la manipulation
interface ProblemDisplay {
  id: number;
  title: string;
  problem: string;
  solution: string;
  tags: string[];
  category: string;
  updated_at: string;
}

const Problems = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemDisplay | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch problems with React Query
  const { data: problemsData = [], isLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('problèmes_et_solutions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DbProblem[];
    }
  });

  // Convert DB data to our display format
  const problems: ProblemDisplay[] = problemsData.map(item => {
    // Essayons d'extraire un titre et une catégorie du problème
    const problemText = item.Problèmes || "Problème sans titre";
    let title = problemText.split('\n')[0].substring(0, 50); // Première ligne comme titre
    if (title.length >= 50) title += '...';
    
    return {
      id: item.id,
      title: title,
      problem: item.Problèmes || "",
      solution: item.Solutions || "",
      tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],  // Utiliser la colonne tags si elle existe
      category: item.category || "Général", // Utiliser la colonne category si elle existe
      updated_at: item.created_at
    };
  });

  // Add or update problem mutation
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (editingProblem) {
        const { error } = await supabase
          .from('problèmes_et_solutions')
          .update({
            Problèmes: values.problem,
            Solutions: values.solution,
            category: values.category,
            tags: values.tags
          })
          .eq('id', editingProblem.id);
          
        if (error) throw error;
        return { action: 'update', values };
      } else {
        const { error } = await supabase
          .from('problèmes_et_solutions')
          .insert({
            Problèmes: values.problem,
            Solutions: values.solution,
            category: values.category,
            tags: values.tags
          });
          
        if (error) throw error;
        return { action: 'insert', values };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast({
        title: result.action === 'update' ? "Problème modifié !" : "Problème ajouté !",
        description: result.action === 'update' 
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
        .from('problèmes_et_solutions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
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
      problem: problem.problem,
      solution: problem.solution,
      tags: problem.tags.join(", "),
      category: problem.category,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const handleAddNew = () => {
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
                            {category}
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
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredProblems.map((problem) => (
                    <Card key={problem.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{problem.title}</CardTitle>
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
                            <p className="text-sm mt-1">{problem.problem}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Solution:</h4>
                            <p className="text-sm mt-1 whitespace-pre-line">{problem.solution}</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/50 px-6 py-3">
                        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Mis à jour le {new Date(problem.updated_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="capitalize">{problem.category}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditProblem(problem)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteProblem(problem.id)}
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
                        Vous n'avez pas encore ajouté de problèmes et solutions.
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
