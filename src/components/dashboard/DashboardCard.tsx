
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
  color?: "default" | "primary" | "secondary" | "blue" | "green" | "orange";
}

export function DashboardCard({
  title,
  description,
  icon,
  children,
  className,
  footer,
  footerAction,
  color = "default",
}: DashboardCardProps) {
  const getColorClass = () => {
    switch (color) {
      case "primary": 
        return "border-l-4 border-l-primary";
      case "secondary": 
        return "border-l-4 border-l-secondary";
      case "blue": 
        return "border-l-4 border-l-jovial-blue";
      case "green": 
        return "border-l-4 border-l-jovial-green";
      case "orange": 
        return "border-l-4 border-l-jovial-orange";
      default:
        return "";
    }
  };

  const getIconClass = () => {
    switch (color) {
      case "primary": 
        return "text-primary";
      case "secondary": 
        return "text-secondary";
      case "blue": 
        return "text-jovial-blue";
      case "green": 
        return "text-jovial-green";
      case "orange": 
        return "text-jovial-orange";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-soft rounded-xl",
      getColorClass(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm">{description}</CardDescription>
          )}
        </div>
        {icon && <div className={cn("p-2 rounded-full bg-muted/50", getIconClass())}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div>{children}</div>
      </CardContent>
      {(footer || footerAction) && (
        <CardFooter className="border-t bg-muted/30 px-6 py-3">
          {footer || (
            <div className="flex w-full justify-end">
              <Button variant="ghost" size="sm" asChild className="hover:bg-background/80">
                <a href={footerAction?.href}>{footerAction?.label}</a>
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
