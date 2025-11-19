import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePreferences } from "@/components/preferences-provider";
import { RefreshInterval, ColorPalette, DashboardLayout } from "@/lib/preferences";
import { useToast } from "@/hooks/use-toast";
import { AdvancedThemeCustomizer } from "@/components/advanced-theme-customizer";
import { Settings as SettingsIcon, Palette, Bell, Layout, RotateCcw, ArrowLeft, Puzzle } from "lucide-react";

export default function Settings() {
  const {
    preferences,
    updateDashboard,
    updateDisplay,
    updateNotifications,
    toggleWidget,
    resetPreferences,
  } = usePreferences();
  const { toast } = useToast();

  const handleReset = () => {
    resetPreferences();
    toast({
      title: "Preferences Reset",
      description: "All settings have been restored to defaults.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-theme-primary/5 p-6">
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <SettingsIcon className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Customize your dashboard experience
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>

      {/* Dashboard Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Dashboard
          </CardTitle>
          <CardDescription>Configure your dashboard layout and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="layout">Layout Style</Label>
              <Select
                value={preferences.dashboard.layout}
                onValueChange={(value: DashboardLayout) =>
                  updateDashboard({ layout: value })
                }
              >
                <SelectTrigger id="layout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refresh">Auto-Refresh Interval</Label>
              <Select
                value={preferences.dashboard.refreshInterval}
                onValueChange={(value: RefreshInterval) =>
                  updateDashboard({ refreshInterval: value })
                }
              >
                <SelectTrigger id="refresh">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="30s">30 seconds</SelectItem>
                  <SelectItem value="1m">1 minute</SelectItem>
                  <SelectItem value="5m">5 minutes</SelectItem>
                  <SelectItem value="15m">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animations</Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth transitions and animations
              </p>
            </div>
            <Switch
              checked={preferences.dashboard.showAnimations}
              onCheckedChange={(checked) =>
                updateDashboard({ showAnimations: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and padding for more content
              </p>
            </div>
            <Switch
              checked={preferences.dashboard.compactMode}
              onCheckedChange={(checked) =>
                updateDashboard({ compactMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Display
          </CardTitle>
          <CardDescription>Customize colors, formats, and appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="palette">Color Palette</Label>
              <Select
                value={preferences.display.colorPalette}
                onValueChange={(value: ColorPalette) =>
                  updateDisplay({ colorPalette: value })
                }
              >
                <SelectTrigger id="palette">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="ocean">Ocean Blue</SelectItem>
                  <SelectItem value="sunset">Sunset Orange</SelectItem>
                  <SelectItem value="forest">Forest Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="rose">Rose</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={preferences.display.dateFormat}
                onValueChange={(value) =>
                  updateDisplay({ dateFormat: value as any })
                }
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency Format</Label>
              <Select
                value={preferences.display.currencyFormat}
                onValueChange={(value) =>
                  updateDisplay({ currencyFormat: value as any })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Tooltips</Label>
              <p className="text-sm text-muted-foreground">
                Display helpful tooltips on hover
              </p>
            </div>
            <Switch
              checked={preferences.display.showTooltips}
              onCheckedChange={(checked) =>
                updateDisplay({ showTooltips: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations for accessibility
              </p>
            </div>
            <Switch
              checked={preferences.display.reducedMotion}
              onCheckedChange={(checked) =>
                updateDisplay({ reducedMotion: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts and updates
              </p>
            </div>
            <Switch
              checked={preferences.notifications.enabled}
              onCheckedChange={(checked) =>
                updateNotifications({ enabled: checked })
              }
            />
          </div>

          {preferences.notifications.enabled && (
            <>
              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Churn Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when customers are at high churn risk
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.churnAlerts}
                  onCheckedChange={(checked) =>
                    updateNotifications({ churnAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sales Milestones</Label>
                  <p className="text-sm text-muted-foreground">
                    Celebrate when you hit sales targets
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.salesMilestones}
                  onCheckedChange={(checked) =>
                    updateNotifications({ salesMilestones: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound with notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.notifications.soundEnabled}
                  onCheckedChange={(checked) =>
                    updateNotifications({ soundEnabled: checked })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

        {/* Advanced Theme Customizer */}
        <AdvancedThemeCustomizer />

        {/* Plugin Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="h-5 w-5" />
              Plugins & Extensions
            </CardTitle>
            <CardDescription>
              Extend your dashboard with custom plugins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add new widgets, integrate third-party services, and customize functionality
              with plugins.
            </p>
            <Link href="/plugins">
              <Button className="w-full">
                <Puzzle className="h-4 w-4 mr-2" />
                Manage Plugins
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Widget Configuration */}
        <Card>
        <CardHeader>
          <CardTitle>Widget Configuration</CardTitle>
          <CardDescription>
            Enable or disable dashboard widgets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferences.widgets
            .sort((a, b) => a.order - b.order)
            .map((widget) => (
              <div key={widget.id} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="capitalize">
                    {widget.id.replace(/-/g, " ")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {getWidgetDescription(widget.id)}
                  </p>
                </div>
                <Switch
                  checked={widget.enabled}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
              </div>
            ))}
        </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getWidgetDescription(id: string): string {
  const descriptions: Record<string, string> = {
    "kpi-cards": "Key performance indicators at a glance",
    "clv-prediction": "Customer lifetime value predictions",
    "churn-analysis": "Identify customers at risk of churning",
    "sales-forecast": "Revenue forecasting and trends",
    "recommendations": "Product recommendation insights",
  };
  return descriptions[id] || "Dashboard widget";
}
