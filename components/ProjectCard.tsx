import { Project } from '@/lib/projects';
import { ExternalLink, Github, Globe, Package } from 'lucide-react';
import Link from 'next/link';

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 overflow-hidden group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Link
            href={`/project/${encodeURIComponent(project.name)}`}
            className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          >
            {project.name}
          </Link>
          {project.status && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ml-2 ${
                statusColors[project.status] || statusColors.active
              }`}
            >
              {project.status}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex gap-1 mb-3">
          {project.featured && (
            <span className="px-2 py-0.5 text-xs bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded border border-yellow-200 dark:border-yellow-800">
              ⭐ Featured
            </span>
          )}
          {project.pinned && (
            <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800">
              📌 Pinned
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm leading-relaxed">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        {(project.version || project.stars || project.downloads) && (
          <div className="flex gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
            {project.version && <span>v{project.version}</span>}
            {project.stars && <span>⭐ {project.stars.toLocaleString()}</span>}
            {project.downloads && <span>📦 {project.downloads}</span>}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            {project.repository && (
              <a
                href={project.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="GitHub Repository"
              >
                <Github size={16} />
                <span className="text-xs">Code</span>
              </a>
            )}
            {project.homepage && (
              <a
                href={project.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="Homepage"
              >
                <Globe size={16} />
                <span className="text-xs">Demo</span>
              </a>
            )}
            {project.npm && (
              <a
                href={project.npm}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="NPM Package"
              >
                <Package size={16} />
                <span className="text-xs">NPM</span>
              </a>
            )}
          </div>
          <Link
            href={`/project/${encodeURIComponent(project.name)}`}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-xs font-medium transition-colors"
          >
            Details <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
