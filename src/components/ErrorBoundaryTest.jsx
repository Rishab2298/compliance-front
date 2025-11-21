import { useState } from 'react';
import { Bug } from 'lucide-react';

/**
 * ErrorBoundaryTest Component
 *
 * A test component to verify that the ErrorBoundary is working correctly.
 * This component should ONLY be used in development for testing purposes.
 *
 * Usage:
 * 1. Import this component in your dev route/page
 * 2. Click the "Trigger Error" button
 * 3. Verify that the ErrorBoundary catches the error and displays the fallback UI
 * 4. Remove or comment out after testing
 *
 * DO NOT include this in production builds!
 */
const ErrorBoundaryTest = () => {
  const [shouldError, setShouldError] = useState(false);

  // This will trigger an error in the render phase
  if (shouldError) {
    throw new Error('Test Error: This is a simulated error to test the ErrorBoundary!');
  }

  const handleAsyncError = () => {
    // Simulate an async error (won't be caught by ErrorBoundary)
    setTimeout(() => {
      throw new Error('Async Error: This error happens outside React render cycle');
    }, 100);
  };

  const handlePromiseRejection = () => {
    // Simulate an unhandled promise rejection
    Promise.reject(new Error('Promise Rejection: This is an unhandled promise rejection'));
  };

  return (
    <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg max-w-2xl mx-auto my-8">
      <div className="flex items-center gap-3 mb-4">
        <Bug className="w-6 h-6 text-yellow-600" />
        <h2 className="text-xl font-bold text-yellow-900">
          Error Boundary Test Component
        </h2>
      </div>

      <div className="mb-4">
        <p className="text-sm text-yellow-800 mb-2">
          <strong>⚠️ Development Only:</strong> This component is for testing the ErrorBoundary.
        </p>
        <p className="text-sm text-yellow-700">
          Click the button below to trigger different types of errors and verify the ErrorBoundary behavior.
        </p>
      </div>

      <div className="space-y-3">
        {/* Render Error - Will be caught by ErrorBoundary */}
        <div className="bg-white p-4 rounded border border-yellow-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            1. Render Phase Error (Caught by ErrorBoundary ✅)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            This error occurs during component rendering and will be caught by the ErrorBoundary.
          </p>
          <button
            onClick={() => setShouldError(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
          >
            Trigger Render Error
          </button>
        </div>

        {/* Async Error - Won't be caught by ErrorBoundary */}
        <div className="bg-white p-4 rounded border border-yellow-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            2. Async Error (NOT caught by ErrorBoundary ❌)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Async errors happen outside React's render cycle. Check the console for the error.
          </p>
          <button
            onClick={handleAsyncError}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors font-medium"
          >
            Trigger Async Error
          </button>
        </div>

        {/* Promise Rejection - Won't be caught by ErrorBoundary */}
        <div className="bg-white p-4 rounded border border-yellow-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            3. Promise Rejection (NOT caught by ErrorBoundary ❌)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Unhandled promise rejections are logged to console but not caught by ErrorBoundary.
          </p>
          <button
            onClick={handlePromiseRejection}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-medium"
          >
            Trigger Promise Rejection
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">Testing Checklist:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Click "Trigger Render Error" - Should show ErrorBoundary fallback UI</li>
          <li>ErrorBoundary UI should display error message (in dev mode)</li>
          <li>ErrorBoundary should show "Reload Page" and "Go to Home" buttons</li>
          <li>In production mode, error details should be hidden</li>
          <li>Error should be logged to backend API (/api/log-error)</li>
          <li>Error should appear in browser console with full details</li>
        </ul>
      </div>

      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
        <p className="text-xs text-red-700 font-medium">
          ⚠️ IMPORTANT: Remove this component from production builds!
          It should only be used during development and testing.
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundaryTest;
