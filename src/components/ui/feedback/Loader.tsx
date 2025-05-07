import { SkipForward } from "lucide-react";

export function Loader({
  text = "Thinking...",
  variant = "spinner",
  onSkip,
}: {
  text?: string;
  variant?: "spinner" | "dots";
  onSkip?: () => void;
}) {
  if (variant === "dots") {
    return (
      <div className="inline-block px-3 py-2 rounded-lg addGlassmorphism-ai text-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100" />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200" />
          </div>
          <span className="text-gray-400">{text}</span>
          {onSkip && (
            <button
              className="ml-2 p-1 rounded hover:bg-zinc-700"
              onClick={onSkip}
              aria-label="Skip"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>
    );
  }
  // Default spinner
  return (
    <div className="inline-block px-3 py-2 rounded-lg addGlassmorphism-ai text-gray-100">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
        <span>{text}</span>
        {onSkip && (
          <button
            className="ml-2 p-1 rounded hover:bg-zinc-700"
            onClick={onSkip}
            aria-label="Skip"
          >
            <SkipForward className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
} 