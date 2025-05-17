
import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FileText, Bookmark, HelpCircle, Info, MessageSquare, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Define a type for valid table names we are querying
type ValidTableName = Extract<keyof Database['public']['Tables'], 'coupons' | 'procedures' | 'problemes_et_solutions' | 'informations_bot'>;

interface StatSummary {
  count: number;
  latestCreatedAt: string | null;
}

const fetchStatSummary = async (tableName: ValidTableName): Promise<StatSummary> => {
  const { count, error: countError } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error(`Error fetching count for ${tableName}:`, countError);
    // Fallback or rethrow, for now, log and return partial if possible
  }

  const { data: latestEntry, error: latestEntryError } = await supabase
    .from(tableName)
    .select('created_at') // We are only selecting 'created_at'
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ created_at: string }>(); // Explicitly type the expected shape of selected data

  if (latestEntryError) {
    console.error(`Error fetching latest entry for ${tableName}:`, latestEntryError);
  }
  
  return {
    count: count ?? 0,
    latestCreatedAt: latestEntry?.created_at ?? null,
  };
};

const formatCardFooterText = (itemType: string, data?: StatSummary, isLoading?: boolean) => {
  if (isLoading) {
    return <span className="flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1" />Chargement...</span>;
  }
  if (!data || data.count === 0) {
    return `Aucun ${itemType} pour le moment.`;
  }
  let text = `${data.count} ${itemType}${data.count > 1 ? 's' : ''}`;
  if (data.latestCreatedAt) {
    try {
      text += ` • Dernier ajout ${formatDistanceToNow(new Date(data.latestCreatedAt), { addSuffix: true, locale: fr })}`;
    } catch (e) {
      console.error("Error formatting date for card footer:", data.latestCreatedAt, e);
      text += ` • Date invalide`;
    }
  }
  return text;
};

const Index = () => {
  const { data: dashboardData, isLoading: isLoadingDashboardData } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Ensure table names match ValidTableName types
      const [coupons, procedures, problems, botInfo] = await Promise.all([
        fetchStatSummary('coupons'),
        fetchStatSummary('procedures'), 
        fetchStatSummary('problemes_et_solutions'),
        fetchStatSummary('informations_bot'),
      ]);
      return { coupons, procedures, problems, botInfo };
    }
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-background mesh-bg">
            <div className="container mx-auto p-4 sm:p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                <p className="text-muted-foreground">
                  Bienvenue sur votre panneau de configuration d'assistant WhatsApp
                </p>
              </div>

              <section className="mb-8">
                <StatsOverview data={dashboardData ?? null} isLoading={isLoadingDashboardData} />
              </section>
              
              <section className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Activité récente</h2>
                <div className="rounded-xl border border-border/40 p-6 glassmorphism">
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
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 transparent-grid">
                      <div className="flex items-center gap-2 rounded-lg border border-border/30 p-4 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">24</span> conversations réussies
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border/30 p-4 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">3</span> conversations transférées
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border/30 p-4 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">1</span> conversations échouées
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-border/30 p-4 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
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
                <div className="grid gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 transparent-grid">
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
                        {formatCardFooterText("coupon", dashboardData?.coupons, isLoadingDashboardData)}
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
                        {formatCardFooterText("procédure", dashboardData?.procedures, isLoadingDashboardData)}
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
                        {formatCardFooterText("problème", dashboardData?.problems, isLoadingDashboardData)}
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
                        {formatCardFooterText("info", dashboardData?.botInfo, isLoadingDashboardData)}
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
