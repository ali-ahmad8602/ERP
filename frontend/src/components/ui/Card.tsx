import { cn } from "@/lib/utils";

export function Card({ children, className, hover, padding = "md" }: { children: React.ReactNode, className?: string, hover?: boolean, padding?: "sm" | "md" | "lg" | "none" }) {
  return (
    <div
      className={cn(
        "glass-card rounded-[12px] shadow-card",
        padding === "sm" && "p-3",
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
