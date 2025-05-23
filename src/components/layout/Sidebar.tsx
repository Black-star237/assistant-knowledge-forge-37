
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

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, Bookmark, FileText, HelpCircle, Info, User, PhoneCall } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const AppSidebar = () => {
  const { open: isOpen, openMobile, isMobile } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const mainItems = [
    { title: 'Tableau de bord', url: '/', icon: Home },
    { title: 'Coupons', url: '/coupons', icon: Bookmark },
    { title: 'Procédures', url: '/procedures', icon: FileText },
    { title: 'Problèmes & Solutions', url: '/problems', icon: HelpCircle },
    { title: 'Informations Bot', url: '/bot-info', icon: Info },
    { title: 'Licence WhatsApp', url: '/licence-whatsapp', icon: PhoneCall },
  ];

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg ${isActive
      ? 'sidebar-item-active' // Rubrique active: fond orange doux, texte noir
      : 'sidebar-item' // Rubriques inactives: fond bleu clair, texte noir
    }`;

  // Cette fonction récupère le nom de l'utilisateur à afficher
  const getUserDisplayName = () => {
    // Vérifier d'abord le profil utilisateur dans les données de l'utilisateur s'il existe
    if (user?.user_metadata?.nom) {
      return user.user_metadata.nom;
    }
    
    // Sinon, utiliser le nom de la base de données ou email comme fallback
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  return (
    <>
      {isMobile && openMobile && <div className="sidebar-overlay" />}
      <Sidebar
        className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-none"
      >
        <SidebarTrigger className="m-2 self-end text-gray-700 dark:text-gray-300 hover:text-green-500" />

        {/* Avatar utilisateur */}
        <div className={`p-4 ${isOpen ? 'items-start' : 'items-center'} flex flex-col mb-3`}>  
          <div className={`flex ${isOpen ? 'flex-row items-center w-full gap-4' : 'flex-col'}`}>
            <Avatar className="h-11 w-11 border-2 border-orange-300">
              <AvatarFallback className="bg-orange-500 text-white font-medium">
                {getUserDisplayName().substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            {isOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{getUserDisplayName()}</span>
                <Button variant="link" asChild className="h-auto p-0 text-xs text-gray-700 dark:text-gray-300 hover:text-orange-500">
                  <NavLink to="/profile">Mon profil</NavLink>
                </Button>
              </div>
            )}
          </div>
        </div>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-700 dark:text-gray-300 font-medium">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavLinkClass} end>
                        <item.icon className={`h-5 w-5 ${location.pathname === item.url ? 'text-black dark:text-black' : 'text-gray-700 dark:text-gray-300'}`} />
                        {isOpen && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {!isOpen && (
          <div className="mt-auto p-2 mb-3">
            <SidebarMenuButton asChild>
              <NavLink to="/profile" className={getNavLinkClass}>
                <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </NavLink>
            </SidebarMenuButton>
          </div>
        )}
      </Sidebar>
    </>
  );
};
