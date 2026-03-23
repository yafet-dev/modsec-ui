import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="text-center max-w-md">
        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
          Error 404
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-10">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:ring-gray-500 dark:focus:ring-gray-300 px-6 py-3 text-base"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-300 px-6 py-3 text-base"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
