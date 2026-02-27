import { getAllProjects } from '@/lib/projects';
import ProjectCard from '@/components/ProjectCard';
import FilterBar from '@/components/FilterBar';
import SearchBar from '@/components/SearchBar';

export default async function Home() {
  const projects = await getAllProjects();

  // Get all unique tags
  const allTags = Array.from(
    new Set(projects.flatMap((p) => p.tags))
  ).sort();

  const featured = projects.filter((p) => p.featured);
  const pinned = projects.filter((p) => p.pinned);
  const regular = projects.filter((p) => !p.featured && !p.pinned);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              🎮 OpenClaw Hub
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Discover and explore AI agent projects built with OpenClaw
            </p>
          </div>
          
          <div className="mt-6 space-y-4">
            <SearchBar />
            <FilterBar tags={allTags} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Projects */}
        {featured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              ⭐ Featured Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* Pinned Projects */}
        {pinned.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📌 Pinned Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinned.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* All Projects */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            📦 All Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regular.map((project) => (
              <ProjectCard key={project.name} project={project} />
            ))}
          </div>
        </section>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No projects found. Add your first project to get started!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Built with ❤️ for the OpenClaw community
          </p>
        </div>
      </footer>
    </main>
  );
}
