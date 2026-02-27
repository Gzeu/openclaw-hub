import { getAllProjects, getAllTags } from '@/lib/projects';
import ProjectGrid from '@/components/ProjectGrid';

export default async function Home() {
  const projects = await getAllProjects();
  const allTags = await getAllTags();

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
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {projects.length} projects available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Grid — Client Component */}
      <ProjectGrid projects={projects} allTags={allTags} />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Built with ❤️ for the OpenClaw community
          </p>
        </div>
      </footer>
    </main>
  );
}
