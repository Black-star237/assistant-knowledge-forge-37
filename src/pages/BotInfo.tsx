
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Info, 
  Link as LinkIcon, 
  Tag, 
  MessageSquare,
  Clipboard, 
  ExternalLink 
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

const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  type: z.string().min(1, "Le type est requis"),
  category: z.string().min(1, "La catégorie est requise"),
});

const BotInfo = () => {
  const { toast } = useToast();
  const [botInfos, setBotInfos] = useState([
    {
      id: 1,
      title: "Code promo nouveau client",
      content: "BIENVENUE10 - 10% de réduction sur le premier pari",
      type: "promo",
      category: "Promotions",
      updatedAt: "2025-05-11",
    },
    {
      id: 2,
      title: "Site officiel",
      content: "https://example.com/paris",
      type: "link",
      category: "Liens",
      updatedAt: "2025-05-10",
    },
    {
      id: 3,
      title: "Message d'accueil",
      content: "Bonjour ! Je suis votre assistant Bookie. Comment puis-je vous aider aujourd'hui ? Je peux vous fournir des coupons, vous guider dans des procédures ou répondre à vos questions.",
      type: "template",
      category: "Messages",
      updatedAt: "2025-05-09",
    },
    {
      id: 4,
      title: "Service client",
      content: "Email: support@example.com\nTéléphone: +33 1 23 45 67 89\nHoraires: Lun-Dim, 8h-00h",
      type: "info",
      category: "Contacts",
      updatedAt: "2025-05-08",
    },
    {
      id: 5,
      title: "Politique de bonus",
      content: "Nous offrons un bonus de 100% sur votre premier dépôt jusqu'à 100€. Les conditions de mise sont de 3x le montant du bonus.",
      type: "info",
      category: "Règles",
      updatedAt: "2025-05-08",
    },
    {
      id: 6,
      title: "Conversation type - Demande de coupon",
      content: "Client: Bonjour, avez-vous un coupon pour les matchs de ce weekend?\n\nAssistant: Bonjour ! Bien sûr, voici notre coupon combiné football pour le weekend : PSG-Marseille, Bayern-Dortmund, Real Madrid-Barcelona avec une cote de 5.75. Utilisez le code FOOT-2023-1. Souhaitez-vous d'autres recommandations ?",
      type: "example",
      category: "Exemples",
      updatedAt: "2025-05-07",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<any>(null);
  const [activeType, setActiveType] = useState("all");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "",
      category: "",
    },
  });

  const handleDeleteInfo = (id: number) => {
    setBotInfos(botInfos.filter((info) => info.id !== id));
    toast({
      title: "Information supprimée",
      description: "L'information a été supprimée avec succès.",
    });
  };

  const handleEditInfo = (info: any) => {
    setEditingInfo(info);
    form.reset({
      title: info.title,
      content: info.content,
      type: info.type,
      category: info.category,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingInfo) {
      setBotInfos(
        botInfos.map((info) =>
          info.id === editingInfo.id
            ? {
                ...info,
                title: values.title,
                content: values.content,
                type: values.type,
                category: values.category,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : info
        )
      );
      toast({
        title: "Information modifiée !",
        description: "Les modifications ont été enregistrées avec succès.",
      });
    } else {
      const newInfo = {
        id: Math.max(0, ...botInfos.map((i) => i.id)) + 1,
        title: values.title,
        content: values.content,
        type: values.type,
        category: values.category,
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setBotInfos([newInfo, ...botInfos]);
      toast({
        title: "Information ajoutée !",
        description: "La nouvelle information a été créée avec succès.",
      });
    }
    setDialogOpen(false);
    setEditingInfo(null);
    form.reset();
  };

  const handleAddNew = () => {
    setEditingInfo(null);
    form.reset({
      title: "",
      content: "",
      type: "info",
      category: "",
    });
    setDialogOpen(true);
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Contenu copié !",
      description: "Le contenu a été copié dans le presse-papiers.",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "promo":
        return <Tag className="h-4 w-4" />;
      case "link":
        return <LinkIcon className="h-4 w-4" />;
      case "template":
        return <MessageSquare className="h-4 w-4" />;
      case "example":
        return <MessageSquare className="h-4 w-4" />;
      case "info":
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Filter bot infos by type
  const filteredBotInfos = botInfos.filter(
    (info) => activeType === "all" || info.type === activeType
  );

  // Group bot infos by category
  const botInfosByCategory: Record<string, typeof botInfos> = {};
  filteredBotInfos.forEach((info) => {
    if (!botInfosByCategory[info.category]) {
      botInfosByCategory[info.category] = [];
    }
    botInfosByCategory[info.category].push(info);
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
                  <h1 className="text-3xl font-bold tracking-tight">Informations Bot</h1>
                  <p className="text-muted-foreground">
                    Ajoutez des informations complémentaires pour votre assistant
                  </p>
                </div>
                <Button onClick={handleAddNew} className="mt-4 sm:mt-0">
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
                  <TabsTrigger value="template">Templates</TabsTrigger>
                  <TabsTrigger value="example">Exemples</TabsTrigger>
                  <TabsTrigger value="info">Informations</TabsTrigger>
                </TabsList>
              </Tabs>

              {Object.keys(botInfosByCategory).length > 0 ? (
                Object.entries(botInfosByCategory).map(([category, categoryBotInfos]) => (
                  <div key={category} className="mb-6">
                    <h2 className="mb-3 text-lg font-semibold">{category}</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {categoryBotInfos.map((info) => (
                        <Card key={info.id} className="overflow-hidden">
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
                                  href={info.content}
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
                              <span>Mis à jour le {info.updatedAt}</span>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEditInfo(info)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDeleteInfo(info.id)}
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
                    <Info className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Aucune information</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {activeType === "all"
                      ? "Vous n'avez pas encore ajouté d'informations complémentaires."
                      : `Vous n'avez pas encore ajouté d'informations de type "${activeType}".`}
                  </p>
                  <Button onClick={handleAddNew} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter une information
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
              {editingInfo ? "Modifier l'information" : "Ajouter une nouvelle information"}
            </DialogTitle>
            <DialogDescription>
              {editingInfo
                ? "Modifiez les détails de l'information ci-dessous"
                : "Ajoutez une nouvelle information pour votre assistant"}
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

              <div className="grid grid-cols-2 gap-4">
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="promo">Code promo</SelectItem>
                          <SelectItem value="link">Lien</SelectItem>
                          <SelectItem value="template">Template de message</SelectItem>
                          <SelectItem value="example">Exemple de conversation</SelectItem>
                          <SelectItem value="info">Information générale</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="ex: Promotions, Liens, Messages" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                <Button type="submit">
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
