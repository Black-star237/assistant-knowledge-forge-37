
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./components/ui/sidebar";
import Index from "./pages/Index";
import Coupons from "./pages/Coupons";
import Procedures from "./pages/Procedures";
import Problems from "./pages/Problems";
import BotInfo from "./pages/BotInfo";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/Profile"; 
import LicenceWhatsapp from "./pages/LicenceWhatsapp";
import "./App.css";

// Ajout de styles pour l'effet de flou sur la sidebar mobile
const sidebarStyles = `
  @media (max-width: 767px) {
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      z-index: 40;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    }
    
    [data-state="expanded"] ~ div:not([data-sidebar="sidebar"]) {
      filter: blur(2px);
      transition: filter 0.3s ease;
    }
  }
`;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <style>{sidebarStyles}</style>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SidebarProvider defaultOpen={true}>
          <BrowserRouter>
            <div className="mesh-bg flex min-h-screen w-full">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Index />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/procedures" element={<Procedures />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/bot-info" element={<BotInfo />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/licence-whatsapp" element={<LicenceWhatsapp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
