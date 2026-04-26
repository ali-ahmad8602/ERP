import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, icon, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2",
        className
      )}
    >
      {icon}
      {children}
    </div>
  );
}
