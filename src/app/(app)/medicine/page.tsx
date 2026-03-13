"use client";

import { BatchScanForm } from "@/features/medicine/ui/batch-scan-form";
import { Shield } from "lucide-react";

export default function MedicinePage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/10">
            <Shield className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Verify Medicine Batch
          </h1>
          <p className="mt-1 text-muted-foreground">
            Enter a batch number to verify against the CDSCO database and check
            for recalls or counterfeits.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <BatchScanForm />
        </div>

        {/* Help Text */}
        <div className="mt-6 rounded-xl bg-muted/50 p-4">
          <h3 className="mb-2 text-sm font-medium">Where to find the batch number?</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The batch number (or lot number) is usually printed on the medicine
            packaging, often on the side or bottom of the box. It typically starts
            with &quot;B/No&quot;, &quot;Batch&quot; or &quot;Lot&quot; followed by alphanumeric characters.
          </p>
        </div>
      </div>
    </div>
  );
}
