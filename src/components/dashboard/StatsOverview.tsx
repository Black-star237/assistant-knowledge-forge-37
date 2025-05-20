
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: number | string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "default" | "primary" | "secondary" | "blue" | "green" | "orange";
}

interface StatsOverviewProps {
  data: {
    coupons?: { count: number; latestCreatedAt: string | null };
    procedures?: { count: number; latestCreatedAt: string | null };
    problems?: { count: number; latestCreatedAt: string | null };
    botInfo?: {
      count: number;
      latestCreatedAt: string | null;
      codePromoCount: number;
      liensCount: number;
      reglesCount: number;
    };
  } | null;
  isLoading?: boolean;
}

export function StatsOverview({ data, isLoading }: StatsOverviewProps) {
  const stats: StatItem[] = [
    {
      label: "Coupons",
      value: data?.coupons?.count ?? 0,
      color: "blue",
    },
    {
      label: "Procédures",
      value: data?.procedures?.count ?? 0,
      color: "green",
    },
    {
      label: "Problèmes",
      value: data?.problems?.count ?? 0,
      color: "orange",
    },
    {
      label: "Informations Bot",
      value: data?.botInfo?.count ?? 0,
      color: "primary",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className={cn(
          "overflow-hidden transition-all hover:shadow-md rounded-xl bg-transparent shadow-sm",
          stat.color === "primary" && "border-l-4 border-l-primary",
          stat.color === "blue" && "border-l-4 border-l-jovial-blue",
          stat.color === "green" && "border-l-4 border-l-jovial-green",
          stat.color === "orange" && "border-l-4 border-l-jovial-orange",
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              {stat.icon}
            </div>
            <div className="mt-3">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <p className="text-2xl font-bold">...</p>
                </div>
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </div>
            {stat.trend && (
              <div className="mt-2 flex items-center text-xs">
                {stat.trend.isPositive ? (
                  <CircleCheck className="h-3 w-3 mr-1 text-green-500" />
                ) : (
                  <CircleCheck className="h-3 w-3 mr-1 text-red-500" />
                )}
                <span className={stat.trend.isPositive ? "text-green-500" : "text-red-500"}>
                  {stat.trend.value}% depuis le mois dernier
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { DashboardCard } from "./DashboardCard";
