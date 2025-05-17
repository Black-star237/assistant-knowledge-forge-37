
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
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
      isActive
        ? 'bg-orange-500 text-black border-orange-500'
        : 'bg-white text-black border-gray-200 hover:bg-gray-100'
    }`;

  return (
    <>
      {isMobile && openMobile && <div className="fixed inset-0 bg-black/30 z-20" onClick={openMobile} />}
      <Sidebar
        className={
          `fixed top-0 left-0 h-full z-30 transform transition-transform bg-white ${
            isMobile
              ? isOpen
                ? 'translate-x-0 w-3/4'
                : '-translate-x-full'
              : 'relative translate-x-0 w-64 rounded-xl shadow-lg'
          }`
        }
        collapsible={isMobile ? undefined : 'icon'}
      >
        <SidebarTrigger className={`m-2 ${isMobile ? 'text-black' : 'self-end text-black'} hover:text-orange-500`} />

        {/* Avatar utilisateur */}
        <div className={`p-4 flex flex-col mb-3 ${isOpen ? 'items-start' : 'items-center'}`}>
          <div className={`flex ${isOpen ? 'flex-row items-center w-full gap-4' : 'flex-col'}`}>            
            <Avatar className="h-11 w-11 border-2 border-orange-500">
              <AvatarFallback className="bg-orange-500 text-white font-medium">
                {user?.email?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            {isOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-black">{user?.email}</span>
                <Button
                  variant="link"
                  asChild
                  className="h-auto p-0 text-xs text-black hover:text-orange-500"
                >
                  <NavLink to="/profile">Mon profil</NavLink>
                </Button>
              </div>
            )}
          </div>
        </div>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-black font-medium mb-2">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavLinkClass}>
                        {({ isActive }) => (
                          <>
                            <item.icon className={`h-5 w-5 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                            {isOpen && <span className="font-medium">{item.title}</span>}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Profil lien mobile */}
        {!isOpen && isMobile && (
          <div className="mt-auto p-4">
            <SidebarMenuButton asChild>
              <NavLink to="/profile" className={getNavLinkClass}>
                <User className="h-5 w-5 text-black" />
              </NavLink>
            </SidebarMenuButton>
          </div>
        )}
      </Sidebar>
    </>
  );
};
