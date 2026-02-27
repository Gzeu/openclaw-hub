import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

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
    
    try {
      const data = yaml.load(fileContents) as any;

      // Validate required fields
      if (!data.name) {
        console.warn(`Project in ${fileName} is missing required 'name' field`);
        continue;
      }

      // Ensure tags is an array
      if (!data.tags || !Array.isArray(data.tags)) {
        data.tags = [];
      }

      projects.push(data as Project);
    } catch (error) {
      console.error(`Error parsing ${fileName}:`, error);
      continue;
    }
  }

  // Sort: pinned first, then featured, then by name
  return projects.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Safe name comparison with fallback
    const nameA = a.name || '';
    const nameB = b.name || '';
    return nameA.localeCompare(nameB);
  });
}

export async function getProjectByName(name: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find((p) => p.name === name) || null;
}

export async function getProjectsByTag(tag: string): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects.filter((p) => p.tags && Array.isArray(p.tags) && p.tags.includes(tag));
}

export async function getAllTags(): Promise<string[]> {
  const projects = await getAllProjects();
  const tags = new Set<string>();
  projects.forEach((project) => {
    if (project.tags && Array.isArray(project.tags)) {
      project.tags.forEach((tag) => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
}
