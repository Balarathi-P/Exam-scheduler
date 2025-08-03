interface LoadingOverlayProps {
  isLoading: boolean;
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 text-center max-w-sm w-full mx-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Generating Timetable
        </h3>
        <p className="text-sm text-gray-600">
          Please wait while we create your exam schedule...
        </p>
      </div>
    </div>
  );
}
