export interface ErrorBannerProps {
  error: string | null;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) return null;
  return (
    <div className="p-2 text-red-500 text-xs text-center border-t border-neutral-800 bg-neutral-950">
      {error}
    </div>
  );
} 