
import { Bookmark, FileText, HelpCircle, Info } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ReactNode;
  description?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
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
    </div>
  );
}

export function StatsOverview() {
  const stats = [
    {
      title: "Coupons",
      value: "12",
      change: "+2 derniers 7j",
      changeType: "increase" as const,
      icon: <Bookmark size={16} />,
      description: "Paris disponibles pour vos clients",
    },
    {
      title: "Procédures",
      value: "8",
      change: "Dernière mise à jour: 3j",
      changeType: "neutral" as const,
      icon: <FileText size={16} />,
      description: "Guides étape par étape",
    },
    {
      title: "Problèmes & Solutions",
      value: "15",
      change: "+3 derniers 30j",
      changeType: "increase" as const,
      icon: <HelpCircle size={16} />,
      description: "FAQ pour résoudre les problèmes",
    },
    {
      title: "Informations Bot",
      value: "6",
      change: "Dernière mise à jour: 1j",
      changeType: "neutral" as const,
      icon: <Info size={16} />,
      description: "Données complémentaires",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
