export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-3 animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-80 mx-auto" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto" />
          </div>
        </div>
      </div>

      {/* Search + filter skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-2xl mx-auto" />
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-3 animate-pulse"
            >
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
