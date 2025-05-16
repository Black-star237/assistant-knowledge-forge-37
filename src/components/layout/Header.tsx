
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Bell, Menu, Search, Settings, User, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

export function Header() {
  const { toggleSidebar } = useSidebar();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 lg:px-6">
        <Button variant="ghost" size="icon" className="md:hidden text-primary" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <div className="relative mx-auto hidden sm:block max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="search"
            placeholder="Rechercher..."
            className="w-full rounded-full bg-white border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-primary"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5 sm:hidden" />
            <span className="sr-only">Search</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-primary"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:text-primary"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="rounded-full bg-primary text-white hidden sm:flex"
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>

          {user ? (
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="flex items-center gap-2 rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={() => navigate("/auth")}
              className="flex items-center gap-2 rounded-full"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Connexion</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
