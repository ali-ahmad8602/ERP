import { cn } from "@/lib/utils";

export function Card({ children, className, hover, padding = "md" }: { children: React.ReactNode, className?: string, hover?: boolean, padding?: "sm" | "md" | "lg" | "none" }) {
  return (
    <div
      className={cn(
        "bg-bg-surface rounded-2xl shadow-card ring-1 ring-black/5 dark:ring-white/[0.06]",
        padding === "sm" && "p-3.5",
        padding === "md" && "p-5",
        padding === "lg" && "p-6",
        padding === "none" && "p-0",
        hover && "card-hover cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
