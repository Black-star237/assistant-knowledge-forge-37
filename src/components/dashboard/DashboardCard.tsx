
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconColor?: "pink" | "teal" | "blue" | "orange" | "purple" | "amber";
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
  iconColor = "blue",
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
    switch (iconColor) {
      case "pink": 
        return "icon-circle-pink";
      case "teal": 
        return "icon-circle-teal";
      case "blue": 
        return "icon-circle-blue";
      case "orange": 
        return "icon-circle-orange";
      case "purple": 
        return "icon-circle-purple";
      case "amber": 
        return "icon-circle-amber";
      default:
        return "icon-circle-blue";
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md rounded-xl border border-gray-100",
      getColorClass(),
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex gap-4 items-center">
          {icon && <div className={cn(getIconClass())}>{icon}</div>}
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm">{description}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>{children}</div>
      </CardContent>
      {(footer || footerAction) && (
        <CardFooter className="border-t bg-muted/20 px-6 py-3">
          {footer || (
            <div className="flex w-full justify-end">
              <Button variant="ghost" size="sm" asChild className="hover:bg-background/80 flex items-center gap-2">
                <a href={footerAction?.href}>
                  {footerAction?.label}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
