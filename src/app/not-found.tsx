export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          404 - Page Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          The page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go back home
        </a>
      </div>
    </div>
  );
}
