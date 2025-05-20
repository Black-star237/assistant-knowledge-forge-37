
import { Moon, Sun, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type BackgroundImage = {
  id: number;
  image_url: string;
};

export function ThemeToggle() {
  const { theme, setTheme, currentBackground } = useTheme();
  const [lightBackgrounds, setLightBackgrounds] = useState<BackgroundImage[]>([]);
  const [darkBackgrounds, setDarkBackgrounds] = useState<BackgroundImage[]>([]);

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        // Récupérer les fonds pour le mode clair
        const { data: lightData, error: lightError } = await supabase
          .from('light_mode_backgrounds')
          .select('id, image_url');
        
        if (lightError) {
          console.error("Erreur lors de la récupération des fonds clairs:", lightError);
        } else if (lightData) {
          setLightBackgrounds(lightData);
        }
        
        // Récupérer les fonds pour le mode sombre
        const { data: darkData, error: darkError } = await supabase
          .from('dark_mode_backgrounds')
          .select('id, image_url');
        
        if (darkError) {
          console.error("Erreur lors de la récupération des fonds sombres:", darkError);
        } else if (darkData) {
          setDarkBackgrounds(darkData);
        }
      } catch (error) {
        console.error("Erreur de récupération des fonds d'écran:", error);
      }
    };

    fetchBackgrounds();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="backdrop-blur-lg bg-white/80 dark:bg-black/80 border-white/20">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Clair</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Sombre</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <span>Système</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Image className="mr-2 h-4 w-4" />
            <span>Arrière-plans</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem disabled className="text-xs opacity-50">
              {currentBackground ? 'Changement auto (1 min)' : 'Aucun arrière-plan'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-xs">
              Mode clair: {lightBackgrounds.length} images
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-xs">
              Mode sombre: {darkBackgrounds.length} images
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
