
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  footerAction?: {
    label: string;
    href: string;
  };
}

export function DashboardCard({
  title,
  description,
  icon,
  children,
  className,
  footer,
  footerAction,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div>{children}</div>
      </CardContent>
      {(footer || footerAction) && (
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          {footer || (
            <div className="flex w-full justify-end">
              <Button variant="ghost" size="sm" asChild>
                <a href={footerAction?.href}>{footerAction?.label}</a>
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
