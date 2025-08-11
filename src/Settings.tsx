import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { PluginSettings } from './types/sigma';
import { Palette, RotateCcw } from 'lucide-react';

// Theme presets (aligned with CSS variables in index.css / tailwind.config)
const PRESET_THEMES: Record<string, { name: string; colors: Record<string, string> }> = {
  light: {
    name: 'Light',
    colors: {
      '--background': '0 0% 100%',
      '--foreground': '240 10% 3.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '240 10% 3.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '240 10% 3.9%',
      '--primary': '240 9% 10%',
      '--primary-foreground': '0 0% 98%',
      '--secondary': '240 4.8% 95.9%',
      '--secondary-foreground': '240 5.9% 10%',
      '--muted': '240 4.8% 95.9%',
      '--muted-foreground': '240 3.8% 46.1%',
      '--accent': '240 4.8% 95.9%',
      '--accent-foreground': '240 5.9% 10%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 5.9% 90%',
      '--input': '240 5.9% 90%',
      '--ring': '240 5.9% 10%',
    },
  },
  dark: {
    name: 'Dark',
    colors: {
      '--background': '240 10% 3.9%',
      '--foreground': '0 0% 98%',
      '--card': '240 10% 3.9%',
      '--card-foreground': '0 0% 98%',
      '--popover': '240 10% 3.9%',
      '--popover-foreground': '0 0% 98%',
      '--primary': '0 0% 98%',
      '--primary-foreground': '240 5.9% 10%',
      '--secondary': '240 3.7% 15.9%',
      '--secondary-foreground': '0 0% 98%',
      '--muted': '240 3.7% 15.9%',
      '--muted-foreground': '240 5% 64.9%',
      '--accent': '240 3.7% 15.9%',
      '--accent-foreground': '0 0% 98%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '240 3.7% 15.9%',
      '--input': '240 3.7% 15.9%',
      '--ring': '240 4.9% 83.9%',
    },
  },
};

export const DEFAULT_SETTINGS: PluginSettings = {
  title: 'Sigma Plugin Template',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  styling: {
    theme: 'light',
    customColors: { ...PRESET_THEMES.light.colors },
    enableDynamicTheming: true,
  },
};

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: PluginSettings;
  onSave: (settings: PluginSettings) => void;
  client: any; // Keep any for simplicity in template
}

const Settings: React.FC<SettingsProps> = ({ 
  isOpen, 
  onClose, 
  currentSettings, 
  onSave, 
  client 
}) => {
  const [tempSettings, setTempSettings] = useState<PluginSettings>(currentSettings);
  const [activeTab, setActiveTab] = useState<'general' | 'styling'>('general');

  // Update temp settings when current settings change
  useEffect(() => {
    const settingsWithDefaults: PluginSettings = {
      ...DEFAULT_SETTINGS,
      ...currentSettings,
      styling: {
        ...DEFAULT_SETTINGS.styling!,
        ...(currentSettings.styling || {}),
      },
    };
    setTempSettings(settingsWithDefaults);
  }, [currentSettings]);

  const handleSave = useCallback((): void => {
    const configJson = JSON.stringify(tempSettings, null, 2);
    try {
      client.config.set({ config: configJson });
      onSave(tempSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [tempSettings, client, onSave]);

  const handleCancel = useCallback((): void => {
    setTempSettings(currentSettings);
    onClose();
  }, [currentSettings, onClose]);

  // Apply theme colors dynamically while dialog is open
  useEffect(() => {
    if (!isOpen) return;
    if (!tempSettings.styling?.enableDynamicTheming) return;
    const theme = tempSettings.styling.theme;
    const colors = theme === 'custom'
      ? tempSettings.styling.customColors
      : PRESET_THEMES[theme]?.colors || PRESET_THEMES.light.colors;
    Object.entries(colors).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }, [tempSettings.styling, isOpen]);

  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'custom') => {
    setTempSettings((prev) => {
      const next = { ...prev } as PluginSettings;
      next.styling = next.styling || { theme: 'light', customColors: { ...PRESET_THEMES.light.colors }, enableDynamicTheming: true };
      next.styling.theme = theme;
      if (theme !== 'custom') {
        next.styling.customColors = { ...PRESET_THEMES[theme].colors };
      }
      return next;
    });
  }, []);

  const handleCustomColorChange = useCallback((key: string, hexValue: string) => {
    const hslVar = hexToHslVar(hexValue);
    setTempSettings((prev) => {
      const next = { ...prev } as PluginSettings;
      next.styling = next.styling || { theme: 'light', customColors: { ...PRESET_THEMES.light.colors }, enableDynamicTheming: true };
      next.styling.customColors = { ...(next.styling.customColors || {}), [key]: hslVar };
      return next;
    });
  }, []);

  const resetToDefaultTheme = useCallback(() => {
    setTempSettings((prev) => ({
      ...prev,
      styling: {
        theme: 'light',
        customColors: { ...PRESET_THEMES.light.colors },
        enableDynamicTheming: true,
      },
    }));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plugin Settings</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-border">
          <Button
            variant={activeTab === 'general' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('general')}
            className="rounded-b-none"
          >
            General
          </Button>
          <Button
            variant={activeTab === 'styling' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('styling')}
            className="rounded-b-none gap-2"
          >
            <Palette className="h-4 w-4" />
            Styling
          </Button>
        </div>

        {activeTab === 'general' && (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="pluginTitle">Title</Label>
              <Input
                id="pluginTitle"
                type="text"
                value={tempSettings.title || ''}
                onChange={(e) => setTempSettings((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a display title"
              />
              <p className="text-sm text-muted-foreground">A simple title displayed by your plugin.</p>
            </div>
          </div>
        )}

        {activeTab === 'styling' && (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="stylingTheme">Theme</Label>
              <select
                id="stylingTheme"
                value={tempSettings.styling?.theme || 'light'}
                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'custom')}
                className="block w-full border rounded px-3 py-2 text-sm bg-background text-foreground"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="custom">Custom</option>
              </select>
              <p className="text-sm text-muted-foreground">Choose a pre-defined theme or customize colors</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="enableDynamicTheming">Enable Dynamic Theming</Label>
              <div className="flex items-center gap-2">
                <input
                  id="enableDynamicTheming"
                  type="checkbox"
                  checked={Boolean(tempSettings.styling?.enableDynamicTheming)}
                  onChange={(e) => setTempSettings((prev) => ({
                    ...prev,
                    styling: {
                      ...(prev.styling || { theme: 'light', customColors: { ...PRESET_THEMES.light.colors } }),
                      enableDynamicTheming: e.target.checked,
                    },
                  }))}
                />
                <span className="text-sm">{tempSettings.styling?.enableDynamicTheming ? 'Enabled' : 'Disabled'}</span>
              </div>
              <p className="text-sm text-muted-foreground">Apply theme changes in real-time while editing</p>
            </div>

            {tempSettings.styling?.theme === 'custom' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customColors">Custom Colors</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetToDefaultTheme}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Primary Colors */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Primary Colors</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['--primary', '--primary-foreground', '--secondary', '--secondary-foreground'].map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <label className="text-xs font-normal min-w-0 flex-1">{key.replace('--', '').replace('-', ' ')}:</label>
                          <input
                            type="color"
                            value={hslVarToHex(tempSettings.styling?.customColors?.[key])}
                            onChange={(e) => handleCustomColorChange(key, e.target.value)}
                            aria-label={`Pick ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Background Colors */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Background Colors</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['--background', '--foreground', '--card', '--card-foreground'].map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <label className="text-xs font-normal min-w-0 flex-1">{key.replace('--', '').replace('-', ' ')}:</label>
                          <input
                            type="color"
                            value={hslVarToHex(tempSettings.styling?.customColors?.[key])}
                            onChange={(e) => handleCustomColorChange(key, e.target.value)}
                            aria-label={`Pick ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Accent Colors</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['--accent', '--accent-foreground', '--muted', '--muted-foreground'].map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <label className="text-xs font-normal min-w-0 flex-1">{key.replace('--', '').replace('-', ' ')}:</label>
                          <input
                            type="color"
                            value={hslVarToHex(tempSettings.styling?.customColors?.[key])}
                            onChange={(e) => handleCustomColorChange(key, e.target.value)}
                            aria-label={`Pick ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Border & Inputs */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Border & Input Colors</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['--border', '--input', '--ring', '--destructive'].map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <label className="text-xs font-normal min-w-0 flex-1">{key.replace('--', '').replace('-', ' ')}:</label>
                          <input
                            type="color"
                            value={hslVarToHex(tempSettings.styling?.customColors?.[key])}
                            onChange={(e) => handleCustomColorChange(key, e.target.value)}
                            aria-label={`Pick ${key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Palette className="h-4 w-4" />
                  Click a color square to customize. Changes apply instantly when dynamic theming is enabled.
                </p>
              </div>
            )}

            {/* Theme Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary"></div>
                    <span className="text-sm text-card-foreground">Primary Color</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary"></div>
                    <span className="text-sm text-card-foreground">Secondary Color</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-accent"></div>
                    <span className="text-sm text-card-foreground">Accent Color</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Preview of current theme colors</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;

// Helpers to convert between HEX and CSS var HSL strings used in Tailwind theme
function hexToHslVar(hex: string): string {
  const { h, s, l } = hexToHsl(hex);
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
}

function hslVarToHex(hslVar?: string): string {
  if (!hslVar) return '#000000';
  const [hStr, sStr, lStr] = hslVar.split(' ').map((v) => v.trim());
  const h = parseFloat(hStr || '0');
  const s = parseFloat((sStr || '0').replace('%', ''));
  const l = parseFloat((lStr || '0').replace('%', ''));
  return hslToHex(h, s, l);
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    r = parseInt(normalized[0] + normalized[0], 16);
    g = parseInt(normalized[1] + normalized[1], 16);
    b = parseInt(normalized[2] + normalized[2], 16);
  } else if (normalized.length === 6) {
    r = parseInt(normalized.substring(0, 2), 16);
    g = parseInt(normalized.substring(2, 4), 16);
    b = parseInt(normalized.substring(4, 6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  h = h / 360; s = s / 100; l = l / 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


