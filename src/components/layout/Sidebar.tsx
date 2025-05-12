
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  FileText,
  Bookmark,
  HelpCircle,
  Info,
  PanelLeft,
  Home,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  // Récupérer l'état du sidebar depuis le hook
  const sidebarContext = useSidebar();
  // Utiliser l'état du contexte pour déterminer si le sidebar est replié
  const collapsed = sidebarContext.state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { 
      title: "Tableau de bord", 
      path: "/", 
      icon: Home, 
      description: "Vue d'ensemble" 
    },
    { 
      title: "Coupons", 
      path: "/coupons", 
      icon: Bookmark, 
      description: "Gestion des paris" 
    },
    { 
      title: "Procédures", 
      path: "/procedures", 
      icon: FileText, 
      description: "Guides clients" 
    },
    { 
      title: "Problèmes & Solutions", 
      path: "/problems", 
      icon: HelpCircle, 
      description: "FAQ et dépannage" 
    },
    { 
      title: "Informations Bot", 
      path: "/bot-info", 
      icon: Info, 
      description: "Configuration de l'assistant" 
    },
  ];

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:text-primary",
      isActive
        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
    );

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-64"
      )}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end text-sidebar-foreground hover:text-primary">
        <PanelLeft size={18} />
      </SidebarTrigger>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      end
                      className={getNavCls}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={cn("h-5 w-5", 
                          isActive(item.path) ? "text-assistant" : "text-sidebar-foreground"
                        )}
                      />
                      {!collapsed && (
                        <div>
                          <div>{item.title}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto py-4 px-3">
          <div className={cn(
            "flex items-center gap-2 rounded-md bg-assistant/10 p-3",
            collapsed ? "justify-center" : ""
          )}>
            <div className="h-8 w-8 rounded-full bg-whatsapp flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            {!collapsed && (
              <div className="text-xs">
                <div className="font-semibold text-sidebar-foreground">Assistant connecté</div>
                <div className="text-muted-foreground">+33 6 XX XX XX XX</div>
              </div>
            )}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
