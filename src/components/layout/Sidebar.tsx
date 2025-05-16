
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  useSidebar
} from '@/components/ui/sidebar';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, Bookmark, FileText, HelpCircle, Info, User, PhoneCall, LayoutGrid, MessageSquare, Users, Clock, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AppSidebar = () => {
  const { open: isOpen } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Items de la sidebar
  const mainItems = [
    { title: 'Tableau de bord', url: '/', icon: LayoutGrid },
    { title: 'Coupons', url: '/coupons', icon: Bookmark },
    { title: 'Procédures', url: '/procedures', icon: FileText },
    { title: 'Problèmes & Solutions', url: '/problems', icon: HelpCircle },
    { title: 'Informations Bot', url: '/bot-info', icon: Info },
    { title: 'Licence WhatsApp', url: '/licence-whatsapp', icon: PhoneCall },
  ];

  // Classe active pour NavLink
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive
      ? 'bg-sidebar-accent text-primary font-medium'
      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
    }`;

  return (
    <Sidebar
      className="glassmorphism border-r border-white/20"
      collapsible="icon"
    >
      <div className="flex items-center py-4 px-3 mb-2">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-semibold text-lg">Bot Business</span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <span className="text-white font-bold text-lg">B</span>
            </div>
          </div>
        )}
      </div>

      <SidebarTrigger className="m-2 self-end text-sidebar-foreground/80 hover:text-sidebar-foreground" />

      {/* Avatar utilisateur */}
      <div className={`px-4 ${isOpen ? 'items-start' : 'items-center'} flex flex-col mb-3`}>
        <div className={`flex ${isOpen ? 'flex-row items-center w-full gap-4' : 'flex-col'}`}>
          <Avatar className="h-10 w-10 border-2 border-primary/30">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-medium">
              {user?.email?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {isOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">{user?.email}</span>
              <Button variant="link" asChild className="h-auto p-0 text-xs text-sidebar-foreground/70 hover:text-primary">
                <NavLink to="/profile">Mon profil</NavLink>
              </Button>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 font-medium">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavLinkClass} end>
                      <item.icon className={`h-5 w-5 ${location.pathname === item.url ? 'text-primary' : 'text-sidebar-foreground/70'}`} />
                      {isOpen && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Lien profil et déconnexion */}
      <div className="mt-auto p-2 mb-3">
        {!isOpen ? (
          <>
            <SidebarMenuButton asChild className="mb-2">
              <NavLink to="/profile" className={getNavLinkClass}>
                <User className="h-5 w-5" />
              </NavLink>
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <NavLink to="/auth" className={getNavLinkClass}>
                <LogOut className="h-5 w-5" />
              </NavLink>
            </SidebarMenuButton>
          </>
        ) : (
          <SidebarMenuButton asChild>
            <NavLink to="/auth" className={getNavLinkClass}>
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </NavLink>
          </SidebarMenuButton>
        )}
      </div>
    </Sidebar>
  );
};
