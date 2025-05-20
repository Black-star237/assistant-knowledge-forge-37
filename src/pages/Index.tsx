import { AppSidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { FileText, Bookmark, HelpCircle, Info, MessageSquare, Loader2, CircleCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatDistanceToNow, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

// Define a type for valid table names we are querying
type ValidTableName = Extract<keyof Database['public']['Tables'], 'coupons' | 'procedures' | 'problemes_et_solutions' | 'informations_bot' | 'code_promo' | 'liens_utiles' | 'regles' | 'messages_whatsapp' | 'contacts'>;
interface StatSummary {
  count: number;
  latestCreatedAt: string | null;
}
const fetchStatSummary = async (tableName: ValidTableName): Promise<StatSummary> => {
  const {
    count,
    error: countError
  } = await supabase.from(tableName).select('*', {
    count: 'exact',
    head: true
  });
  if (countError) {
    console.error(`Error fetching count for ${tableName}:`, countError);
    // Fallback or rethrow, for now, log and return partial if possible
  }
  const {
    data: latestEntry,
    error: latestEntryError
  } = await supabase.from(tableName).select('created_at') // We are only selecting 'created_at'
  .order('created_at', {
    ascending: false
  }).limit(1).maybeSingle<{
    created_at: string;
  }>(); // Explicitly type the expected shape of selected data

  if (latestEntryError) {
    console.error(`Error fetching latest entry for ${tableName}:`, latestEntryError);
  }
  return {
    count: count ?? 0,
    latestCreatedAt: latestEntry?.created_at ?? null
  };
};

// Nouvelle fonction pour récupérer les statistiques d'activité
const fetchActivityStats = async () => {
  // Messages avec envoyé = true (conversations réussies)
  const {
    count: successfulCount,
    error: successfulError
  } = await supabase.from('messages_whatsapp').select('*', {
    count: 'exact',
    head: true
  }).eq('envoyé', true);
  if (successfulError) console.error("Error fetching successful conversations:", successfulError);

  // Messages avec envoyé = false (conversations en cours)
  const {
    count: inProgressCount,
    error: inProgressError
  } = await supabase.from('messages_whatsapp').select('*', {
    count: 'exact',
    head: true
  }).eq('envoyé', false);
  if (inProgressError) console.error("Error fetching in-progress conversations:", inProgressError);

  // Nouveaux contacts des 7 derniers jours
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const {
    count: newClientsCount,
    error: newClientsError
  } = await supabase.from('contacts').select('*', {
    count: 'exact',
    head: true
  }).gte('created_at', oneWeekAgo.toISOString());
  if (newClientsError) console.error("Error fetching new clients:", newClientsError);
  return {
    successful: successfulCount ?? 0,
    inProgress: inProgressCount ?? 0,
    newClients: newClientsCount ?? 0
  };
};

// Nouvelle fonction pour récupérer les informations bot détaillées
const fetchBotInfoDetails = async () => {
  const {
    count: codePromoCount,
    error: codePromoError
  } = await supabase.from('code_promo').select('*', {
    count: 'exact',
    head: true
  });
  if (codePromoError) console.error("Error fetching code promo count:", codePromoError);
  const {
    count: liensCount,
    error: liensError
  } = await supabase.from('liens_utiles').select('*', {
    count: 'exact',
    head: true
  });
  if (liensError) console.error("Error fetching liens count:", liensError);
  const {
    count: reglesCount,
    error: reglesError
  } = await supabase.from('regles').select('*', {
    count: 'exact',
    head: true
  });
  if (reglesError) console.error("Error fetching regles count:", reglesError);
  return {
    codePromoCount: codePromoCount ?? 0,
    liensCount: liensCount ?? 0,
    reglesCount: reglesCount ?? 0,
    totalCount: (codePromoCount ?? 0) + (liensCount ?? 0) + (reglesCount ?? 0)
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
      text += ` • Dernier ajout ${formatDistanceToNow(new Date(data.latestCreatedAt), {
        addSuffix: true,
        locale: fr
      })}`;
    } catch (e) {
      console.error("Error formatting date for card footer:", data.latestCreatedAt, e);
      text += ` • Date invalide`;
    }
  }
  return text;
};
const Index = () => {
  // Récupération des statistiques du tableau de bord
  const {
    data: dashboardData,
    isLoading: isLoadingDashboardData
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Ensure table names match ValidTableName types
      const [coupons, procedures, problems] = await Promise.all([fetchStatSummary('coupons'), fetchStatSummary('procedures'), fetchStatSummary('problemes_et_solutions')]);

      // Récupération des détails pour informations bot
      const botInfoDetails = await fetchBotInfoDetails();
      return {
        coupons,
        procedures,
        problems,
        botInfo: {
          count: botInfoDetails.totalCount,
          latestCreatedAt: null,
          // Pas utilisé pour ce cas
          codePromoCount: botInfoDetails.codePromoCount,
          liensCount: botInfoDetails.liensCount,
          reglesCount: botInfoDetails.reglesCount
        }
      };
    }
  });

  // Récupération des statistiques d'activité
  const {
    data: activityStats,
    isLoading: isLoadingActivityStats
  } = useQuery({
    queryKey: ['activityStats'],
    queryFn: fetchActivityStats
  });
  return <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-auto bg-background mesh-bg">
            <div className="container mx-auto p-4 sm:p-6 bg-transparent">
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
                <div className="rounded-xl border border-white/20 bg-white dark:bg-black/60 shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-assistant flex items-center justify-center shrink-0">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">Votre assistant est actif</h3>
                      <p className="text-sm text-muted-foreground">
                        Il a répondu à <span className="font-medium">{activityStats?.successful ?? 0} messages</span> ces dernières 24 heures
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 transparent-grid">
                      <div className="flex items-center gap-2 rounded-lg border border-white/20 dark:border-white/10 p-4 bg-white dark:bg-black/40 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">{isLoadingActivityStats ? <Loader2 className="h-3 w-3 inline animate-spin" /> : activityStats?.successful}</span> conversations réussies
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-white/20 dark:border-white/10 p-4 bg-white dark:bg-black/40 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">{isLoadingActivityStats ? <Loader2 className="h-3 w-3 inline animate-spin" /> : activityStats?.inProgress}</span> conversations en cours
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg border border-white/20 dark:border-white/10 p-4 bg-white dark:bg-black/40 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <div className="text-sm">
                          <span className="font-medium">{isLoadingActivityStats ? <Loader2 className="h-3 w-3 inline animate-spin" /> : activityStats?.newClients}</span> nouveaux clients
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-xl font-semibold">Gestion de l'assistant</h2>
                <div className="grid gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-2 transparent-grid">
                  <DashboardCard title="Coupons" description="Paris disponibles pour vos clients" icon={<Bookmark className="h-4 w-4" />} footerAction={{
                  label: "Gérer les coupons",
                  href: "/coupons"
                }}>
                    <div className="space-y-3">
                      <p className="text-sm">
                        Ajoutez et gérez les coupons de paris que votre assistant pourra partager avec vos clients.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {formatCardFooterText("coupon", dashboardData?.coupons, isLoadingDashboardData)}
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard title="Procédures" description="Guides pour vos clients" icon={<FileText className="h-4 w-4" />} footerAction={{
                  label: "Gérer les procédures",
                  href: "/procedures"
                }}>
                    <div className="space-y-3">
                      <p className="text-sm">
                        Créez des procédures étape par étape que votre assistant utilisera pour guider vos clients.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {formatCardFooterText("procédure", dashboardData?.procedures, isLoadingDashboardData)}
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard title="Problèmes & Solutions" description="FAQ et dépannage" icon={<HelpCircle className="h-4 w-4" />} footerAction={{
                  label: "Gérer les solutions",
                  href: "/problems"
                }}>
                    <div className="space-y-3">
                      <p className="text-sm">
                        Recensez les problèmes fréquents et leurs solutions pour que votre assistant puisse aider efficacement.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {formatCardFooterText("problème", dashboardData?.problems, isLoadingDashboardData)}
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard title="Informations Bot" description="Configuration de l'assistant" icon={<Info className="h-4 w-4" />} footerAction={{
                  label: "Gérer les informations",
                  href: "/bot-info"
                }}>
                    <div className="space-y-3">
                      <p className="text-sm">
                        Ajoutez des informations supplémentaires comme des codes promos, liens et exemples de conversations.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {isLoadingDashboardData ? <span className="flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-1" />Chargement...</span> : <>
                            {dashboardData?.botInfo ? <>
                                {dashboardData.botInfo.count} infos • 
                                {dashboardData.botInfo.codePromoCount} codes promo •
                                {dashboardData.botInfo.liensCount} liens •
                                {dashboardData.botInfo.reglesCount} règles
                              </> : "Aucune information"}
                          </>}
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
};
export default Index;
