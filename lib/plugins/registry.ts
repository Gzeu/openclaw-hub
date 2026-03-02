import type { RegistrySkill } from './types';

const REGISTRY_URL = 'https://raw.githubusercontent.com/openclaw/clawhub/main/registry.json';

export async function fetchRegistrySkills(): Promise<RegistrySkill[]> {
  try {
    const res = await fetch(REGISTRY_URL, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.skills ?? []) as RegistrySkill[];
  } catch {
    return [];
  }
}

export async function searchRegistrySkills(query: string): Promise<RegistrySkill[]> {
  const skills = await fetchRegistrySkills();
  if (!query.trim()) return skills;
  const q = query.toLowerCase();
  return skills.filter(
    s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.tags ?? []).some(t => t.toLowerCase().includes(q))
  );
}

export function getSkillRepoUrl(slug: string): string {
  return `https://github.com/openclaw/clawhub/tree/main/skills/${slug}`;
}
