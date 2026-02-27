'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Project } from '@/lib/projects';
import ProjectCard from '@/components/ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  allTags: string[];
}

export default function ProjectGrid({ projects, allTags }: ProjectGridProps) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedTags([]);
  };

  const hasActiveFilters = query.trim() !== '' || selectedTags.length > 0;

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Search filter
      const q = query.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        project.name.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.tags.some((t) => t.toLowerCase().includes(q));

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => project.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [projects, query, selectedTags]);

  const featured = filteredProjects.filter((p) => p.featured);
  const pinned = filteredProjects.filter((p) => p.pinned && !p.featured);
  const regular = filteredProjects.filter((p) => !p.featured && !p.pinned);

  return (
    <div>
      {/* Search + Filter */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects by name, description or tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Active filters indicator + Clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>
                Showing <strong className="text-gray-900 dark:text-white">{filteredProjects.length}</strong> of{' '}
                <strong className="text-gray-900 dark:text-white">{projects.length}</strong> projects
              </span>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No results */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No projects found
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try a different search term or remove some tag filters.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              ⭐ Featured Projects
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({featured.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* Pinned */}
        {pinned.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📌 Pinned Projects
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({pinned.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pinned.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </section>
        )}

        {/* All Projects */}
        {regular.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📦 All Projects
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({regular.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
