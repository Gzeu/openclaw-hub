export type PluginCategory =
  | 'ai'
  | 'blockchain'
  | 'communication'
  | 'developer'
  | 'data'
  | 'productivity'
  | 'social'
  | 'finance'
  | 'infrastructure'
  | 'media'
  | 'security';

export type AuthType = 'none' | 'apikey' | 'oauth2' | 'jwt';

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'email' | 'select' | 'textarea';
  required: boolean;
  isSecret: boolean;
  placeholder?: string;
  options?: string[];
  helpText?: string;
}

export interface NativePlugin {
  key: string;
  name: string;
  icon: string;
  description: string;
  category: PluginCategory;
  authType: AuthType;
  capabilities: string[];
  configFields: ConfigField[];
  docsUrl?: string;
  homepageUrl?: string;
  isOpenClawSkill: boolean;
  skillSlug?: string; // ClawHub slug if this is also an OpenClaw skill
  version: string;
}

export interface PluginCategoryMeta {
  key: PluginCategory;
  label: string;
  icon: string;
}

export interface InstalledPlugin {
  pluginKey: string;
  enabled: boolean;
  config: Record<string, string>;
  installedAt: number;
  updatedAt: number;
}
