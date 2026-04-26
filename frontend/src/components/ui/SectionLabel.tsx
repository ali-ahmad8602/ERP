import { cn } from "@/lib/utils";

export function SectionLabel({ children, icon, className }: { children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-[11px] font-medium text-text-muted uppercase tracking-[0.04em] mb-2", className)}>
      {icon}{children}
    </div>
  );
}
