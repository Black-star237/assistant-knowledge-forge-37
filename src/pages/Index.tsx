
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FileText, Bookmark, HelpCircle, Info, ArrowRight, MessageSquare } from "lucide-react";

const Index = () => {
  return (
    <SidebarProvider defaultCollapsed={false} collapsedWidth={70}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto p-4 sm:p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                <p className="text-muted-foreground">
                  Bienvenue sur votre panneau de configuration d'assistant WhatsApp
                </p>
              </div>

              <section className="mb-8">
                <StatsOverview />
              </section>
              
              <section className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Activité récente</h2>
                <div className="rounded-xl border p-6 gradient-card">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-assistant flex items-center justify-center shrink-0">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">Votre assistant est actif</h3>
                      <p className="text-sm text-muted-foreground">
                        Il a répondu à <span className="font-medium">28 messages</span> ces dernières 24 heures
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2 rounded-lg border p-4 bg-background">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">24</span> conversations réussies
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border p-4 bg-background">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">3</span> conversations transférées
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border p-4 bg-background">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">1</span> conversations échouées
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border p-4 bg-background">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">5</span> nouveaux clients
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold">Gestion de l'assistant</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <DashboardCard
                    title="Coupons"
                    description="Paris disponibles pour vos clients"
                    icon={<Bookmark className="h-4 w-4" />}
                    footerAction={{ label: "Gérer les coupons", href: "/coupons" }}
                  >
                    <div className="space-y-3">
                      <p className="text-sm">
                        Ajoutez et gérez les coupons de paris que votre assistant pourra partager avec vos clients.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        12 coupons actifs • Dernier ajout il y a 2 jours
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard
                    title="Procédures"
                    description="Guides pour vos clients"
                    icon={<FileText className="h-4 w-4" />}
                    footerAction={{ label: "Gérer les procédures", href: "/procedures" }}
                  >
                    <div className="space-y-3">
                      <p className="text-sm">
                        Créez des procédures étape par étape que votre assistant utilisera pour guider vos clients.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        8 procédures • Dernière mise à jour il y a 3 jours
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard
                    title="Problèmes & Solutions"
                    description="FAQ et dépannage"
                    icon={<HelpCircle className="h-4 w-4" />}
                    footerAction={{ label: "Gérer les solutions", href: "/problems" }}
                  >
                    <div className="space-y-3">
                      <p className="text-sm">
                        Recensez les problèmes fréquents et leurs solutions pour que votre assistant puisse aider efficacement.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        15 problèmes répertoriés • 3 ajouts récents
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard
                    title="Informations Bot"
                    description="Configuration de l'assistant"
                    icon={<Info className="h-4 w-4" />}
                    footerAction={{ label: "Gérer les informations", href: "/bot-info" }}
                  >
                    <div className="space-y-3">
                      <p className="text-sm">
                        Ajoutez des informations supplémentaires comme des codes promos, liens et exemples de conversations.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        6 infos • Dernière mise à jour hier
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
