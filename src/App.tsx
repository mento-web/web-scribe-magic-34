import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Survey from "./pages/Survey.tsx";
import Termin from "./pages/Termin.tsx";
import Analyse from "./pages/Analyse.tsx";
import FAQ from "./pages/FAQ.tsx";
import Pricing from "./pages/Pricing.tsx";
import UeberUns from "./pages/UeberUns.tsx";
import Kontakt from "./pages/Kontakt.tsx";
import Karriere from "./pages/Karriere.tsx";
import Rueckgabe from "./pages/Rueckgabe.tsx";
import AGB from "./pages/AGB.tsx";
import Datenschutz from "./pages/Datenschutz.tsx";
import Impressum from "./pages/Impressum.tsx";
import Proteinrechner from "./pages/Proteinrechner.tsx";
import BmiRechner from "./pages/BmiRechner.tsx";
import Anmelden from "./pages/Anmelden.tsx";
import Konto from "./pages/Konto.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

/* ============================================================================
   ScrollToHash — small helper that scrolls to the element matching
   `location.hash` whenever the hash changes.

   Why: React Router's <Link to="/#bmi-rechner"> updates the URL but does not
   scroll to the anchor by default. The Ressourcen dropdown points to
   `/#bmi-rechner` from every page; without this helper, clicking it from
   /pricing would land at the top of `/` instead of the BMI section.

   A small setTimeout gives the destination page time to mount its DOM before
   we try to find the element.
   ========================================================================= */
const ScrollToHash = () => {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) {
      // Top-of-page on route change (no hash) — feels less jarring than the
      // browser remembering scroll on SPA navigations.
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      return;
    }
    const id = hash.replace(/^#/, "");
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    // Wait one tick so the new page has mounted before we look for the anchor.
    const t = setTimeout(tryScroll, 50);
    return () => clearTimeout(t);
  }, [hash, pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* AuthProvider must live inside BrowserRouter because some auth
            consumers (ProtectedRoute) use useLocation. */}
        <AuthProvider>
          <ScrollToHash />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/survey/:gender" element={<Survey />} />
            {/* Booking page — post-survey, Cal.com Atoms behind it */}
            <Route path="/termin" element={<Termin />} />
            <Route path="/analyse" element={<Analyse />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/pricing" element={<Pricing />} />
            {/* === Resources / tools === */}
            <Route path="/bmi-rechner" element={<BmiRechner />} />
            <Route path="/proteinrechner" element={<Proteinrechner />} />
            {/* === Auth surfaces === */}
            <Route path="/anmelden" element={<Anmelden />} />
            <Route
              path="/konto"
              element={
                <ProtectedRoute>
                  <Konto />
                </ProtectedRoute>
              }
            />
            {/* === Secondary content pages (footer links) === */}
            <Route path="/ueber-uns" element={<UeberUns />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/karriere" element={<Karriere />} />
            <Route path="/rueckgabe" element={<Rueckgabe />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
