import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import Debugger from "./pages/Debugger";
import Marketplace from "./pages/Marketplace";
import Workspace from "./pages/Workspace";
import SoftwareHealing from "./pages/SoftwareHealing";
import UploadApp from "./pages/UploadApp";
import DNAScanner from "./pages/DNAScanner";
import EvolutionEngine from "./pages/EvolutionEngine";
import LiveBench from "./pages/LiveBench";
import LessonView from "./pages/LessonView";
import LearningLibrary from "./pages/LearningLibrary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showNavigation = location.pathname !== '/' && location.pathname !== '/editor' && !location.pathname.startsWith('/software-healing');

  return (
    <>
      {showNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/debugger" element={<Debugger />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/software-healing" element={<SoftwareHealing />} />
        <Route path="/software-healing/upload" element={<UploadApp />} />
        <Route path="/software-healing/scanner" element={<DNAScanner />} />
        <Route path="/software-healing/evolution" element={<EvolutionEngine />} />
        <Route path="/software-healing/livebench" element={<LiveBench />} />
        <Route path="/lesson/:id" element={<LessonView />} />
        <Route path="/learning-library" element={<LearningLibrary />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
