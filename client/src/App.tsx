import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Engine from "./pages/Engine";
import CommunityEngagement from "./pages/engine/CommunityEngagement";
import ImpactDelivery from "./pages/engine/ImpactDelivery";
import NewFrontiers from "./pages/engine/NewFrontiers";
import Stewardship from "./pages/engine/Stewardship";
import PurposePlatform from "./pages/engine/PurposePlatform";
import Weekly from "./pages/Weekly";
import Monthly from "./pages/Monthly";
import Pipelines from "./pages/Pipelines";
import Trends from "./pages/Trends";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import VentureDetail from "./pages/VentureDetail";
import SignInPage from "./pages/SignIn";
import { trpc } from "./lib/trpc";
import { useEffect, useState } from "react";
import { QuickAddActivity } from "./components/QuickAddActivity";
import { supabase } from "./lib/supabase";

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (isLoading || location === "/onboarding") return;
    if (user && !user.birthplace) {
      setLocation("/onboarding");
    }
  }, [user, isLoading, location, setLocation]);

  if (user && !user.birthplace && location !== "/onboarding") {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { data: user } = trpc.auth.me.useQuery();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !session.user.email?.endsWith("@thirdspace.africa")) {
        supabase.auth.signOut();
        toast.error("Access restricted. Please sign in with a @thirdspace.africa email address.");
        setAuthLoading(false);
        return;
      }
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !session.user.email?.endsWith("@thirdspace.africa")) {
        supabase.auth.signOut();
        toast.error("Access restricted. Please sign in with a @thirdspace.africa email address.");
        return;
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return null;

  if (!session && location !== "/sign-in") {
    return <Redirect to="/sign-in" />;
  }

  const showQuickAdd = user && location !== "/onboarding";

  return (
    <>
      <Switch>
        <Route path={"/sign-in"} component={SignInPage} />
        <Route path={"/onboarding"} component={Onboarding} />
        <Route path={"/"}>
          <OnboardingGuard><Home /></OnboardingGuard>
        </Route>
        <Route path={"/dashboard"}>
          <OnboardingGuard><Dashboard /></OnboardingGuard>
        </Route>
        <Route path={"/engine"}>
          <OnboardingGuard><Engine /></OnboardingGuard>
        </Route>
        <Route path={"/engine/community-engagement"}>
          <OnboardingGuard><CommunityEngagement /></OnboardingGuard>
        </Route>
        <Route path={"/engine/impact-delivery"}>
          <OnboardingGuard><ImpactDelivery /></OnboardingGuard>
        </Route>
        <Route path={"/engine/new-frontiers"}>
          <OnboardingGuard><NewFrontiers /></OnboardingGuard>
        </Route>
        <Route path={"/engine/stewardship"}>
          <OnboardingGuard><Stewardship /></OnboardingGuard>
        </Route>
        <Route path={"/engine/purpose-platform"}>
          <OnboardingGuard><PurposePlatform /></OnboardingGuard>
        </Route>
        <Route path={"/weekly"}>
          <OnboardingGuard><Weekly /></OnboardingGuard>
        </Route>
        <Route path={"/monthly"}>
          <OnboardingGuard><Monthly /></OnboardingGuard>
        </Route>
        <Route path={"/pipelines"}>
          <OnboardingGuard><Pipelines /></OnboardingGuard>
        </Route>
        <Route path={"/trends"}>
          <OnboardingGuard><Trends /></OnboardingGuard>
        </Route>
        <Route path={"/settings"}>
          <OnboardingGuard><Settings /></OnboardingGuard>
        </Route>
        <Route path={"/venture/:id"}>
          <OnboardingGuard><VentureDetail /></OnboardingGuard>
        </Route>
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>

      {showQuickAdd && (
        <>
          <button
            onClick={() => setQuickAddOpen(true)}
            className="md:hidden fixed bottom-20 right-4 z-50 bg-[#ec4899] hover:bg-[#db2777] text-white font-semibold px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Quick add activity"
          >
            shesha
          </button>
          <QuickAddActivity open={quickAddOpen} onOpenChange={setQuickAddOpen} />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;