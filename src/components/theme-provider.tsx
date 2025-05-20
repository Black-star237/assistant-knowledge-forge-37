
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type BackgroundImage = {
  id: number;
  image_url: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentBackground: string | null;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  currentBackground: null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [lightBackgrounds, setLightBackgrounds] = useState<BackgroundImage[]>([]);
  const [darkBackgrounds, setDarkBackgrounds] = useState<BackgroundImage[]>([]);
  const [currentBackground, setCurrentBackground] = useState<string | null>(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  // Récupérer les fonds d'écran depuis Supabase
  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        // Récupérer les fonds pour le mode clair
        const { data: lightData, error: lightError } = await supabase
          .from('light_mode_backgrounds')
          .select('id, image_url');
        
        if (lightError) {
          console.error("Erreur lors de la récupération des fonds clairs:", lightError);
        } else if (lightData && lightData.length > 0) {
          setLightBackgrounds(lightData);
        }
        
        // Récupérer les fonds pour le mode sombre
        const { data: darkData, error: darkError } = await supabase
          .from('dark_mode_backgrounds')
          .select('id, image_url');
        
        if (darkError) {
          console.error("Erreur lors de la récupération des fonds sombres:", darkError);
        } else if (darkData && darkData.length > 0) {
          setDarkBackgrounds(darkData);
        }
      } catch (error) {
        console.error("Erreur de récupération des fonds d'écran:", error);
      }
    };

    fetchBackgrounds();
  }, []);

  // Déterminer le thème actuel en fonction du thème système
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme = theme;
    if (theme === "system") {
      effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    
    root.classList.add(effectiveTheme);

    // Sélectionner le premier fond d'écran en fonction du thème
    if (effectiveTheme === "dark" && darkBackgrounds.length > 0) {
      setCurrentBackground(darkBackgrounds[0].image_url);
    } else if (effectiveTheme === "light" && lightBackgrounds.length > 0) {
      setCurrentBackground(lightBackgrounds[0].image_url);
    }
  }, [theme, lightBackgrounds, darkBackgrounds]);

  // Changer le fond d'écran toutes les minutes
  useEffect(() => {
    if (lightBackgrounds.length === 0 && darkBackgrounds.length === 0) return;

    const interval = setInterval(() => {
      const currentTheme = document.documentElement.classList.contains("dark") 
        ? "dark" 
        : "light";
      
      const backgrounds = currentTheme === "dark" ? darkBackgrounds : lightBackgrounds;
      
      if (backgrounds.length > 0) {
        // Passer au prochain fond dans la liste
        const nextIndex = (backgroundIndex + 1) % backgrounds.length;
        setBackgroundIndex(nextIndex);
        setCurrentBackground(backgrounds[nextIndex].image_url);
      }
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, [backgroundIndex, lightBackgrounds, darkBackgrounds]);

  // Appliquer le fond d'écran au body
  useEffect(() => {
    if (currentBackground) {
      document.body.style.backgroundImage = `url(${currentBackground})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      
      // Ajouter un overlay pour assurer la lisibilité du contenu
      const currentTheme = document.documentElement.classList.contains("dark") 
        ? "dark" 
        : "light";
      
      if (currentTheme === "dark") {
        document.body.style.backgroundBlendMode = 'multiply';
        document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      } else {
        document.body.style.backgroundBlendMode = 'overlay';
        document.body.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      }
    }
    
    return () => {
      // Nettoyage
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.backgroundBlendMode = '';
      document.body.style.backgroundColor = '';
    };
  }, [currentBackground]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    currentBackground,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
