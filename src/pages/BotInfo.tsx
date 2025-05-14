import React, { useState, useEffect, useMemo } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Info, 
  Link as LinkIconLucide,
  Tag, 
  MessageSquare,
  Clipboard, 
  ExternalLink,
  Loader2 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables, Database } from "@/integrations/supabase/types"; // Ensure Database is imported
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Define the structure for items displayed in the UI
interface BotInfoDisplayItem {
  id: number; 
  title: string;
  content: string;
  type: 'promo' | 'link' | 'example' | 'rules';
  createdAt: string; 
  dbCreatedAt: string; 
  user_profile?: string | null; 
}

// Schema for the form (category removed, template type removed, info type renamed to rules)
const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  type: z.enum(["promo", "link", "example", "rules"], { // Updated types
    required_error: "Le type est requis",
  }),
});

type FormData = z.infer<typeof formSchema>;

// Helper function to map Supabase rows to BotInfoDisplayItem
const mapToDisplayItem = (
  item: Tables<'code_promo'> | Tables<'liens_utiles'> | Tables<'exemples_de_discussions'> | Tables<'regles'>,
  type: BotInfoDisplayItem['type']
): BotInfoDisplayItem => {
  let title = '';
  let content = '';

  // All relevant tables have 'titre' except 'exemples_de_discussions' which might use it for a general topic
  // and 'liens_utiles' after our migration.
  if ('titre' in item && item.titre) {
    title = item.titre;
  }

  if (type === 'example' && 'discussion' in item && item.discussion) {
    content = item.discussion;
  } else if ('contenu' in item && item.contenu) {
    content = item.contenu;
  }
  
  // For links, title comes from the new 'titre' column.
  // If 'titre' is somehow null/empty for a link (e.g. old data before migration or not set),
  // we use the URL (content) as a fallback for title.
  if (type === 'link' && !title && 'contenu' in item && item.contenu) {
     title = item.contenu; 
  }

  return {
    id: item.id,
    title: title,
    content: content,
    type: type,
    createdAt: format(new Date(item.created_at), "d MMMM yyyy", { locale: fr }),
    dbCreatedAt: item.created_at,
    user_profile: item.user_profile, // Corrected: Directly use item.user_profile
  };
};

const BotInfo = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<BotInfoDisplayItem | null>(null);
  const [activeType, setActiveType] = useState<string>("all"); 

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "promo", 
    },
  });

  const userId = user?.id;

  // Fetching functions for each type
  const fetchPromoCodes = async (currentUserId: string) => {
    const { data, error } = await supabase
      .from("code_promo")
      .select("*")
      .eq("user_profile", currentUserId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(item => mapToDisplayItem(item, 'promo'));
  };

  const fetchLinks = async (currentUserId: string) => {
    const { data, error } = await supabase
      .from("liens_utiles")
      .select("*")
      .eq("user_profile", currentUserId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(item => mapToDisplayItem(item, 'link'));
  };

  const fetchExamples = async (currentUserId: string) => {
    const { data, error } = await supabase
      .from("exemples_de_discussions")
      .select("*")
      .eq("user_profile", currentUserId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(item => mapToDisplayItem(item, 'example'));
  };

  const fetchRules = async (currentUserId: string) => {
    const { data, error } = await supabase
      .from("regles")
      .select("*")
      .eq("user_profile", currentUserId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(item => mapToDisplayItem(item, 'rules'));
  };

  const { data: promoData, isLoading: isLoadingPromo } = useQuery({
    queryKey: ["promoCodes", userId],
    queryFn: () => fetchPromoCodes(userId!),
    enabled: !!userId,
  });
  const { data: linkData, isLoading: isLoadingLinks } = useQuery({
    queryKey: ["links", userId],
    queryFn: () => fetchLinks(userId!),
    enabled: !!userId,
  });
  const { data: exampleData, isLoading: isLoadingExamples } = useQuery({
    queryKey: ["examples", userId],
    queryFn: () => fetchExamples(userId!),
    enabled: !!userId,
  });
  const { data: rulesData, isLoading: isLoadingRules } = useQuery({
    queryKey: ["rules", userId],
    queryFn: () => fetchRules(userId!),
    enabled: !!userId,
  });

  const isLoadingData = isLoadingPromo || isLoadingLinks || isLoadingExamples || isLoadingRules || authLoading;

  const allBotInfos: BotInfoDisplayItem[] = useMemo(() => {
    return [
      ...(promoData || []),
      ...(linkData || []),
      ...(exampleData || []),
      ...(rulesData || []),
    ].sort((a, b) => new Date(b.dbCreatedAt).getTime() - new Date(a.dbCreatedAt).getTime());
  }, [promoData, linkData, exampleData, rulesData]);


  const addMutation = useMutation<void, Error, { values: FormData; userId: string }>({
    mutationFn: async ({ values, userId: currentUserId }) => { // Added mutationFn key
      let tableName: keyof Database['public']['Tables'] | '' = '';
      let payload: any = {};

      switch (values.type) {
        case "promo":
          tableName = "code_promo";
          payload = { titre: values.title, contenu: values.content, user_profile: currentUserId };
          break;
        case "link":
          tableName = "liens_utiles";
          payload = { titre: values.title, contenu: values.content, user_profile: currentUserId };
          break;
        case "example":
          tableName = "exemples_de_discussions";
          payload = { titre: values.title, discussion: values.content, user_profile: currentUserId };
          break;
        case "rules":
          tableName = "regles";
          payload = { titre: values.title, contenu: values.content, user_profile: currentUserId };
          break;
      }
      if (!tableName) throw new Error("Invalid type"); // This will refine tableName type for Supabase call
      
      const { error } = await supabase.from(tableName).insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes", userId] });
      queryClient.invalidateQueries({ queryKey: ["links", userId] });
      queryClient.invalidateQueries({ queryKey: ["examples", userId] });
      queryClient.invalidateQueries({ queryKey: ["rules", userId] });
      toast({ title: "Information ajoutée !", description: "La nouvelle information a été créée avec succès." });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const editMutation = useMutation<void, Error, { values: FormData; editingInfo: BotInfoDisplayItem; userId: string }>({
    mutationFn: async ({ values, editingInfo: currentEditingInfo, userId: currentUserId }) => { // Added mutationFn key
      let tableName: keyof Database['public']['Tables'] | '' = '';
      let payload: any = {};

      switch (currentEditingInfo.type) { 
        case "promo":
          tableName = "code_promo";
          payload = { titre: values.title, contenu: values.content };
          break;
        case "link":
          tableName = "liens_utiles";
          payload = { titre: values.title, contenu: values.content };
          break;
        case "example":
          tableName = "exemples_de_discussions";
          payload = { titre: values.title, discussion: values.content };
          break;
        case "rules":
          tableName = "regles";
          payload = { titre: values.title, contenu: values.content };
          break;
      }
      if (!tableName) throw new Error("Invalid type for editing"); // Refines tableName type

      const { error } = await supabase
        .from(tableName) 
        .update(payload)
        .eq("id", currentEditingInfo.id)
        .eq("user_profile", currentUserId); 
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes", userId] });
      queryClient.invalidateQueries({ queryKey: ["links", userId] });
      queryClient.invalidateQueries({ queryKey: ["examples", userId] });
      queryClient.invalidateQueries({ queryKey: ["rules", userId] });
      toast({ title: "Information modifiée !", description: "Les modifications ont été enregistrées." });
      setDialogOpen(false);
      setEditingInfo(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation<void, Error, { infoToDelete: BotInfoDisplayItem; userId: string }>({
    mutationFn: async ({ infoToDelete, userId: currentUserId }) => { // Added mutationFn key
      let tableName: keyof Database['public']['Tables'] | '' = '';
      switch (infoToDelete.type) {
        case "promo": tableName = "code_promo"; break;
        case "link": tableName = "liens_utiles"; break;
        case "example": tableName = "exemples_de_discussions"; break;
        case "rules": tableName = "regles"; break;
      }
      if (!tableName) throw new Error("Invalid type for deletion"); // Refines tableName type

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", infoToDelete.id)
        .eq("user_profile", currentUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes", userId] });
      queryClient.invalidateQueries({ queryKey: ["links", userId] });
      queryClient.invalidateQueries({ queryKey: ["examples", userId] });
      queryClient.invalidateQueries({ queryKey: ["rules", userId] });
      toast({ title: "Information supprimée", description: "L'information a été supprimée avec succès." });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const handleDeleteInfo = (info: BotInfoDisplayItem) => {
    if (!userId) return;
    deleteMutation.mutate({ infoToDelete: info, userId });
  };

  const handleEditInfo = (info: BotInfoDisplayItem) => {
    setEditingInfo(info);
    form.reset({
      title: info.title,
      content: info.content,
      type: info.type,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormData) => {
    if (!userId) {
      toast({ title: "Erreur", description: "Utilisateur non authentifié.", variant: "destructive" });
      return;
    }
    if (editingInfo) {
      editMutation.mutate({ values, editingInfo, userId });
    } else {
      addMutation.mutate({ values, userId });
    }
  };

  const handleAddNew = () => {
    setEditingInfo(null);
    form.reset({
      title: "",
      content: "",
      type: "promo", 
    });
    setDialogOpen(true);
  };

  // ... keep existing code (handleCopyContent, getTypeIcon)
  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Contenu copié !",
      description: "Le contenu a été copié dans le presse-papiers.",
    });
  };

  const getTypeIcon = (type: BotInfoDisplayItem['type']) => {
    switch (type) {
      case "promo":
        return <Tag className="h-4 w-4" />;
      case "link":
        return <LinkIconLucide className="h-4 w-4" />;
      case "example":
        return <MessageSquare className="h-4 w-4" />;
      case "rules":
      default: // Default to rules icon if type is somehow unexpected
        return <Info className="h-4 w-4" />;
    }
  };

  const filteredBotInfos = allBotInfos.filter(
    (info) => activeType === "all" || info.type === activeType
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
                  <h1 className="text-3xl font-bold tracking-tight">Informations Bot</h1>
                  <p className="text-muted-foreground">
                    Gérez les informations complémentaires pour votre assistant.
                  </p>
                </div>
                <Button onClick={handleAddNew} className="mt-4 sm:mt-0" disabled={!userId || authLoading}>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une information
                </Button>
              </div>

              <Tabs
                defaultValue="all"
                value={activeType}
                onValueChange={setActiveType}
                className="mb-6"
              >
                <TabsList>
                  <TabsTrigger value="all">Tous</TabsTrigger>
                  <TabsTrigger value="promo">Codes promo</TabsTrigger>
                  <TabsTrigger value="link">Liens</TabsTrigger>
                  <TabsTrigger value="example">Exemples</TabsTrigger>
                  <TabsTrigger value="rules">Règles</TabsTrigger> {/* Renamed from Informations */}
                </TabsList>
              </Tabs>

              {isLoadingData && (
                 <div className="flex justify-center items-center h-64">
                   <Loader2 className="h-12 w-12 animate-spin text-primary" />
                 </div>
              )}

              {!isLoadingData && filteredBotInfos.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredBotInfos.map((info) => (
                    <Card key={`${info.type}-${info.id}`} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{info.title}</CardTitle>
                          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                            {getTypeIcon(info.type)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="relative rounded-md border bg-muted/50 p-3">
                          <div className="absolute right-2 top-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyContent(info.content)}
                            >
                              <Clipboard className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {info.type === "link" ? (
                            <a
                              href={info.content.startsWith('http') ? info.content : `//${info.content}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-primary underline"
                            >
                              {info.content}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : info.type === "example" || info.content.includes("\n") ? (
                            <pre className="whitespace-pre-line text-sm font-sans">
                              {info.content}
                            </pre>
                          ) : (
                            <p className="text-sm">{info.content}</p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/50 px-6 py-3">
                        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                          <span>Créé le {info.createdAt}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditInfo(info)}
                              disabled={deleteMutation.isPending || editMutation.isPending || addMutation.isPending}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDeleteInfo(info)}
                              disabled={deleteMutation.isPending || editMutation.isPending || addMutation.isPending}
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
                !isLoadingData && ( 
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <div className="rounded-full bg-primary/10 p-4 text-primary">
                      <Info className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">Aucune information</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {activeType === "all"
                        ? "Vous n'avez pas encore ajouté d'informations."
                        : `Vous n'avez pas encore ajouté d'informations de type "${activeType}".`}
                    </p>
                    <Button onClick={handleAddNew} className="mt-4" disabled={!userId || authLoading}>
                      <Plus className="mr-2 h-4 w-4" /> Ajouter une information
                    </Button>
                  </div>
                )
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingInfo ? "Modifier l'information" : "Ajouter une nouvelle information"}
            </DialogTitle>
            <DialogDescription>
              {editingInfo
                ? "Modifiez les détails de l'information ci-dessous."
                : "Ajoutez une nouvelle information pour votre assistant."}
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
                      <Input placeholder="ex: Code promo nouveau client" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!!editingInfo} 
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="promo">Code promo</SelectItem>
                        <SelectItem value="link">Lien</SelectItem>
                        <SelectItem value="example">Exemple de conversation</SelectItem>
                        <SelectItem value="rules">Règle</SelectItem> {/* Renamed from info */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Entrez le contenu de l'information..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={addMutation.isPending || editMutation.isPending}>
                  {(addMutation.isPending || editMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Check className="mr-2 h-4 w-4" />
                  {editingInfo ? "Enregistrer les modifications" : "Ajouter l'information"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default BotInfo;
