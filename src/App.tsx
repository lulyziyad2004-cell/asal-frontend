import { lazy, Suspense } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch, Router as WouterRouter } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Code-split every portal page into its own chunk.
const Auth = lazy(() => import("./pages/Auth"));
const Home = lazy(() => import("./pages/Home"));
const DashboardOverview = lazy(() => import("./pages/DashboardOverview"));
const Cases = lazy(() => import("./pages/Cases"));
const Hearings = lazy(() => import("./pages/Hearings"));
const Documents = lazy(() => import("./pages/Documents"));
const Upload = lazy(() => import("./pages/Upload"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Messages = lazy(() => import("./pages/Messages"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const Users = lazy(() => import("./pages/Users"));
const Audit = lazy(() => import("./pages/Audit"));

function Spinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

type Role = "admin" | "lawyer" | "consultant" | "client";

function RoleGuard({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!user || !allowed.includes(user.role as Role)) {
    return <Redirect to="/dashboard" />;
  }
  return <>{children}</>;
}

function DashboardRouter() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Redirect to="/login" />;
  return <Redirect to={`/dashboard/${user.role === "admin" ? "overview" : "overview"}`} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Auth} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard">
        <DashboardRouter />
      </Route>
      <Route path="/dashboard/overview">
        <RoleGuard allowed={["admin", "lawyer", "consultant", "client"]}>
          <Suspense fallback={<Spinner />}>
            <DashboardOverview />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/dashboard/cases">
        <RoleGuard allowed={["admin", "lawyer", "consultant", "client"]}>
          <Suspense fallback={<Spinner />}>
            <Cases />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/dashboard/hearings">
        <RoleGuard allowed={["admin", "lawyer", "consultant", "client"]}>
          <Suspense fallback={<Spinner />}>
            <Hearings />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/dashboard/documents">
        <RoleGuard allowed={["admin", "lawyer", "consultant", "client"]}>
          <Suspense fallback={<Spinner />}>
            <Documents />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/dashboard/upload">
        <RoleGuard allowed={["admin", "lawyer", "consultant", "client"]}>
          <Suspense fallback={<Spinner />}>
            <Upload />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/dashboard/invoices">
        <RoleGuard allowed={["admin", "lawyer", "consultant", "client"]}>
          <Suspense fallback={<Spinner />}>
            <Invoices />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/dashboard/messages">
        <RoleGuard allowed={["admin", "lawyer", "consultant", "client"]}>
          <Suspense fallback={<Spinner />}>
            <Messages />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/dashboard/subscriptions">
        <RoleGuard allowed={["client", "admin"]}>
          <Suspense fallback={<Spinner />}>
            <Subscriptions />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/dashboard/users">
        <RoleGuard allowed={["admin"]}>
          <Suspense fallback={<Spinner />}>
            <Users />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/dashboard/audit">
        <RoleGuard allowed={["admin"]}>
          <Suspense fallback={<Spinner />}>
            <Audit />
          </Suspense>
        </RoleGuard>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" />
          <WouterRouter>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
