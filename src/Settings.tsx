import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { PluginSettings, ColorChangeEvent } from './types/sigma';

// Default settings
export const DEFAULT_SETTINGS: PluginSettings = {
  backgroundColor: '#ffffff',
  textColor: '#000000'
};

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: PluginSettings;
  onSave: (settings: PluginSettings) => void;
  client: any; // Use any for now to avoid complex typing issues
}

const Settings: React.FC<SettingsProps> = ({ 
  isOpen, 
  onClose, 
  currentSettings, 
  onSave, 
  client 
}) => {
  const [tempSettings, setTempSettings] = useState<PluginSettings>(currentSettings);

  // Update temp settings when current settings change
  useEffect(() => {
    // Ensure all required properties exist with defaults
    const settingsWithDefaults: PluginSettings = {
      ...DEFAULT_SETTINGS,
      ...currentSettings
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

  const handleBackgroundColorChange = useCallback((e: ColorChangeEvent): void => {
    setTempSettings((prev: PluginSettings) => ({ ...prev, backgroundColor: e.target.value }));
  }, []);

  const handleTextColorChange = useCallback((e: ColorChangeEvent): void => {
    setTempSettings((prev: PluginSettings) => ({ ...prev, textColor: e.target.value }));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Plugin Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color</Label>
            <Input
              id="backgroundColor"
              type="color"
              value={tempSettings.backgroundColor}
              onChange={handleBackgroundColorChange}
              className="h-10"
            />
            <p className="text-sm text-muted-foreground">Choose the background color for the plugin</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color</Label>
            <Input
              id="textColor"
              type="color"
              value={tempSettings.textColor}
              onChange={handleTextColorChange}
              className="h-10"
            />
            <p className="text-sm text-muted-foreground">Choose the text color for the plugin</p>
          </div>
        </div>

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