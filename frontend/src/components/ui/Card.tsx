export function Card({ children, className, hover, padding = "md" }: { children: React.ReactNode, className?: string, hover?: boolean, padding?: "sm" | "md" | "lg" | "none" }) {
  const { cn } = require("@/lib/utils");
  return (
    <div
      className={cn(
        "bg-bg-surface rounded-[20px] shadow-[0_2px_14px_rgba(0,0,0,0.04)] ring-1 ring-black/5 dark:ring-white/10",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        padding === "none" && "p-0",
        hover && "transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] active:scale-[0.99] cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
