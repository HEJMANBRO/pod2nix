import { X } from "lucide-react";

/**
 * Component for displaying conversion errors with proper accessibility.
 * Shows error messages in a visually distinct alert box.
 */
interface ErrorDisplayProps {
  /** The error message to display */
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="max-w-2xl mx-auto mb-8" role="alert" aria-live="polite">
      <div className="bg-destructive/50 border border-destructive/50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <X className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <h3 className="text-destructive font-medium">Conversion Error</h3>
            <p className="text-destructive text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
