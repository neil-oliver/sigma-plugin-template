export interface ConfigParseError {
  message: string;
  originalError: Error;
}

export interface PluginSettings {
  [key: string]: string | number | boolean | null;
}

export interface DataInfo {
  rowCount: number;
  columnName: string;
  hasData: boolean;
}