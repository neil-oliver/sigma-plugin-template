import React, { useEffect, useState, useCallback } from 'react';
import { client, useConfig, useElementData, useElementColumns } from '@sigmacomputing/plugin';
import { Button } from './components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import Settings, { DEFAULT_SETTINGS } from './Settings';
import { 
  SigmaConfig, 
  SigmaData, 
  PluginSettings, 
  DataInfo, 
  ConfigParseError 
} from './types/sigma';
import './App.css';

// Configure the plugin editor panel
client.config.configureEditorPanel([
  { name: 'source', type: 'element' },
  { name: 'dataColumn', type: 'column', source: 'source', allowMultiple: false, label: 'Data Column' },
  { name: 'config', type: 'text', label: 'Settings Config (JSON)', defaultValue: "{}" },
  { name: 'editMode', type: 'toggle', label: 'Edit Mode' }
]);

const App: React.FC = (): React.JSX.Element => {
  const config: SigmaConfig = useConfig();
  const sigmaData: SigmaData = useElementData(config.source || '');
  const columns = useElementColumns(config.source || '');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState<PluginSettings>(DEFAULT_SETTINGS);

  // Parse config JSON and load settings
  useEffect(() => {
    if (config.config?.trim()) {
      try {
        const parsedConfig = JSON.parse(config.config) as Partial<PluginSettings>;
        const newSettings: PluginSettings = { ...DEFAULT_SETTINGS, ...parsedConfig };
        setSettings(newSettings);
      } catch (err) {
        const error: ConfigParseError = {
          message: 'Invalid config JSON',
          originalError: err
        };
        console.error('Config parse error:', error);
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [config.config]);

  const handleSettingsSave = useCallback((newSettings: PluginSettings): void => {
    setSettings(newSettings);
    setShowSettings(false);
  }, []);

  const handleShowSettings = useCallback((): void => {
    setShowSettings(true);
  }, []);

  const handleCloseSettings = useCallback((): void => {
    setShowSettings(false);
  }, []);

  // Get data information
  const getDataInfo = useCallback((): DataInfo | null => {
    if (!sigmaData || !config.dataColumn) {
      return null;
    }

    const columnData = sigmaData[config.dataColumn];
    if (!columnData) {
      return null;
    }

    // Get column name from columns object using the column ID
    const columnInfo = columns[config.dataColumn];
    const columnName = columnInfo?.name || config.dataColumn;

    return {
      rowCount: columnData.length,
      columnName: columnName,
      hasData: columnData.length > 0
    };
  }, [sigmaData, config.dataColumn, columns]);

  const dataInfo = getDataInfo();

  // Early return for missing source
  if (!config.source) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-10"
        style={{ 
          backgroundColor: String(settings.backgroundColor) || 'white',
          color: String(settings.textColor) || 'black'
        }}
      >
        <div className="text-center max-w-xl">
          <h3 className="text-lg font-semibold mb-2">Sigma Plugin Template</h3>
          <p className="text-muted-foreground">Please select a data source to get started.</p>
        </div>
      </div>
    );
  }

  // Early return for missing data column
  if (!config.dataColumn) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-10"
        style={{ 
          backgroundColor: String(settings.backgroundColor) || 'white',
          color: String(settings.textColor) || 'black'
        }}
      >
        <div className="text-center max-w-xl">
          <h3 className="text-lg font-semibold mb-2">Data Source Selected</h3>
          <p className="text-muted-foreground">Please select a data column to display information.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        backgroundColor: String(settings.backgroundColor) || 'white',
        color: String(settings.textColor) || 'black'
      }}
    >
      {config.editMode && (
        <Button 
          className="absolute top-5 right-5 z-10 gap-2"
          onClick={handleShowSettings}
          size="sm"
        >
          <SettingsIcon className="h-4 w-4" />
          Settings
        </Button>
      )}
      
      <div className="w-full h-screen flex items-center justify-center p-5 box-border">
        <div className="text-center max-w-xl">
          <h3 className="text-lg font-semibold mb-4">Sigma Plugin Template</h3>
          
          {dataInfo ? (
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <h4 className="text-md font-medium mb-2">Data Loaded Successfully</h4>
                <p className="text-lg">
                  <span className="font-semibold">{dataInfo.rowCount}</span> rows loaded from{' '}
                  <span className="font-semibold">"{dataInfo.columnName}"</span>
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                This is a template plugin. Modify the code to add your custom functionality.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <h4 className="text-md font-medium mb-2">No Data Available</h4>
                <p className="text-muted-foreground">
                  The selected column "{columns[config.dataColumn]?.name || config.dataColumn}" contains no data.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Settings
        isOpen={showSettings}
        onClose={handleCloseSettings}
        currentSettings={settings}
        onSave={handleSettingsSave}
        client={client}
      />
    </div>
  );
};

export default App; 