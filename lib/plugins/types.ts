export type PluginCategory =
  | 'ai'
  | 'blockchain'
  | 'communication'
  | 'data'
  | 'devtools'
  | 'productivity';

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select';
  required: boolean;
  isSecret: boolean;
  placeholder?: string;
  options?: string[];
}

export interface NativePlugin {
  key: string;
  name: string;
  icon: string;
  description: string;
  category: PluginCategory;
  capabilities: string[];
  authType: 'none' | 'apikey' | 'oauth2';
  configFields: ConfigField[];
  isOpenClawSkill?: boolean;
  docsUrl?: string;
}

export interface PluginCategoryMeta {
  key: PluginCategory;
  label: string;
  icon: string;
}

export interface InstalledPlugin {
  pluginKey: string;
  installedAt: number;
  config: Record<string, string>;
}

export interface RegistrySkill {
  slug: string;
  name: string;
  description: string;
  tags?: string[];
  repoUrl?: string;
  version?: string;
}
