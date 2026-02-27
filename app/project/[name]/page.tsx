import { getAllProjects, getProjectByName } from '@/lib/projects';
import { notFound } from 'next/navigation';
import { Github, Globe, Package, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({
    name: encodeURIComponent(p.name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const project = await getProjectByName(decodeURIComponent(name));
  if (!project) return { title: 'Project Not Found' };
  return {
    title: `${project.name} — OpenClaw Hub`,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.description,
      url: project.homepage || project.repository,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { name } = await params;
  const project = await getProjectByName(decodeURIComponent(name));

  if (!project) notFound();

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    beta: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Back to Hub
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              {project.version && (
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">
                  v{project.version}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {project.featured && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                  ⭐ Featured
                </span>
              )}
              {project.pinned && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  📌 Pinned
                </span>
              )}
              {project.status && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  statusColors[project.status] || statusColors.active
                }`}>
                  {project.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Description */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {project.description}
          </p>
        </section>

        {/* Stats */}
        {(project.stars || project.downloads) && (
          <section className="grid grid-cols-2 gap-4">
            {project.stars && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">⭐ {project.stars}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">GitHub Stars</p>
              </div>
            )}
            {project.downloads && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">📦 {project.downloads}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Downloads</p>
              </div>
            )}
          </section>
        )}

        {/* Tags */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Tag size={18} /> Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </section>

        {/* Links */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Links</h2>
          <div className="space-y-3">
            {project.repository && (
              <a
                href={project.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Github size={20} className="text-gray-700 dark:text-gray-300" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">GitHub Repository</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{project.repository}</p>
                </div>
              </a>
            )}
            {project.homepage && (
              <a
                href={project.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Globe size={20} className="text-gray-700 dark:text-gray-300" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Homepage / Demo</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{project.homepage}</p>
                </div>
              </a>
            )}
            {project.npm && (
              <a
                href={project.npm}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Package size={20} className="text-gray-700 dark:text-gray-300" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">NPM Package</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{project.npm}</p>
                </div>
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
