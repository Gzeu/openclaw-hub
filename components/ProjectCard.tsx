import { Project } from '@/lib/projects';
import { ExternalLink, Github, Globe, Package } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    beta: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {project.name}
          </h3>
          {project.status && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                statusColors[project.status] || statusColors.active
              }`}
            >
              {project.status}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        {(project.version || project.stars || project.downloads) && (
          <div className="flex gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
            {project.version && <span>v{project.version}</span>}
            {project.stars && <span>⭐ {project.stars}</span>}
            {project.downloads && <span>📦 {project.downloads}</span>}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {project.repository && (
            <a
              href={project.repository}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="GitHub Repository"
            >
              <Github size={18} />
              <span className="text-sm">Code</span>
            </a>
          )}
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Homepage"
            >
              <Globe size={18} />
              <span className="text-sm">Demo</span>
            </a>
          )}
          {project.npm && (
            <a
              href={project.npm}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="NPM Package"
            >
              <Package size={18} />
              <span className="text-sm">NPM</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
