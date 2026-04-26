import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, hover, glass, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[8px] shadow-xs",
        glass
          ? "bg-bg-glass backdrop-blur-xl border border-white/[0.06]"
          : "bg-bg-surface border border-border",
        padding === "none" && "p-0",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        hover && "transition-all duration-150 cursor-pointer hover:shadow-glow hover:-translate-y-px",
        className
      )}
    >
      {children}
    </div>
  );
}
