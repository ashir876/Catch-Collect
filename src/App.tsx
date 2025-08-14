import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Import Pokemon TCG API scripts for browser console access
import "@/lib/testPokemonAPI";
import "@/lib/populatePriceData";
import Navigation from "@/components/layout/Navigation";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Series from "./pages/Series";
import Sets from "./pages/Sets";
import SetDetail from "./pages/SetDetail";
import Cards from "./pages/Cards";
import CardDetail from "./pages/CardDetail";
import Shop from "./pages/Shop";
import Collection from "./pages/Collection";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import ProCatches from "./pages/ProCatches";
import Accessories from "./pages/Accessories";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/series" element={<Series />} />
              <Route path="/sets" element={<Sets />} />
              <Route path="/set/:setId" element={<SetDetail />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/card/:id" element={<CardDetail />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/pro-catches" element={<ProCatches />} />
              <Route path="/accessories" element={<Accessories />} />
              <Route path="/orders" element={<Orders />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
