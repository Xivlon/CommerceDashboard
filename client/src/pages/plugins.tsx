/**
 * Plugin Management Page
 * Manage, enable/disable, and configure plugins
 */

import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { pluginManager, Plugin } from "@/lib/plugin-system";
import { useToast } from "@/hooks/use-toast";
import { Puzzle, Plus, Trash2, Settings, ArrowLeft, Download } from "lucide-react";

export default function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = () => {
    setPlugins(pluginManager.getAll());
  };

  const handleToggle = async (pluginId: string) => {
    try {
      const metadata = pluginManager.getMetadata(pluginId);
      if (metadata?.enabled) {
        await pluginManager.disable(pluginId);
        toast({
          title: "Plugin Disabled",
          description: `${metadata.name} has been disabled.`,
        });
      } else {
        await pluginManager.enable(pluginId);
        toast({
          title: "Plugin Enabled",
          description: `${metadata?.name} has been enabled.`,
        });
      }
      loadPlugins();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleUninstall = async (pluginId: string) => {
    try {
      const metadata = pluginManager.getMetadata(pluginId);
      await pluginManager.unregister(pluginId);
      toast({
        title: "Plugin Uninstalled",
        description: `${metadata?.name} has been removed.`,
      });
      loadPlugins();
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900 p-6">
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/settings">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Puzzle className="h-8 w-8" />
              Plugin Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Extend your dashboard with custom plugins
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Install Plugin
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Browse Marketplace
            </Button>
          </div>
        </div>

        {/* Plugin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{plugins.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Plugins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {plugins.filter((p) => pluginManager.getMetadata(p.id)?.enabled).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Widgets Added</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {plugins.reduce((sum, p) => sum + (p.widgets?.length || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Installed Plugins */}
        <Card>
          <CardHeader>
            <CardTitle>Installed Plugins</CardTitle>
            <CardDescription>
              {plugins.length === 0
                ? "No plugins installed yet"
                : `Managing ${plugins.length} plugin${plugins.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {plugins.length === 0 ? (
              <div className="text-center py-12">
                <Puzzle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Plugins Installed</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by installing your first plugin
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Install Your First Plugin
                </Button>
              </div>
            ) : (
              plugins.map((plugin) => {
                const metadata = pluginManager.getMetadata(plugin.id);
                const isEnabled = metadata?.enabled ?? false;

                return (
                  <div key={plugin.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{plugin.name}</h3>
                          <Badge variant={isEnabled ? "default" : "secondary"}>
                            v{plugin.version}
                          </Badge>
                          {isEnabled && (
                            <Badge variant="outline" className="bg-green-50">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {plugin.description || "No description provided"}
                        </p>
                        {plugin.author && (
                          <p className="text-xs text-muted-foreground">
                            By {plugin.author}
                          </p>
                        )}
                        {plugin.widgets && plugin.widgets.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium">Widgets:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {plugin.widgets.map((widget) => (
                                <Badge key={widget.id} variant="outline" className="text-xs">
                                  {widget.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => handleToggle(plugin.id)}
                        />
                        {plugin.settingsComponent && (
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUninstall(plugin.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Plugin Development Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Own Plugin</CardTitle>
            <CardDescription>
              Extend the dashboard with custom widgets and functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Plugins allow you to add custom widgets, hooks, and functionality to the
                dashboard. Check out the example plugin template in the codebase.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <code className="text-xs">
                  <pre>{`import { createPlugin } from '@/lib/plugin-system';

const myPlugin = createPlugin({
  id: 'my-custom-plugin',
  name: 'My Custom Plugin',
  version: '1.0.0',
  description: 'Adds custom functionality',

  widgets: [
    // Custom widget definitions
  ],

  hooks: {
    onDataFetch: async (data) => {
      // Process data
    }
  }
});

// Register the plugin
pluginManager.register(myPlugin);`}</pre>
                </code>
              </div>
              <Button variant="outline" className="w-full">
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
