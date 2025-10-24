import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"; // Added useNavigate
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { ThemeProvider } from "./components/theme-provider";
import { SessionContextProvider, useSupabase } from "./components/SessionContextProvider";
import React from "react";

console.log("VITE_SUPABASE_URL from App.tsx:", import.meta.env.VITE_SUPABASE_URL); // <--- ADD THIS LINE

const queryClient = new QueryClient();

// A simple protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useSupabase();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !session) {
      navigate('/login');
    }
  }, [session, loading, navigate]);

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user session...</p>
      </div>
    );
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SessionContextProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SessionContextProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;