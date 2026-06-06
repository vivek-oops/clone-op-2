import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Wishlist from "./pages/Wishlist";
import BlogListing from "./pages/BlogListing";
import BlogArticle from "./pages/BlogArticle";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import { HelmetProvider } from "react-helmet-async";
import AgeGate from "./components/AgeGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AgeGate />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/blog" element={<BlogListing />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
