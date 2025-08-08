import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Livestream from "./pages/Livestream";
import Livescore from "./pages/Livescore";
import Events from "./pages/Events";
import PriceList from "./pages/PriceList";
import Auth from "./pages/Auth";
import AdminSimple from "./pages/AdminSimple";
import NotFound from "./pages/NotFound";
import AnalyticsInit from "./components/AnalyticsInit";
import ThankYou from "./pages/ThankYou";
const queryClient = new QueryClient();

const SessionGuard: React.FC = () => {
  useSessionTimeout();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SessionGuard />
        <BrowserRouter>
          <AnalyticsInit />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/livestream" element={<Livestream />} />
            <Route path="/livescore" element={<Livescore />} />
            <Route path="/events" element={<Events />} />
            <Route path="/prislista" element={<PriceList />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminSimple />} />
            <Route path="/tack" element={<ThankYou />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
