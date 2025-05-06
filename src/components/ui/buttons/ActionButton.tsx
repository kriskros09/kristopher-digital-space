import { cn } from "@/lib/utils/twCn";
import { ReactNode } from "react";

export interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function ActionButton({ icon, label, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "gradient-border flex items-center gap-2 px-4 py-2 rounded-full text-white transition-colors",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-50 hover:text-white"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
} 