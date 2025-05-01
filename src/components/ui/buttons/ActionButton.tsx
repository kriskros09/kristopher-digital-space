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
      className={
        `flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-full border border-neutral-800 text-neutral-400 transition-colors ` +
        (disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-neutral-800 hover:text-white")
      }
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
} 