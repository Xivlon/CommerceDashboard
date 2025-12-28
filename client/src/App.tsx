import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { PreferencesProvider } from "@/components/preferences-provider";
import { DomainProvider } from "@/contexts/domain-context";
import { ErrorBoundary } from "@/components/error-boundary";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import Plugins from "@/pages/plugins";
import DataSources from "@/pages/data-sources";
import CustomDashboard from "@/pages/custom-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/plugins" component={Plugins} />
      <Route path="/data-sources" component={DataSources} />
      <Route path="/custom-dashboard/:schemaId" component={CustomDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="ml-dashboard-theme">
          <DomainProvider>
            <PreferencesProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </PreferencesProvider>
          </DomainProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
