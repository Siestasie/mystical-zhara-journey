import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ConsultationPage from "./pages/Consultation";
import PriceList from "./pages/PriceList";
import Gallery from "./pages/Gallery";
import Contacts from "./pages/Contacts";
import AdminNotifications from "./pages/AdminNotifications";
import AdminPanel from "./pages/AdminPanel";
import Shop from "./pages/Shop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/consultation" element={<ConsultationPage />} />
              <Route path="/price-list" element={<PriceList />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/admin/panel" element={<AdminPanel />} />
              <Route path="/shop" element={<Shop />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;