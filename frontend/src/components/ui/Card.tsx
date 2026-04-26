import { cn } from "@/lib/utils";

export function Card({ children, className, hover, padding = "md" }: { children: React.ReactNode, className?: string, hover?: boolean, padding?: "sm" | "md" | "lg" | "none" }) {
  return (
    <div
      className={cn(
        "bg-bg-surface border border-border rounded-[10px] shadow-card",
        padding === "sm" && "p-3.5",
        padding === "md" && "p-4",
        padding === "lg" && "p-5",
        padding === "none" && "p-0",
        hover && "card-hover cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
