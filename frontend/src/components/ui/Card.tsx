import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

export function Card({ children, className, hover, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-bg-surface border border-border-subtle rounded-card",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        padding === "none" && "p-0",
        hover && "transition-all duration-150 hover:border-border hover:bg-bg-elevated hover:-translate-y-px hover:shadow-card-hover cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
