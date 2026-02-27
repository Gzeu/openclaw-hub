import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface Project {
  name: string;
  description: string;
  repository: string;
  homepage?: string;
  npm?: string;
  tags: string[];
  featured?: boolean;
  pinned?: boolean;
  status?: 'active' | 'beta' | 'archived';
  version?: string;
  stars?: number;
  downloads?: string;
}

const projectsDirectory = path.join(process.cwd(), 'data/projects');

export async function getAllProjects(): Promise<Project[]> {
  // Check if directory exists
  if (!fs.existsSync(projectsDirectory)) {
    console.warn('Projects directory does not exist:', projectsDirectory);
    return [];
  }

  const fileNames = fs.readdirSync(projectsDirectory);
  const projects: Project[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.yml') && !fileName.endsWith('.yaml')) {
      continue;
    }

    const fullPath = path.join(projectsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    projects.push(data as Project);
  }

  // Sort: pinned first, then featured, then by name
  return projects.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getProjectByName(name: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find((p) => p.name === name) || null;
}

export async function getProjectsByTag(tag: string): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects.filter((p) => p.tags.includes(tag));
}

export async function getAllTags(): Promise<string[]> {
  const projects = await getAllProjects();
  const tags = new Set<string>();
  projects.forEach((project) => {
    project.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}
