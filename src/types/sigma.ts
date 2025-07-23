// Sigma plugin configuration types
export interface SigmaConfig {
  source?: string;
  dataColumn?: string;
  config?: string;
  editMode?: boolean;
}

// Sigma data structure - more specific typing
export interface SigmaData {
  [columnName: string]: (string | number | boolean | null)[];
}

// Plugin settings interface
export interface PluginSettings {
  backgroundColor: string;
  textColor: string;
}

// Data information interface
export interface DataInfo {
  rowCount: number;
  columnName: string;
  hasData: boolean;
}

// Sigma client interface (based on @sigmacomputing/plugin)
export interface SigmaClient {
  config: {
    set: (config: Record<string, unknown>) => void;
    configureEditorPanel: (config: Array<{
      name: string;
      type: string;
      source?: string;
      allowMultiple?: boolean;
      label?: string;
      defaultValue?: string;
    }>) => void;
  };
}

// Settings component props with proper client typing
export interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: PluginSettings;
  onSave: (settings: PluginSettings) => void;
  client: SigmaClient;
}

// Error handling types
export interface ConfigParseError {
  message: string;
  originalError: unknown;
}

// Event handler types
export interface ColorChangeEvent {
  target: {
    value: string;
  };
} 