
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/hooks/useTheme";
import { AssistantChat } from "@/components/AssistantChat";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Transactions from "./pages/Transactions";
import Calendar from "./pages/Calendar";
import Goals from "./pages/Goals";
import Import from "./pages/Import";
import Reports from "./pages/Reports";
import Installments from "./pages/Installments";
import Accounts from "./pages/Accounts";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <SidebarRail />
        <SidebarInset>{children}</SidebarInset>
        <AssistantChat />
      </div>
    </SidebarProvider>
  );
};

const App = () => {
  // Simple auth check - in a real app you would use a proper auth context
  const isAuthenticated = () => {
    // For demo purposes, consider the user authenticated if they're not on the login/register/index pages
    return localStorage.getItem('isAuthenticated') === 'true';
  };

  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated() ? (
      <MainLayout>{children}</MainLayout>
    ) : (
      <Navigate to="/login" />
    );
  };

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<Pricing />} />
              
              {/* Protected routes inside sidebar layout */}
              <Route path="/dashboard" element={<AuthRoute><Dashboard /></AuthRoute>} />
              <Route path="/transactions" element={<AuthRoute><Transactions /></AuthRoute>} />
              <Route path="/installments" element={<AuthRoute><Installments /></AuthRoute>} />
              <Route path="/accounts" element={<AuthRoute><Accounts /></AuthRoute>} />
              <Route path="/calendar" element={<AuthRoute><Calendar /></AuthRoute>} />
              <Route path="/goals" element={<AuthRoute><Goals /></AuthRoute>} />
              <Route path="/import" element={<AuthRoute><Import /></AuthRoute>} />
              <Route path="/reports" element={<AuthRoute><Reports /></AuthRoute>} />
              <Route path="/profile" element={<AuthRoute><Profile /></AuthRoute>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
