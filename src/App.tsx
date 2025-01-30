import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import PriceList from "./pages/PriceList";
import Gallery from "./pages/Gallery";
import Contacts from "./pages/Contacts";
import Consultation from "./pages/Consultation";
import AdminPanel from "./pages/AdminPanel";
import AdminNotifications from "./pages/AdminNotifications";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetails />} />
          <Route path="/price-list" element={<PriceList />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;