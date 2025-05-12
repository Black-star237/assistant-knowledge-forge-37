
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
import { Plus, Edit, Trash2, Check, HelpCircle, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  problem: z.string().min(10, "La description du problème doit contenir au moins 10 caractères"),
  solution: z.string().min(10, "La solution doit contenir au moins 10 caractères"),
  tags: z.string(),
  category: z.string().min(1, "La catégorie est requise"),
});

const Problems = () => {
  const { toast } = useToast();
  const [problems, setProblems] = useState([
    {
      id: 1,
      title: "Problème de connexion",
      problem: "Je ne peux pas me connecter à mon compte malgré plusieurs tentatives.",
      solution: "1. Vérifiez que vous utilisez la bonne adresse email\n2. Utilisez l'option 'Mot de passe oublié'\n3. Assurez-vous que votre compte n'est pas bloqué\n4. Essayez de vous connecter depuis un autre appareil",
      category: "Compte",
      tags: ["connexion", "authentification"],
      updatedAt: "2025-05-10",
    },
    {
      id: 2,
      title: "Pari non validé",
      problem: "J'ai placé un pari mais il n'apparaît pas dans mon historique.",
      solution: "1. Vérifiez vos notifications pour confirmer que le pari a été placé\n2. Attendez quelques minutes car le système peut mettre du temps à se mettre à jour\n3. Vérifiez que votre compte a été débité\n4. Si le problème persiste, contactez le service client avec votre ID de transaction",
      category: "Paris",
      tags: ["pari", "validation", "historique"],
      updatedAt: "2025-05-11",
    },
    {
      id: 3,
      title: "Retrait bloqué",
      problem: "Mon retrait est en attente depuis plus de 48h.",
      solution: "1. Vérifiez que vous avez complété la vérification d'identité\n2. Assurez-vous que votre méthode de paiement est valide\n3. Certaines méthodes de retrait peuvent prendre jusqu'à 5 jours ouvrables\n4. Si le statut est 'En révision', votre retrait est en cours d'examen par notre équipe",
      category: "Paiement",
      tags: ["retrait", "paiement", "délai"],
      updatedAt: "2025-05-09",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

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
    setProblems(problems.filter((problem) => problem.id !== id));
    toast({
      title: "Problème supprimé",
      description: "Le problème et sa solution ont été supprimés avec succès.",
    });
  };

  const handleEditProblem = (problem: any) => {
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
    const processedTags = values.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    if (editingProblem) {
      setProblems(
        problems.map((problem) =>
          problem.id === editingProblem.id
            ? {
                ...problem,
                title: values.title,
                problem: values.problem,
                solution: values.solution,
                tags: processedTags,
                category: values.category,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : problem
        )
      );
      toast({
        title: "Problème modifié !",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    } else {
      const newProblem = {
        id: Math.max(0, ...problems.map((p) => p.id)) + 1,
        title: values.title,
        problem: values.problem,
        solution: values.solution,
        tags: processedTags,
        category: values.category,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setProblems([newProblem, ...problems]);
      toast({
        title: "Problème ajouté !",
        description: "Le nouveau problème et sa solution ont été créés avec succès.",
      });
    }
    setDialogOpen(false);
    setEditingProblem(null);
    form.reset();
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
    <SidebarProvider defaultCollapsed={false} collapsedWidth={70}>
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
                </div>
              </div>

              {filteredProblems.length > 0 ? (
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
                            <span>Mis à jour le {problem.updatedAt}</span>
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
                <Button type="submit">
                  <Check className="mr-2 h-4 w-4" />
                  {editingProblem ? "Enregistrer les modifications" : "Ajouter le problème"}
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
