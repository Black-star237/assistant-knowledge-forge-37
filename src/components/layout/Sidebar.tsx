
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, AlertTriangle, Info, Settings, LogOut, UserCircle } from "lucide-react"; // Added UserCircle
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export function AppSidebar() {
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { isOpen, isMobile, toggleSidebar } = useSidebar();

  const navItems = [
    { href: "/", label: "Tableau de bord", icon: Home },
    { href: "/coupons", label: "Coupons", icon: FileText },
    { href: "/procedures", label: "Procédures", icon: FileText },
    { href: "/problems", label: "Problèmes & Solutions", icon: AlertTriangle },
    { href: "/bot-info", label: "Informations du Bot", icon: Info },
    { href: "/profile", label: "Mon Profil", icon: UserCircle }, // ADDED PROFILE LINK
  ];

  const isActive = (path: string) => location.pathname === path;

  if (loading) {
    return (
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 flex-col border-r bg-background sm:flex",
          isOpen ? "flex w-72" : "hidden w-20"
        )}
      >
        <div className="flex h-full max-h-screen flex-col gap-2 p-4">
          <div className="flex h-14 items-center border-b">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              {/* Placeholder for logo or app name */}
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            {/* Skeleton loading for nav items can be added here */}
          </div>
        </div>
      </aside>
    );
  }
  
  const userInitial = user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-10 flex-col border-r bg-background sm:flex",
        isMobile ? (isOpen ? "flex w-72" : "hidden") : (isOpen ? "flex w-72" : "w-20")
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2 p-4">
        <div className={cn("flex h-14 items-center border-b", isOpen ? "px-4" : "justify-center")}>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
            {isOpen && <span className="">Mon Assistant</span>}
          </Link>
        </div>

        <nav className="flex-1 overflow-auto py-2 space-y-1">
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive(item.href) && "bg-muted text-primary",
                    !isOpen && "justify-center"
                  )}
                  onClick={isMobile ? toggleSidebar : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  {isOpen && item.label}
                </Link>
              </TooltipTrigger>
              {!isOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
           {user && isOpen && (
            <div className="flex items-center gap-3 p-2 border-t">
              <Avatar className="h-9 w-9">
                 <AvatarImage src={user.user_metadata?.avatar_url || profile?.["Photo de profile"] || undefined} alt={user.email || "Utilisateur"} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="grid gap-0.5 text-xs">
                <div className="font-medium truncate">{user.user_metadata?.full_name || user.email}</div>
                <div className="text-muted-foreground">Admin</div> {/* Or user role */}
              </div>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isOpen ? "default" : "icon"}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg text-muted-foreground transition-all hover:text-primary",
                  !isOpen && "justify-center"
                )}
                onClick={signOut}
              >
                <LogOut className="h-5 w-5" />
                {isOpen && "Déconnexion"}
              </Button>
            </TooltipTrigger>
            {!isOpen && <TooltipContent side="right">Déconnexion</TooltipContent>}
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
