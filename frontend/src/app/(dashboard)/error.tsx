"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg-base p-8">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center">
          <AlertTriangle size={24} className="text-danger" />
        </div>
        <h2 className="text-[18px] font-bold text-text-primary tracking-tight">
          Something went wrong
        </h2>
        <p className="text-[14px] text-text-secondary leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="primary" size="sm" onClick={reset}>
            Try Again
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.location.href = "/dashboard"}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
