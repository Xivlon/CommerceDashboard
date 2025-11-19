import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { PreferencesProvider } from "@/components/preferences-provider";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import Plugins from "@/pages/plugins";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/settings" component={Settings} />
      <Route path="/plugins" component={Plugins} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ml-dashboard-theme">
        <PreferencesProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
