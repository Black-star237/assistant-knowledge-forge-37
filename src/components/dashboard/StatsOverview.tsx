import { Bookmark, FileText, HelpCircle, Info, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface StatCardData {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  description?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  description,
  isLoading,
}: StatCardData) {
  return (
    <div className="rounded-lg border border-border/40 bg-transparent backdrop-blur-sm p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
      {isLoading ? (
        <div className="mt-2 flex items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <div
                className={`text-xs font-medium ${
                  changeType === "increase"
                    ? "text-green-600 dark:text-green-400"
                    : changeType === "decrease"
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground"
                }`}
              >
                {change}
              </div>
            )}
          </div>
          {description && (
            <div className="mt-1 text-xs text-muted-foreground">{description}</div>
          )}
        </>
      )}
    </div>
  );
}

interface DashboardStatsData {
  coupons: { count: number; latestCreatedAt: string | null };
  procedures: { count: number; latestCreatedAt: string | null };
  problems: { count: number; latestCreatedAt: string | null };
  botInfo: { count: number; latestCreatedAt: string | null };
}

interface StatsOverviewProps {
  data: DashboardStatsData | null;
  isLoading: boolean;
}

export function StatsOverview({ data, isLoading }: StatsOverviewProps) {
  const getChangeText = (latestCreatedAt: string | null) => {
    if (!latestCreatedAt) return "Aucune donnée";
    try {
      return `Dernier: ${formatDistanceToNow(new Date(latestCreatedAt), { addSuffix: true, locale: fr })}`;
    } catch (e) {
      console.error("Error formatting date:", latestCreatedAt, e);
      return "Date invalide";
    }
  };
  
  const stats: StatCardData[] = [
    {
      title: "Coupons",
      value: data?.coupons?.count ?? 0,
      change: data?.coupons?.latestCreatedAt ? getChangeText(data.coupons.latestCreatedAt) : (isLoading ? "" : "N/A"),
      changeType: "neutral" as const,
      icon: <Bookmark size={16} />,
      description: "Paris disponibles pour vos clients",
      isLoading: isLoading,
    },
    {
      title: "Procédures",
      value: data?.procedures?.count ?? 0,
      change: data?.procedures?.latestCreatedAt ? getChangeText(data.procedures.latestCreatedAt) : (isLoading ? "" : "N/A"),
      changeType: "neutral" as const,
      icon: <FileText size={16} />,
      description: "Guides étape par étape",
      isLoading: isLoading,
    },
    {
      title: "Problèmes & Solutions",
      value: data?.problems?.count ?? 0,
      change: data?.problems?.latestCreatedAt ? getChangeText(data.problems.latestCreatedAt) : (isLoading ? "" : "N/A"),
      changeType: "neutral" as const,
      icon: <HelpCircle size={16} />,
      description: "FAQ pour résoudre les problèmes",
      isLoading: isLoading,
    },
    {
      title: "Informations Bot",
      value: data?.botInfo?.count ?? 0,
      change: data?.botInfo?.latestCreatedAt ? getChangeText(data.botInfo.latestCreatedAt) : (isLoading ? "" : "N/A"),
      changeType: "neutral" as const,
      icon: <Info size={16} />,
      description: "Données complémentaires",
      isLoading: isLoading,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 transparent-grid">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
