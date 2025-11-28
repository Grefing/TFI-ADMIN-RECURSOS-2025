import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/MainLayout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import InventoryForm from "./pages/InventoryForm";
import History from "./pages/History";
import Incidents from "./pages/Incidents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout wrapper que combina ProtectedRoute y MainLayout
const ProtectedLayout = () => (
  <ProtectedRoute>
    <MainLayout>
      <Outlet />
    </MainLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/add" element={<InventoryForm />} />
              <Route path="inventory/edit/:id" element={<InventoryForm />} />
              <Route path="history" element={<History />} />
              <Route path="incident" element={<Incidents />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
