/**
 * Plugin System
 * Extensible architecture for adding custom widgets and functionality
 */

import { ComponentType } from "react";
import { WidgetDefinition, WidgetProps, WIDGET_DEFINITIONS } from "./widget-registry";

export type PluginHook = "beforeRender" | "afterRender" | "onDataFetch" | "onError";

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;

  // Lifecycle hooks
  onInstall?: () => void | Promise<void>;
  onUninstall?: () => void | Promise<void>;
  onEnable?: () => void | Promise<void>;
  onDisable?: () => void | Promise<void>;

  // Widget registration
  widgets?: WidgetDefinition[];

  // Hook into app lifecycle
  hooks?: {
    [key in PluginHook]?: (...args: any[]) => void | Promise<void>;
  };

  // Custom settings panel
  settingsComponent?: ComponentType<any>;
}

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  installedAt: string;
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private metadata: Map<string, PluginMetadata> = new Map();
  private hooks: Map<PluginHook, Set<Function>> = new Map();
  private storageKey = "commerce-dashboard-plugins";

  constructor() {
    this.loadPluginsFromStorage();
  }

  /**
   * Register a plugin with the system
   */
  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id "${plugin.id}" is already registered`);
    }

    this.plugins.set(plugin.id, plugin);

    // Register plugin widgets
    if (plugin.widgets) {
      plugin.widgets.forEach((widget) => {
        (WIDGET_DEFINITIONS as any)[widget.id] = widget;
      });
    }

    // Register hooks
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hook, handler]) => {
        this.registerHook(hook as PluginHook, handler);
      });
    }

    // Save metadata
    const metadata: PluginMetadata = {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      enabled: true,
      installedAt: new Date().toISOString(),
    };
    this.metadata.set(plugin.id, metadata);

    // Run installation hook
    if (plugin.onInstall) {
      await plugin.onInstall();
    }

    this.savePluginsToStorage();
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    // Run uninstall hook
    if (plugin.onUninstall) {
      await plugin.onUninstall();
    }

    // Remove widgets
    if (plugin.widgets) {
      plugin.widgets.forEach((widget) => {
        delete (WIDGET_DEFINITIONS as any)[widget.id];
      });
    }

    // Remove hooks
    if (plugin.hooks) {
      Object.entries(plugin.hooks).forEach(([hook, handler]) => {
        this.unregisterHook(hook as PluginHook, handler);
      });
    }

    this.plugins.delete(pluginId);
    this.metadata.delete(pluginId);
    this.savePluginsToStorage();
  }

  /**
   * Enable a plugin
   */
  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    const metadata = this.metadata.get(pluginId);

    if (!plugin || !metadata) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    if (plugin.onEnable) {
      await plugin.onEnable();
    }

    metadata.enabled = true;
    this.savePluginsToStorage();
  }

  /**
   * Disable a plugin
   */
  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    const metadata = this.metadata.get(pluginId);

    if (!plugin || !metadata) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    if (plugin.onDisable) {
      await plugin.onDisable();
    }

    metadata.enabled = false;
    this.savePluginsToStorage();
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins only
   */
  getEnabled(): Plugin[] {
    return this.getAll().filter((plugin) => {
      const metadata = this.metadata.get(plugin.id);
      return metadata?.enabled ?? false;
    });
  }

  /**
   * Get plugin metadata
   */
  getMetadata(pluginId: string): PluginMetadata | undefined {
    return this.metadata.get(pluginId);
  }

  /**
   * Register a hook handler
   */
  private registerHook(hook: PluginHook, handler: Function): void {
    if (!this.hooks.has(hook)) {
      this.hooks.set(hook, new Set());
    }
    this.hooks.get(hook)!.add(handler);
  }

  /**
   * Unregister a hook handler
   */
  private unregisterHook(hook: PluginHook, handler: Function): void {
    const handlers = this.hooks.get(hook);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Execute all handlers for a hook
   */
  async executeHook(hook: PluginHook, ...args: any[]): Promise<void> {
    const handlers = this.hooks.get(hook);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        await handler(...args);
      } catch (error) {
        console.error(`Error executing hook "${hook}":`, error);
      }
    }
  }

  /**
   * Save plugin metadata to localStorage
   */
  private savePluginsToStorage(): void {
    try {
      const data = Array.from(this.metadata.values());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save plugins:", error);
    }
  }

  /**
   * Load plugin metadata from localStorage
   */
  private loadPluginsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data: PluginMetadata[] = JSON.parse(stored);
        data.forEach((metadata) => {
          this.metadata.set(metadata.id, metadata);
        });
      }
    } catch (error) {
      console.error("Failed to load plugins:", error);
    }
  }
}

// Export singleton instance
export const pluginManager = new PluginManager();

// Helper function to create a plugin
export function createPlugin(config: Plugin): Plugin {
  return config;
}

// Example plugin template
export const examplePlugin = createPlugin({
  id: "example-plugin",
  name: "Example Plugin",
  version: "1.0.0",
  description: "A template for creating custom plugins",
  author: "Your Name",

  onInstall: async () => {
    console.log("Example plugin installed");
  },

  onEnable: async () => {
    console.log("Example plugin enabled");
  },

  widgets: [
    // Custom widget definitions
  ],

  hooks: {
    beforeRender: () => {
      console.log("Before render hook");
    },
    onDataFetch: async (data) => {
      console.log("Data fetched:", data);
    },
  },
});
