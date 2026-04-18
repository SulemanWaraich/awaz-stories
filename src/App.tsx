import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";

function GlobalChrome() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/embed/")) return null;
  return (
    <>
      <GlobalAudioPlayer />
      <PWAInstallPrompt />
      <OnboardingGate />
    </>
  );
}

const Index = lazy(() => import("./pages/Index"));
const Explore = lazy(() => import("./pages/Explore"));
const About = lazy(() => import("./pages/About"));
const EpisodeDetail = lazy(() => import("./pages/EpisodeDetail"));
const SeriesDetail = lazy(() => import("./pages/SeriesDetail"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const Login = lazy(() => import("./pages/auth/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const DashboardLayout = lazy(() => import("./pages/dashboard/DashboardLayout"));
const DashboardOverview = lazy(() => import("./pages/dashboard/DashboardOverview"));
const DashboardEpisodes = lazy(() => import("./pages/dashboard/DashboardEpisodes"));
const DashboardUpload = lazy(() => import("./pages/dashboard/DashboardUpload"));
const DashboardAnalytics = lazy(() => import("./pages/dashboard/DashboardAnalytics"));
const DashboardProfileEdit = lazy(() => import("./pages/dashboard/DashboardProfileEdit"));
const DashboardSettings = lazy(() => import("./pages/dashboard/DashboardSettings"));
const ListenerProfile = lazy(() => import("./pages/ListenerProfile"));
const CreatorProfile = lazy(() => import("./pages/CreatorProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EmbedEpisode = lazy(() => import("./pages/EmbedEpisode"));

const queryClient = new QueryClient();

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/about" element={<About />} />
              <Route path="/our-story" element={<About />} />
              <Route path="/episode/:slug" element={<EpisodeDetail />} />
              <Route path="/series/:slug" element={<SeriesDetail />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<ListenerProfile />} />
              <Route path="/creator/:id" element={<CreatorProfile />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="episodes" element={<DashboardEpisodes />} />
                <Route path="upload" element={<DashboardUpload />} />
                <Route path="analytics" element={<DashboardAnalytics />} />
                <Route path="profile" element={<DashboardProfileEdit />} />
                <Route path="settings" element={<DashboardSettings />} />
              </Route>
              <Route path="/embed/episode/:slug" element={<EmbedEpisode />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <GlobalChrome />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
