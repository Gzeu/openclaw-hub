export type PluginCategory =
  | 'ai'
  | 'blockchain'
  | 'developer'
  | 'communication'
  | 'productivity'
  | 'data'
  | 'storage'
  | 'monitoring'
  | 'payment'
  | 'social';

export type AuthType = 'api_key' | 'oauth2' | 'webhook' | 'none';

export interface PluginConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'number' | 'boolean' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  isSecret?: boolean;
}

export interface NativePlugin {
  key: string;
  name: string;
  description: string;
  category: PluginCategory;
  icon: string;
  authType: AuthType;
  docsUrl?: string;
  oauthScopes?: string[];
  configFields: PluginConfigField[];
  capabilities: string[];
  isOpenClawSkill: boolean;
  skillSlug?: string;
}

export interface RegistrySkill {
  slug: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  installCount?: number;
  rating?: number;
  repoUrl: string;
}

export interface InstalledPlugin {
  key: string;
  type: 'native' | 'registry';
  enabled: boolean;
  config: Record<string, string>;
  installedAt: number;
  version?: string;
}
