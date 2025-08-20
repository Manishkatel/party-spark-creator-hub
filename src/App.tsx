
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Create from "./pages/Create";
import MyEvents from "./pages/MyEvents";
import Events from "./pages/Events";
import Auth from "./pages/Auth";
import Clubs from "./pages/Clubs";
import ClubCreate from "./pages/ClubCreate";
import ClubProfile from "./pages/ClubProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/events" element={<Events />} />
          <Route path="/create" element={<Create />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/club/create" element={<ClubCreate />} />
          <Route path="/club/:id" element={<ClubProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
